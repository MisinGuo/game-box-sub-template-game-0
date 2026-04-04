import { Metadata } from 'next'
import { Suspense, cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, ArrowLeft, Grid3x3, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ImageWithFallback from '../../../ImageWithFallback'
import { backendConfig } from '@/config/api/backend'
import { defaultLocale, isValidLocale, getTranslation, supportedLocales, type Locale } from '@/config/site/locales'

import ApiClient from '@/lib/api'
import CategoryIntroduction from '@/components/category/CategoryIntroduction'
import CategoryGifts from '@/components/category/CategoryGifts'
import RelatedCategories from '@/components/category/RelatedCategories'
import { generateCollectionPageJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'

// 游戏类型
interface Game {
  id: number
  name: string
  description?: string
  categoryName?: string
  iconUrl?: string
  status?: string
}

// 分类类型
interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  description?: string
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ source?: string; page?: string }>
}

interface CategoryGamesPageData {
  games: Game[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

const CATEGORY_PAGE_SIZE = 24

// 获取分类信息（回退方案）并缓存 - 24小时缓存分类列表
const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  try {
    const url = `${backendConfig.baseURL}/api/public/categories?siteId=${backendConfig.siteId}&categoryType=game`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Site-Id': String(backendConfig.siteId),
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    
    if (result.code !== 200 || !result.data) {
      return null
    }
    
    const categories = result.data
    const category = categories.find((cat: any) => cat.slug === slug)
    
    return category ? {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon || '🎮',
      description: category.description
    } : null
  } catch (error) {
    console.error('[获取分类失败]', error)
    return null
  }
})

function normalizePage(page?: string): number {
  const pageNum = Number(page)
  if (!Number.isFinite(pageNum) || pageNum < 1) return 1
  return Math.floor(pageNum)
}

function buildPageHref(locale: Locale, slug: string, pageNum: number, source?: string): string {
  const base = locale === defaultLocale
    ? `/games/category/${slug}`
    : `/${locale}/games/category/${slug}`

  const params = new URLSearchParams()
  if (source) params.set('source', source)
  if (pageNum > 1) params.set('page', String(pageNum))
  const query = params.toString()

  return query ? `${base}?${query}` : base
}

function getVisiblePageItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: Array<number | 'ellipsis'> = [1]
  const left = Math.max(2, currentPage - 1)
  const right = Math.min(totalPages - 1, currentPage + 1)

  if (left > 2) {
    items.push('ellipsis')
  }

  for (let i = left; i <= right; i++) {
    items.push(i)
  }

  if (right < totalPages - 1) {
    items.push('ellipsis')
  }

  items.push(totalPages)
  return items
}

function GameGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 mb-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="w-full aspect-square bg-slate-800 rounded-lg animate-pulse mb-3" />
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatedCategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="h-10 w-10 bg-slate-800 rounded-full animate-pulse mb-3" />
            <div className="h-4 w-20 bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

// 获取分类游戏分页列表（用于全部游戏展示）
const getCategoryGamesPage = cache(async (
  categoryId: number,
  locale: string,
  pageNum: number = 1,
  pageSize: number = CATEGORY_PAGE_SIZE,
): Promise<CategoryGamesPageData> => {
  try {
    const response = await ApiClient.getCategoryGames(categoryId, {
      locale: locale as any,
      pageSize,
      pageNum,
    })
    
    if (response.code !== 200 || !response.rows) {
      return {
        games: [],
        total: 0,
        pageNum,
        pageSize,
        totalPages: 1,
      }
    }

    const total = Math.max(Number(response.total || response.rows.length || 0), 0)
    const totalPages = Math.max(Math.ceil(total / pageSize), 1)

    return {
      games: response.rows,
      total,
      pageNum,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error('[获取游戏列表失败]', error)
    return {
      games: [],
      total: 0,
      pageNum,
      pageSize,
      totalPages: 1,
    }
  }
})

// 异步组件：游戏列表区域
async function AllGamesListSection({ 
  categoryId, 
  categoryName,
  locale,
  currentPage,
  slug,
  source,
}: { 
  categoryId: number
  categoryName: string
  locale: Locale
  currentPage: number
  slug: string
  source?: string
}) {
  const gamesPageData = await getCategoryGamesPage(categoryId, locale, currentPage, CATEGORY_PAGE_SIZE)
  const allGames = gamesPageData.games
  const safeCurrentPage = Math.min(gamesPageData.pageNum, gamesPageData.totalPages)
  const prevPageHref = safeCurrentPage > 1
    ? buildPageHref(locale, slug, safeCurrentPage - 1, source)
    : null
  const nextPageHref = safeCurrentPage < gamesPageData.totalPages
    ? buildPageHref(locale, slug, safeCurrentPage + 1, source)
    : null
  const pageItems = getVisiblePageItems(safeCurrentPage, gamesPageData.totalPages)

  return (
    <section className="all-games mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <Grid3x3 className="inline h-7 w-7 text-blue-500 mr-2" />
            {locale === 'en-US'
              ? `All ${categoryName} Games`
              : locale === 'zh-TW'
              ? `全部${categoryName}遊戲`
              : `全部${categoryName}游戏`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === 'en-US'
              ? `${gamesPageData.total} ${getTranslation('gamesCount', locale)}`
              : `共${gamesPageData.total}${getTranslation('gamesCount', locale)}`}
          </p>
        </div>
      </div>

      {allGames.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Grid3x3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{getTranslation('noCategoryGames', locale)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {allGames.map((game) => {
            const gameLink = locale === defaultLocale ? `/games/${game.id}` : `/${locale}/games/${game.id}`
            return (
              <Link
                key={game.id}
                href={gameLink}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105">
                  <CardContent className="p-4">
                    {/* 游戏图标 */}
                    <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                      {game.iconUrl ? (
                        <ImageWithFallback
                          src={game.iconUrl}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* 游戏名称 */}
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    
                    {/* 游戏描述 */}
                    {game.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {game.description}
                      </p>
                    )}
                    
                    {/* 状态标签 */}
                    {game.status && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {game.status}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {gamesPageData.totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {prevPageHref ? (
            <Link href={prevPageHref}>
              <Button variant="outline" size="sm">
                {locale === 'en-US' ? 'Previous' : locale === 'zh-TW' ? '上一頁' : '上一页'}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              {locale === 'en-US' ? 'Previous' : locale === 'zh-TW' ? '上一頁' : '上一页'}
            </Button>
          )}

          {pageItems.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <Button key={`ellipsis-${index}`} variant="ghost" size="sm" disabled>
                  ...
                </Button>
              )
            }

            const href = buildPageHref(locale, slug, item, source)
            const isActive = item === safeCurrentPage
            return (
              <Link key={item} href={href}>
                <Button variant={isActive ? 'default' : 'outline'} size="sm">
                  {item}
                </Button>
              </Link>
            )
          })}

          {nextPageHref ? (
            <Link href={nextPageHref}>
              <Button variant="outline" size="sm">
                {locale === 'en-US' ? 'Next' : locale === 'zh-TW' ? '下一頁' : '下一页'}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              {locale === 'en-US' ? 'Next' : locale === 'zh-TW' ? '下一頁' : '下一页'}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

// 异步组件：相关分类区域
async function CategoryRelatedSection({
  slug,
  locale,
}: {
  slug: string
  locale: string
}) {
  try {
    const response = await ApiClient.getCategories({
      locale: locale as any,
      categoryType: 'game',
    })
    
    let relatedCategories: any[] = []
    if (response.code === 200 && response.data) {
      relatedCategories = response.data
        .filter((cat: any) => cat.slug !== slug)
        .slice(0, 4)
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || '🎮',
          gamesCount: Math.floor(Math.random() * 50) + 10,
        }))
    }

    if (relatedCategories.length === 0) {
      return null
    }

    return (
      <RelatedCategories
        categories={relatedCategories}
        locale={locale}
        defaultLocale={defaultLocale}
      />
    )
  } catch (error) {
    console.error('[获取相关分类失败]', error)
    return null
  }
}

// 生成元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: getTranslation('noData', locale as Locale),
    }
  }

  const localeTyped = locale as Locale
  const categoryUrl = localeTyped === defaultLocale
    ? `/games/category/${slug}`
    : `/${localeTyped}/games/category/${slug}`

  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? `/games/category/${slug}` : `/${l}/games/category/${slug}`
  })
  languages['x-default'] = `/games/category/${slug}`

  const alternates = { canonical: categoryUrl, languages }

  if (locale === 'en-US') {
    return {
      title: `${category.name} Games - Top Picks & Rankings - GameBox`,
      description: category.description ||
        `Discover high-quality ${category.name} games, rankings, and fast downloads on GameBox.`,
      keywords: [
        `${category.name} games`,
        `${category.name} mobile games`,
        `${category.name} recommendations`,
        `best ${category.name} games`,
      ].join(','),
      alternates,
    }
  }

  const isTW = locale === 'zh-TW'
  return {
    title: isTW
      ? `${category.name}遊戲推薦_2026最新${category.name}手遊排行榜-遊戲盒子`
      : `${category.name}游戏推荐_2026最新${category.name}手游排行榜-游戏盒子`,
    description: category.description || (isTW
      ? `精選${category.name}手遊排行榜與熱門推薦，提供快速下載與分類瀏覽服務。`
      : `精选${category.name}手游排行榜与热门推荐，提供快速下载与分类浏览服务。`),
    keywords: isTW
      ? [`${category.name}遊戲`, `${category.name}手遊`, `${category.name}推薦`, `${category.name}排行榜`, `${category.name}攻略`].join(',')
      : [`${category.name}游戏`, `${category.name}手游`, `${category.name}推荐`, `${category.name}排行榜`, `${category.name}攻略`].join(','),
    alternates,
  }
}

// 按需渲染 + 数据缓存（300s），首次访问后 Worker isolate 内存中缓存完整页面
// 注意：不能添加 generateStaticParams，否则 @opennextjs/cloudflare 会切换到
// 需要 KV/R2 的持久化 ISR 路径，而本项目未配置 KV/R2 会导致 500
export const dynamic = 'auto'
export const revalidate = 300

export default async function GameCategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params
  const { source, page } = await searchParams
  
  // 验证语言
  if (!isValidLocale(locale)) {
    notFound()
  }
  
  const localeTyped = locale as Locale
  
  // 直接使用基础分类数据，暂不走品类详情接口
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }
  
  const currentPage = normalizePage(page)
  
  // 并行获取游戏总数（不阻塞其他部分）
  const firstPageDataPromise = getCategoryGamesPage(category.id, locale, 1, CATEGORY_PAGE_SIZE)
  const firstPageData = await firstPageDataPromise
  
  const displayStats = {
    gamesCount: firstPageData.total,
    guidesCount: 0,
    giftsCount: 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionPageJsonLd({
            name: locale === 'en-US'
              ? `${category.name} Games`
              : locale === 'zh-TW'
              ? `${category.name}遊戲`
              : `${category.name}游戏`,
            description: category.description || category.name,
            url: localeTyped === defaultLocale
              ? `/games/category/${slug}`
              : `/${localeTyped}/games/category/${slug}`,
            items: firstPageData.games.slice(0, 30).map((game) => ({
              name: game.name,
              url: `/games/${game.id}`,
              image: game.iconUrl,
            })),
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            { name: getTranslation('home', localeTyped), url: localeTyped === defaultLocale ? '/' : `/${localeTyped}` },
            { name: getTranslation('gameLibrary', localeTyped), url: localeTyped === defaultLocale ? '/games' : `/${localeTyped}/games` },
            { name: category.name, url: localeTyped === defaultLocale ? `/games/category/${slug}` : `/${localeTyped}/games/category/${slug}` },
          ])),
        }}
      />
      {/* 面包屑导航 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={localeTyped === defaultLocale ? '/' : `/${localeTyped}`} className="hover:text-foreground transition-colors">
              {getTranslation('home', localeTyped)}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={localeTyped === defaultLocale ? '/games' : `/${localeTyped}/games`} className="hover:text-foreground transition-colors">
              {getTranslation('gameLibrary', localeTyped)}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href={localeTyped === defaultLocale ? '/games' : `/${localeTyped}/games`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {getTranslation('gameLibrary', localeTyped)}
          </Button>
        </Link>

        {/* 1. 品类介绍区 */}
        <CategoryIntroduction
          category={category}
          stats={displayStats}
          fromSubSite={false}
        />

        {/* 2. 全部游戏列表 —— 使用 Suspense 流式渲染 */}
        <Suspense fallback={<GameGridSkeleton />}>
          <AllGamesListSection 
            categoryId={category.id}
            categoryName={category.name}
            locale={localeTyped}
            currentPage={currentPage}
            slug={slug}
            source={source}
          />
        </Suspense>

        {/* 3. 其他品类推荐 —— 使用 Suspense 流式渲染 */}
        <Suspense fallback={<RelatedCategoriesSkeleton />}>
          <CategoryRelatedSection
            slug={slug}
            locale={locale}
          />
        </Suspense>

        {/* 4. 品类礼包区（放在页面最底部） */}
        <CategoryGifts
          categoryName={category.name}
          categorySlug={category.slug}
          gifts={[]}
          locale={locale}
          defaultLocale={defaultLocale}
        />
      </div>
    </div>
  )
}
