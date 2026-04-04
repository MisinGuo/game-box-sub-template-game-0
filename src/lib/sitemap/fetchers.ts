import ApiClient from '@/lib/api'
import type { SitemapUrl, ContentType } from './types'
import { sitemapConfig } from '@/config/sitemap/config'
import { generateAlternateUrls } from './generator'
import { defaultLocale } from '@/config/site/locales'
import { SiteSectionSlugGroups } from '@/config/pages/content'
import { getEnabledRoutes } from '@/config/site/routes'

const { contentTypes } = sitemapConfig

/**
 * 将后端返回的时间字符串（如 "2026-03-26 16:21:24"）规范化为 ISO 8601 格式
 * sitemap 标准要求 W3C Datetime 格式，Google 强制需要时区信息
 */
function toSitemapLastmod(value?: string | null): string {
  if (!value) return new Date().toISOString()
  // 已经是标准 ISO 格式（含 T）则直接返回
  if (value.includes('T')) return value
  // 将 "2026-03-26 16:21:24" 转为 "2026-03-26T16:21:24Z"
  return value.replace(' ', 'T') + 'Z'
}

const GAME_CATEGORY_PAGE_SIZE = 24
const GAME_API_PAGE_SIZE = 100
const GAME_FETCH_CONCURRENCY = 4
const GAME_SITEMAP_METRICS_TTL_MS = 60 * 1000
const DEFAULT_GAME_PAGE_CACHE_TTL_MS = 60 * 1000
const GAME_PAGE_CACHE_MAX_ENTRIES = 200

function readPositiveIntFromEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback
  }

  return parsed
}

const GAME_PAGE_CACHE_TTL_MS = readPositiveIntFromEnv(
  'SITEMAP_GAME_PAGE_CACHE_TTL_MS',
  DEFAULT_GAME_PAGE_CACHE_TTL_MS
)
const USE_WORKERS_DATA_CACHE = process.env.CLOUDFLARE_WORKERS === 'true'

function buildGamesPageRequestOptions(
  locale: string,
  pageNum: number,
  pageSize: number
): { cache?: RequestCache; next?: { revalidate?: number; tags?: string[] } } {
  if (USE_WORKERS_DATA_CACHE && GAME_PAGE_CACHE_TTL_MS > 0) {
    return {
      next: {
        revalidate: Math.max(1, Math.ceil(GAME_PAGE_CACHE_TTL_MS / 1000)),
        tags: [`sitemap-games-${locale}-${pageNum}-${pageSize}`],
      },
    }
  }

  return { cache: 'no-store' }
}

interface GameCategoryMeta {
  slug: string
  totalPages: number
}

interface GameSitemapMetrics {
  gameCount: number
  categoryMeta: GameCategoryMeta[]
}

interface GamePageCacheEntry {
  expiresAt: number
  rows: any[]
}

const gameSitemapMetricsCache = new Map<string, { expiresAt: number; data: GameSitemapMetrics }>()
const gamePageCache = new Map<string, GamePageCacheEntry>()
const gamePageInFlight = new Map<string, Promise<any[]>>()

function getGamePageCacheKey(locale: string, pageNum: number, pageSize: number): string {
  return `${locale}:${pageNum}:${pageSize}`
}

function trimGamePageCache(): void {
  if (gamePageCache.size <= GAME_PAGE_CACHE_MAX_ENTRIES) {
    return
  }

  const now = Date.now()
  gamePageCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) {
      gamePageCache.delete(key)
    }
  })

  while (gamePageCache.size > GAME_PAGE_CACHE_MAX_ENTRIES) {
    let oldestKey: string | undefined
    gamePageCache.forEach((_entry, key) => {
      if (!oldestKey) {
        oldestKey = key
      }
    })
    if (!oldestKey) {
      break
    }
    gamePageCache.delete(oldestKey)
  }
}

async function getGamesPageRowsCached(locale: string, pageNum: number, pageSize: number): Promise<any[]> {
  const cacheKey = getGamePageCacheKey(locale, pageNum, pageSize)
  const now = Date.now()

  const cached = gamePageCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.rows
  }

  const inFlight = gamePageInFlight.get(cacheKey)
  if (inFlight) {
    return inFlight
  }

  const requestPromise = ApiClient.getGames(
    {
      locale: locale as any,
      pageNum,
      pageSize,
    },
    buildGamesPageRequestOptions(locale, pageNum, pageSize)
  )
    .then((resp) => {
      const rows = resp.rows || []
      gamePageCache.set(cacheKey, {
        expiresAt: Date.now() + GAME_PAGE_CACHE_TTL_MS,
        rows,
      })
      trimGamePageCache()
      return rows
    })
    .finally(() => {
      gamePageInFlight.delete(cacheKey)
    })

  gamePageInFlight.set(cacheKey, requestPromise)
  return requestPromise
}

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length || 1))
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function runOne(): Promise<void> {
    while (true) {
      const current = nextIndex
      nextIndex += 1

      if (current >= items.length) {
        return
      }

      results[current] = await worker(items[current])
    }
  }

  await Promise.all(Array.from({ length: safeConcurrency }, () => runOne()))
  return results
}

function extractTotalCount(response: any): number | null {
  const candidates = [
    response?.total,
    response?.data?.total,
    response?.data?.count,
    response?.data?.records,
  ]

  for (const candidate of candidates) {
    const parsed = Number(candidate)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }

  return null
}

async function resolveGameCount(locale: string): Promise<number> {
  const firstPage = await ApiClient.getGames(
    {
      locale: locale as any,
      pageNum: 1,
      pageSize: GAME_API_PAGE_SIZE,
    },
    { cache: 'no-store' }
  )

  const firstRows = firstPage.rows || []
  const totalCount = extractTotalCount(firstPage)

  if (totalCount !== null && totalCount > firstRows.length) {
    return totalCount
  }
  if (firstRows.length < GAME_API_PAGE_SIZE) {
    return firstRows.length
  }

  let total = firstRows.length
  let pageNum = 2
  while (true) {
    const resp = await ApiClient.getGames(
      {
        locale: locale as any,
        pageNum,
        pageSize: GAME_API_PAGE_SIZE,
      },
      { cache: 'no-store' }
    )
    const rows = resp.rows || []
    total += rows.length
    if (rows.length < GAME_API_PAGE_SIZE) {
      break
    }
    pageNum += 1
    if (pageNum > 100000) {
      break
    }
  }

  return total
}

function normalizeCount(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function getGameCountFromHomeResponse(homeResponse: any): number {
  return normalizeCount(homeResponse?.data?.statistics?.gameCount)
}

/**
 * 从 routes.ts 配置获取静态路径
 * 这是唯一的静态路由数据来源，适用于所有环境
 */
function getStaticPaths(): string[] {
  const paths = getEnabledRoutes()
    .map((route) => route.path?.trim())
    .filter((path): path is string => Boolean(path) && path.startsWith('/'))

  return Array.from(new Set(paths)).sort((a, b) => a.localeCompare(b))
}

async function fetchArticlesBySections(locale: string, sections: readonly string[]): Promise<any[]> {
  const articleMap = new Map<number, any>()

  for (const section of sections) {
    try {
      const response = await ApiClient.getArticles({
        locale: locale as any,
        pageNum: 1,
        pageSize: 10000,
        section: section as any,
      })

      if (response.code === 200 && response.rows) {
        for (const article of response.rows) {
          if (article?.id) {
            articleMap.set(article.masterArticleId, article)
          }
        }
      }
    } catch (error) {
      console.warn(`[Sitemap] 获取 section=${section} 文章失败:`, error)
    }
  }

  return Array.from(articleMap.values())
}

/**
 * 开发模式：校验 routes.ts 是否遗漏了 page.tsx 静态页面
 * 仅在 dev 环境运行（生产环境无文件系统，不执行）
 */
let devCheckDone = false
async function devCheckMissingRoutes(): Promise<void> {
  if (process.env.NODE_ENV !== 'development' || devCheckDone) return
  devCheckDone = true

  try {
    const { readdir } = await import('node:fs/promises')
    const path = await import('node:path')
    const localeAppDir = path.join(process.cwd(), 'src', 'app', '[locale]')

    const pageFiles: string[] = []
    const collect = async (dir: string) => {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          await collect(fullPath)
        } else if (entry.name === 'page.tsx') {
          pageFiles.push(fullPath)
        }
      }
    }
    await collect(localeAppDir)

    // 解析为路由路径，排除动态路由
    const discoveredPaths = new Set<string>()
    for (const filePath of pageFiles) {
      const rel = path.relative(localeAppDir, filePath).replace(/\\/g, '/')
      if (rel === 'page.tsx') {
        discoveredPaths.add('/')
        continue
      }
      if (!rel.endsWith('/page.tsx')) continue
      const segments = rel.slice(0, -'/page.tsx'.length).split('/').filter(Boolean)
      if (segments.some(s => s.startsWith('[') || s.startsWith('@') || s.startsWith('_'))) continue
      const urlSegments = segments.filter(s => !(s.startsWith('(') && s.endsWith(')')))
      discoveredPaths.add(urlSegments.length === 0 ? '/' : `/${urlSegments.join('/')}`)
    }

    const configuredPaths = new Set(getStaticPaths())
    const missing = Array.from(discoveredPaths).filter(p => !configuredPaths.has(p))

    if (missing.length > 0) {
      console.warn(
        `\n⚠️  [Sitemap] routes.ts 中缺少以下静态页面路由，请及时补充：\n` +
        missing.map(p => `   - ${p}`).join('\n') + '\n'
      )
    }
  } catch {
    // 忽略扫描失败（不影响正常功能）
  }
}

/**
 * 获取静态页面 URLs
 */
export async function fetchStaticUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  // 开发模式下异步校验（不阻塞返回）
  devCheckMissingRoutes()

  const staticPaths = getStaticPaths()
  
  const config = contentTypes.static
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`
  
  return staticPaths.map((path) => ({
    loc: `${hostname}${localePrefix}${path}`,
    lastmod: new Date().toISOString(),
    changefreq: config.changefreq as any,
    priority: config.priority,
    alternates: generateAlternateUrls(path, hostname),
  }))
}

/**
 * 获取游戏 URLs
 */
export async function fetchGameUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  try {
    console.log('[Sitemap] 开始获取游戏列表...')
    
    // 从 API 获取所有游戏
    // 使用关联模式查询：自有游戏 + 默认配置游戏（未排除的） + 跨站共享游戏（已include的）
    const response = await ApiClient.getGames({
      locale: locale as any,
      pageNum: 1,
      pageSize: 10000, // 获取所有
    })
    
    console.log('[Sitemap] 游戏API响应:', {
      code: response.code,
      total: response.total,
      rowsLength: response.rows?.length,
      hasRows: !!response.rows,
      firstGame: response.rows?.[0] ? { id: response.rows[0].id, name: response.rows[0].name } : null
    })
    
    const games = response.rows || []
    console.log('[Sitemap] 解析游戏数组，长度:', games.length)
    const config = contentTypes.games
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`
    
    const urls: SitemapUrl[] = []
    
    // 游戏详情页
    for (const game of games) {
      const path = `/games/${game.id}`
      urls.push({
        loc: `${hostname}${localePrefix}${path}`,
        lastmod: toSitemapLastmod(game.updateTime),
        changefreq: config.changefreq as any,
        priority: config.priority,
        alternates: generateAlternateUrls(path, hostname),
      })
    }
    
    console.log('[Sitemap] 生成了 %d 个游戏详情页URL', urls.length)
    
    // 游戏分类页
    try {
      const categoriesResponse = await ApiClient.getCategories({ 
        categoryType: 'game',
        locale: locale as any,
      })
      
      const categories = categoriesResponse.data || []
      for (const category of categories) {
        // 使用 slug 而不是 id，因为路由是 /games/category/[slug]
        const slug = category.slug || category.id
        const path = `/games/category/${slug}`
        urls.push({
          loc: `${hostname}${localePrefix}${path}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly' as any,
          priority: 0.7,
          alternates: generateAlternateUrls(path, hostname),
        })

        // 分类分页页（第 1 页为分类根路径，不追加 page 参数）
        const categoryGamesResponse = await ApiClient.getCategoryGames(category.id, {
          locale: locale as any,
          pageNum: 1,
          pageSize: 1,
        })
        const total = Math.max(Number(categoryGamesResponse.total || categoryGamesResponse.rows?.length || 0), 0)
        const totalPages = Math.max(Math.ceil(total / GAME_CATEGORY_PAGE_SIZE), 1)

        for (let page = 2; page <= totalPages; page += 1) {
          const pagedPath = `${path}?page=${page}`
          urls.push({
            loc: `${hostname}${localePrefix}${pagedPath}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly' as any,
            priority: 0.6,
            alternates: generateAlternateUrls(pagedPath, hostname),
          })
        }
      }
    } catch (error) {
      console.warn('获取游戏分类失败:', error)
    }
    
    return urls
  } catch (error) {
    console.error('Error fetching game URLs:', error)
    return []
  }
}

async function getGameCategoryMeta(locale: string): Promise<GameCategoryMeta[]> {
  const categoriesResponse = await ApiClient.getCategories({
    categoryType: 'game',
    locale: locale as any,
  })

  const categories = (categoriesResponse.data || []) as any[]

  const result: GameCategoryMeta[] = categories.map((category: any) => {
    const categoryCount = normalizeCount(
      category.relatedDataCount ?? category.count ?? category.gameCount ?? category.total
    )

    return {
      slug: String(category.slug || category.id),
      totalPages: Math.max(Math.ceil(categoryCount / GAME_CATEGORY_PAGE_SIZE), 1),
    }
  })

  return result
}


async function getGameSitemapMetrics(locale: string): Promise<GameSitemapMetrics> {
  const now = Date.now()
  const cached = gameSitemapMetricsCache.get(locale)
  if (cached && cached.expiresAt > now) {
    return cached.data
  }

  const [homeResponse, categoryMeta] = await Promise.all([
    ApiClient.getHomeData({
      locale: locale as any,
      strategyCount: 1,
      hotGamesCount: 1,
      articleCount: 1,
    }),
    getGameCategoryMeta(locale),
  ])

  let gameCount = getGameCountFromHomeResponse(homeResponse)

  // 兜底：仅当首页统计缺失时才触发重型统计，避免 sitemap 常态化慢查询。
  if (gameCount <= 0) {
    const firstPage = await ApiClient.getGames(
      {
        locale: locale as any,
        pageNum: 1,
        pageSize: 1,
      },
      { cache: 'no-store' }
    )

    const fallbackCount = extractTotalCount(firstPage)
    gameCount = fallbackCount !== null ? fallbackCount : await resolveGameCount(locale)
  }

  const data: GameSitemapMetrics = { gameCount, categoryMeta }
  gameSitemapMetricsCache.set(locale, {
    expiresAt: now + GAME_SITEMAP_METRICS_TTL_MS,
    data,
  })

  return data
}

function buildGameDetailSitemapUrl(game: any, localePrefix: string, hostname: string): SitemapUrl {
  const path = `/games/${game.id}`
  return {
    loc: `${hostname}${localePrefix}${path}`,
    lastmod: toSitemapLastmod(game.updateTime),
    changefreq: contentTypes.games.changefreq as any,
    priority: contentTypes.games.priority,
    alternates: generateAlternateUrls(path, hostname),
  }
}

function buildGameCategorySitemapUrl(slug: string, page: number, localePrefix: string, hostname: string): SitemapUrl {
  const basePath = `/games/category/${slug}`
  const path = page <= 1 ? basePath : `${basePath}?page=${page}`
  return {
    loc: `${hostname}${localePrefix}${path}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly' as any,
    priority: page <= 1 ? 0.7 : 0.6,
    alternates: generateAlternateUrls(path, hostname),
  }
}

/**
 * 获取 games 类型 sitemap 的分片数量（不构造全量 URL，避免 CPU 超时）
 */
export async function getGameSitemapChunkCount(locale: string): Promise<number> {
  const { gameCount, categoryMeta } = await getGameSitemapMetrics(locale)
  const categoryPageCount = categoryMeta.reduce((sum, item) => sum + item.totalPages, 0)

  const totalUrls = gameCount + categoryPageCount
  const perFile = Math.max(1, sitemapConfig.maxUrlsPerSitemap)
  return Math.max(1, Math.ceil(totalUrls / perFile))
}

/**
 * 仅供主 sitemap 索引使用的轻量分片估算：
 * 用首页统计的 gameCount + 分类数量估算总 URL，避免在 /sitemap.xml 中触发重型分页扫描。
 */
export async function getGameSitemapChunkCountForIndex(locale: string): Promise<number> {
  try {
    const [homeResponse, categoriesResponse] = await Promise.all([
      ApiClient.getHomeData({
        locale: locale as any,
        strategyCount: 1,
        hotGamesCount: 1,
        articleCount: 1,
      }),
      ApiClient.getCategories({
        categoryType: 'game',
        locale: locale as any,
      }),
    ])

    const gameCount = Math.max(Number(homeResponse?.data?.statistics?.gameCount || 0), 0)
    const categoryCount = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data.length : 0

    // 主索引只需粗粒度估算，精确分片在 games sitemap 请求中由重型逻辑兜底
    const estimatedTotalUrls = gameCount + categoryCount
    const perFile = Math.max(1, sitemapConfig.maxUrlsPerSitemap)
    return Math.max(1, Math.ceil(estimatedTotalUrls / perFile))
  } catch {
    return 1
  }
}

/**
 * 按分片获取 games 类型 sitemap URLs（按需构造，避免一次生成全量）
 */
export async function fetchGameUrlsByChunk(
  locale: string,
  hostname: string,
  chunk: number
): Promise<{ urls: SitemapUrl[]; chunkCount: number }> {
  const perFile = Math.max(1, sitemapConfig.maxUrlsPerSitemap)
  const safeChunk = Math.max(1, chunk)
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`

  const { gameCount, categoryMeta } = await getGameSitemapMetrics(locale)
  const categoryPageCount = categoryMeta.reduce((sum, item) => sum + item.totalPages, 0)

  const totalUrls = gameCount + categoryPageCount
  const chunkCount = Math.max(1, Math.ceil(totalUrls / perFile))
  if (safeChunk > chunkCount) {
    return { urls: [], chunkCount }
  }

  const start = (safeChunk - 1) * perFile
  const end = Math.min(start + perFile, totalUrls)
  const urls: SitemapUrl[] = []

  // A. 游戏详情页区间
  if (start < gameCount) {
    const detailStart = start
    const detailEnd = Math.min(end, gameCount)

    const firstPage = Math.floor(detailStart / GAME_API_PAGE_SIZE) + 1
    const lastPage = Math.floor((detailEnd - 1) / GAME_API_PAGE_SIZE) + 1

    const pages = Array.from({ length: lastPage - firstPage + 1 }, (_, idx) => firstPage + idx)
    const pageRows = await mapWithConcurrency(
      pages,
      async (page) => getGamesPageRowsCached(locale, page, GAME_API_PAGE_SIZE),
      GAME_FETCH_CONCURRENCY
    )

    const games = pageRows.flat()

    const offset = detailStart - (firstPage - 1) * GAME_API_PAGE_SIZE
    const needed = detailEnd - detailStart
    const slice = games.slice(offset, offset + needed)

    for (const game of slice) {
      urls.push(buildGameDetailSitemapUrl(game, localePrefix, hostname))
    }
  }

  // B. 分类（含分页）区间
  if (end > gameCount) {
    const categoryStart = Math.max(0, start - gameCount)
    const categoryEnd = end - gameCount
    let idx = 0
    let done = false

    for (const category of categoryMeta) {
      for (let page = 1; page <= category.totalPages; page += 1) {
        if (idx >= categoryEnd) {
          done = true
          break
        }
        if (idx >= categoryStart) {
          urls.push(buildGameCategorySitemapUrl(category.slug, page, localePrefix, hostname))
        }
        idx += 1
      }
      if (done) {
        break
      }
    }
  }

  return { urls, chunkCount }
}

/**
 * 获取盒子 URLs
 */
export async function fetchBoxUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  try {
    const response = await ApiClient.getBoxes({
      locale: locale as any,
      pageNum: 1,
      pageSize: 10000,
    })
    
    const boxes = response.rows || []
    const config = contentTypes.boxes
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`
    
    const urls: SitemapUrl[] = []
    
    for (const box of boxes) {
      // 盒子详情页
      const detailPath = `/boxes/${box.id}`
      urls.push({
        loc: `${hostname}${localePrefix}${detailPath}`,
        lastmod: toSitemapLastmod(box.updateTime),
        changefreq: config.changefreq as any,
        priority: config.priority,
        alternates: generateAlternateUrls(detailPath, hostname),
      })
      
      // 盒子下载页
      const downloadPath = `/boxes/${box.id}/download`
      urls.push({
        loc: `${hostname}${localePrefix}${downloadPath}`,
        lastmod: toSitemapLastmod(box.updateTime),
        changefreq: config.changefreq as any,
        priority: 0.7,
        alternates: generateAlternateUrls(downloadPath, hostname),
      })
    }
    
    return urls
  } catch (error) {
    console.error('Error fetching box URLs:', error)
    return []
  }
}

/**
 * 获取攻略文章 URLs
 */
export async function fetchGuidesUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  try {
    const articles = await fetchArticlesBySections(locale, SiteSectionSlugGroups.guides as readonly string[])
    const config = contentTypes.guides
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`
    
    return articles.map((article: any) => {
      const path = `/content/guides/${article.masterArticleId}`
      return {
        loc: `${hostname}${localePrefix}${path}`,
        lastmod: toSitemapLastmod(article.updateTime),
        changefreq: config.changefreq as any,
        priority: config.priority,
        alternates: generateAlternateUrls(path, hostname),
      }
    })
  } catch (error) {
    console.error('Error fetching guides URLs:', error)
    return []
  }
}

/**
 * 获取资讯文章 URLs
 */
export async function fetchNewsUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  try {
    const articles = await fetchArticlesBySections(locale, SiteSectionSlugGroups.news as readonly string[])
    const config = contentTypes.news
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`
    
    return articles.map((article: any) => {
      const path = `/news/${article.masterArticleId}`
      return {
        loc: `${hostname}${localePrefix}${path}`,
        lastmod: toSitemapLastmod(article.updateTime),
        changefreq: config.changefreq as any,
        priority: config.priority,
        alternates: generateAlternateUrls(path, hostname),
      }
    })
  } catch (error) {
    console.error('Error fetching news URLs:', error)
    return []
  }
}

/**
 * 获取评测文章 URLs
 */
export async function fetchReviewsUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  try {
    const articles = await fetchArticlesBySections(locale, SiteSectionSlugGroups.reviews as readonly string[])
    const config = contentTypes.reviews
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`

    return articles.map((article: any) => {
      const path = `/content/reviews/${article.masterArticleId}`
      return {
        loc: `${hostname}${localePrefix}${path}`,
        lastmod: toSitemapLastmod(article.updateTime),
        changefreq: config.changefreq as any,
        priority: config.priority,
        alternates: generateAlternateUrls(path, hostname),
      }
    })
  } catch (error) {
    console.error('Error fetching reviews URLs:', error)
    return []
  }
}

/**
 * 获取专题文章 URLs
 */
export async function fetchTopicsUrls(locale: string, hostname: string): Promise<SitemapUrl[]> {
  try {
    const articles = await fetchArticlesBySections(locale, SiteSectionSlugGroups.topics as readonly string[])
    const config = contentTypes.topics
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`

    return articles.map((article: any) => {
      const path = `/content/topics/${article.masterArticleId}`
      return {
        loc: `${hostname}${localePrefix}${path}`,
        lastmod: toSitemapLastmod(article.updateTime),
        changefreq: config.changefreq as any,
        priority: config.priority,
        alternates: generateAlternateUrls(path, hostname),
      }
    })
  } catch (error) {
    console.error('Error fetching topics URLs:', error)
    return []
  }
}

/**
 * 根据类型获取 URLs
 */
export async function fetchUrlsByType(
  locale: string,
  type: ContentType,
  hostname: string
): Promise<SitemapUrl[]> {
  console.log(`[Sitemap] 获取 ${locale} 的 ${type} URLs...`)
  
  switch (type) {
    case 'static':
      return fetchStaticUrls(locale, hostname)
    case 'games':
      return fetchGameUrls(locale, hostname)
    case 'boxes':
      return fetchBoxUrls(locale, hostname)
    case 'guides':
      return fetchGuidesUrls(locale, hostname)
    case 'reviews':
      return fetchReviewsUrls(locale, hostname)
    case 'topics':
      return fetchTopicsUrls(locale, hostname)
    case 'news':
      return fetchNewsUrls(locale, hostname)
    default:
      return []
  }
}
