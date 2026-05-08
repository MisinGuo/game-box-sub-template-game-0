import { NextResponse } from 'next/server'
import { generateSitemapIndex, getSitemapChunkCount } from '@/lib/sitemap/generator'
import { fetchUrlsByType, fetchStaticUrls } from '@/lib/sitemap/fetchers'
import { sitemapConfig } from '@/config/sitemap/config'
import { supportedLocales } from '@/config/site/locales'
import { getSecureHostname } from '@/lib/sitemap/security'
import type { ContentType } from '@/lib/sitemap/types'

/**
 * 主 sitemap 索引
 * 路由: /sitemap.xml
 * 包含所有语言的 sitemap 链接（两层结构：索引 → urlset，不嵌套 sitemapindex）
 */

export const dynamic = 'auto'
// revalidate 用固定值（Next.js 要求编译期常量），实际 TTL 由 SITEMAP_CACHE_TTL_SECONDS 控制
export const revalidate = 86400

const validTypes = Object.keys(sitemapConfig.contentTypes) as ContentType[]

const USE_WORKERS_EDGE_CACHE = process.env.CLOUDFLARE_WORKERS === 'true'

function readPositiveIntFromEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

// 读取环境变量，默认 86400 秒（24 小时）
const SITEMAP_CACHE_TTL_SECONDS = readPositiveIntFromEnv('SITEMAP_RESPONSE_CACHE_TTL_SECONDS', 86400)

function getSitemapCacheControl(): string {
  if (process.env.NODE_ENV === 'development') return 'no-store, max-age=0'
  const ttl = SITEMAP_CACHE_TTL_SECONDS
  return `public, s-maxage=${ttl}, stale-while-revalidate=86400`
}

function getWorkersEdgeCache(): Cache | null {
  if (!USE_WORKERS_EDGE_CACHE || SITEMAP_CACHE_TTL_SECONDS <= 0) return null
  return (globalThis as any)?.caches?.default as Cache | null ?? null
}

export async function GET(request: Request) {
  // Workers Edge Cache：命中则直接返回，避免重复拉取数据
  const edgeCache = getWorkersEdgeCache()
  if (edgeCache) {
    const cached = await edgeCache.match(request)
    if (cached) {
      const headers = new Headers(cached.headers)
      headers.set('X-Sitemap-Worker-Cache', 'HIT')
      return new NextResponse(cached.body, { status: cached.status, headers })
    }
  }

  try {
    // 验证并获取安全的 hostname（防止内容被盗用）
    const hostname = getSecureHostname(request)
    const fallback = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z'

    const entries: { locale: string; type: ContentType; chunk: number; lastmod?: string }[] = []

    const articleTypes = new Set<string>(['guides', 'reviews', 'news'])
    const nonStaticTypes = validTypes.filter((t) => t !== 'static')

    // 按 locale 并行处理：先拉非 static 类型，从文章结果提取最新日期，再生成 static（避免重复拉文章）
    const tasks = supportedLocales.map(async (locale) => {
      const settled = await Promise.allSettled(
        nonStaticTypes.map((type) =>
          fetchUrlsByType(locale, type, hostname).then((urls) => ({ type, urls }))
        )
      )

      let latestArticleDate: string | undefined

      for (const result of settled) {
        if (result.status !== 'fulfilled') continue
        const { type, urls } = result.value

        // 从文章类型中提取最新 lastmod，供 static 页复用
        if (articleTypes.has(type)) {
          const latest = urls.map((u) => u.lastmod ?? '').filter(Boolean).sort().at(-1)
          if (latest && (!latestArticleDate || latest > latestArticleDate)) {
            latestArticleDate = latest
          }
        }

        if (urls.length === 0) continue
        const chunkCount = getSitemapChunkCount(urls.length)
        const latestLastmod = urls.map((u) => u.lastmod ?? '').filter(Boolean).sort().at(-1) ?? fallback
        for (let chunk = 1; chunk <= chunkCount; chunk++) {
          entries.push({ locale, type: type as ContentType, chunk, lastmod: latestLastmod })
        }
      }

      // 用已知的文章最新日期生成 static 页，不额外发请求
      const staticUrls = await fetchStaticUrls(locale, hostname, latestArticleDate)
      if (staticUrls.length > 0) {
        const chunkCount = getSitemapChunkCount(staticUrls.length)
        const latestLastmod = staticUrls.map((u) => u.lastmod ?? '').filter(Boolean).sort().at(-1) ?? fallback
        for (let chunk = 1; chunk <= chunkCount; chunk++) {
          entries.push({ locale, type: 'static', chunk, lastmod: latestLastmod })
        }
      }
    })
    await Promise.all(tasks)

    const maxLocPerIndex = 50000
    if (entries.length > maxLocPerIndex) {
      console.error(`[Sitemap] 主索引超限 entries=${entries.length}`)
      return new NextResponse('主索引超出限制', { status: 500 })
    }

    console.log('[Sitemap] 生成主索引 sitemap.xml，共', entries.length, '条')
    const xml = generateSitemapIndex(hostname, entries)

    const response = new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': getSitemapCacheControl(),
        'X-Sitemap-Worker-Cache': 'MISS',
      },
    })

    // 写入 Workers Edge Cache，下次请求直接命中
    if (edgeCache) {
      await edgeCache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.error('生成主 sitemap 索引失败:', error)
    return new NextResponse('生成 sitemap 失败', { status: 500 })
  }
}

