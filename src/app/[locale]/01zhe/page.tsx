import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, cache } from 'react'
import { Percent, Gamepad2, Newspaper, ChevronRight, TrendingDown, Box } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'
import ImageWithFallback from '../ImageWithFallback'

export async function generateStaticParams() {
  return supportedLocales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return { title: '0.1折专区' }
  }

  const locale = localeParam as Locale
  const listPath = '/01zhe'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'strategy', {
    title:
      locale === 'zh-CN'
        ? '0.1折手游专区 - 最低折扣游戏盒子聚合'
        : locale === 'zh-TW'
        ? '0.1折手遊專區 - 最低折扣遊戲盒子聚合'
        : '0.1x Discount Games - Best Mobile Game Deals',
    description:
      locale === 'zh-CN'
        ? '汇聚全网0.1折手游资讯与攻略，对比各大游戏盒子首充折扣，找到最划算的游戏平台省大钱。'
        : locale === 'zh-TW'
        ? '匯聚全網0.1折手遊資訊與攻略，對比各大遊戲盒子首充折扣，找到最划算的遊戲平台省大錢。'
        : 'Aggregate 0.1x discount mobile game news and guides. Compare first-charge discounts across game boxes.',
    keywords:
      locale === 'zh-CN'
        ? '0.1折手游,0.1折游戏,超低折扣游戏,游戏盒子折扣,手游折扣平台'
        : locale === 'zh-TW'
        ? '0.1折手遊,超低折扣遊戲,遊戲盒子折扣'
        : '0.1x discount games,cheap mobile games,game box deals',
  })

  return {
    ...base,
    alternates: {
      canonical: locale === defaultLocale ? listPath : `/${locale}${listPath}`,
      languages,
    },
  }
}

export const dynamic = 'auto'
export const revalidate = 300

// ===== 数据获取 =====

interface GameItem {
  id: number
  name: string
  iconUrl?: string
  categoryName?: string
  description?: string
  tags?: string[]
  isHot?: boolean
}

interface ArticleItem {
  masterArticleId: number
  title: string
  description?: string
  coverImage?: string
  categoryName?: string
  createTime: string
}

const getDiscountGames = cache(async (locale: Locale): Promise<GameItem[]> => {
  try {
    const response = await ApiClient.searchGames('0.1折', {
      pageNum: 1,
      pageSize: 40,
      locale,
    })
    if (response.code === 200 && response.rows) {
      return response.rows as GameItem[]
    }
  } catch (error) {
    console.error('[0.1折游戏搜索失败]', error)
  }
  // 降级：返回全部热门游戏
  try {
    const response = await ApiClient.getGames({ locale, pageSize: 20 }, { timeoutMs: 3000 })
    if (response.code === 200 && response.rows) {
      return response.rows as GameItem[]
    }
  } catch {
    return []
  }
  return []
})

const getDiscountArticles = cache(async (locale: Locale): Promise<ArticleItem[]> => {
  try {
    const response = await ApiClient.searchArticles('0.1折', {
      pageNum: 1,
      pageSize: 18,
      locale,
    })
    if (response.code === 200 && response.rows) {
      return response.rows as ArticleItem[]
    }
  } catch (error) {
    console.error('[0.1折文章搜索失败]', error)
  }
  return []
})

// ===== Skeleton =====

function PageSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="h-48 bg-slate-800 rounded-xl" />
      <div className="h-8 w-48 bg-slate-800 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="w-full aspect-square bg-slate-800 rounded mb-3" />
            <div className="h-4 w-3/4 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== 游戏列表 =====

async function DiscountGamesSection({ locale }: { locale: Locale }) {
  const games = await getDiscountGames(locale)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const t = {
    title: locale === 'zh-CN' ? '0.1折手游推荐' : locale === 'zh-TW' ? '0.1折手遊推薦' : 'Top 0.1x Discount Games',
    empty: locale === 'zh-CN' ? '暂无0.1折游戏数据' : locale === 'zh-TW' ? '暫無0.1折遊戲數據' : 'No discount games yet',
    viewAll: locale === 'zh-CN' ? '查看全部游戏' : locale === 'zh-TW' ? '查看全部遊戲' : 'View All Games',
    hot: locale === 'zh-CN' ? '热门' : locale === 'zh-TW' ? '熱門' : 'Hot',
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>{t.empty}</p>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <Badge className="bg-amber-500/20 text-amber-300">{games.length}</Badge>
        </div>
        <Link href={`${basePath}/games`} className="text-sm text-sky-400 hover:underline flex items-center gap-1">
          {t.viewAll} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {games.map((game) => (
          <Link key={game.id} href={`${basePath}/games/${game.id}`} className="group">
            <Card className="h-full hover:border-amber-500/50 transition-all hover:shadow-lg">
              <div className="p-3">
                {game.iconUrl && (
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-800 mb-3">
                    <ImageWithFallback
                      src={game.iconUrl}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <p className="font-medium text-sm line-clamp-2 group-hover:text-amber-400 transition-colors">
                  {game.name}
                </p>
                {game.categoryName && (
                  <p className="text-xs text-muted-foreground mt-1">{game.categoryName}</p>
                )}
                {game.isHot && (
                  <Badge className="mt-2 bg-red-500/20 text-red-300 text-xs">{t.hot}</Badge>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ===== 文章列表 =====

async function DiscountArticlesSection({ locale }: { locale: Locale }) {
  const articles = await getDiscountArticles(locale)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const t = {
    title: locale === 'zh-CN' ? '0.1折攻略与资讯' : locale === 'zh-TW' ? '0.1折攻略與資訊' : '0.1x Discount Guides & News',
    empty: locale === 'zh-CN' ? '暂无相关内容' : locale === 'zh-TW' ? '暫無相關內容' : 'No content yet',
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>{t.empty}</p>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
          <Newspaper className="h-5 w-5 text-sky-400" />
        </div>
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <Badge className="bg-sky-500/20 text-sky-300">{articles.length}</Badge>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link key={article.masterArticleId} href={`${basePath}/news/${article.masterArticleId}`} className="group">
            <Card className="h-full hover:border-sky-500/50 transition-all hover:shadow-lg">
              <CardHeader className="p-4">
                <CardTitle className="text-base group-hover:text-sky-400 transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                {article.description && (
                  <CardDescription className="line-clamp-2 text-xs">{article.description}</CardDescription>
                )}
                <div className="text-xs text-muted-foreground pt-1">
                  {article.createTime?.substring(0, 10)}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ===== 主页面 =====

export default async function ZheDiscountPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return null
  }

  const locale = localeParam as Locale
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const t = {
    heroTitle:
      locale === 'zh-CN'
        ? '0.1折手游专区'
        : locale === 'zh-TW'
        ? '0.1折手遊專區'
        : '0.1x Discount Games Hub',
    heroSubtitle:
      locale === 'zh-CN'
        ? '游戏盒子让你用1折价格，体验正版游戏。汇总全网最低折扣资讯，找到最省钱的玩法。'
        : locale === 'zh-TW'
        ? '遊戲盒子讓你用1折價格，體驗正版遊戲。匯總全網最低折扣資訊，找到最省錢的玩法。'
        : 'Game boxes let you play premium games at 0.1x price. Aggregate the lowest discounts across all platforms.',
    ctaBoxes:
      locale === 'zh-CN'
        ? '查看全部盒子折扣'
        : locale === 'zh-TW'
        ? '查看全部盒子折扣'
        : 'View All Box Discounts',
    ctaGames:
      locale === 'zh-CN'
        ? '浏览游戏库'
        : locale === 'zh-TW'
        ? '瀏覽遊戲庫'
        : 'Browse Game Library',
    tipTitle:
      locale === 'zh-CN'
        ? '什么是游戏盒子0.1折？'
        : locale === 'zh-TW'
        ? '什麼是遊戲盒子0.1折？'
        : 'What is a 0.1x Game Box?',
    tipDesc:
      locale === 'zh-CN'
        ? '游戏盒子是第三方平台，通过批量采购游戏点券，向玩家提供远低于官服的首充续充折扣（最低0.1折），让你在正版游戏内合法省钱。'
        : locale === 'zh-TW'
        ? '遊戲盒子是第三方平台，通過批量採購遊戲點券，向玩家提供遠低於官服的首充續充折扣（最低0.1折），讓你在正版遊戲內合法省錢。'
        : 'Game boxes are third-party platforms that buy game currency in bulk and offer discounts as low as 0.1x compared to official servers.',
  }

  const jsonLd = generateCollectionPageJsonLd({
    name: t.heroTitle,
    description: t.heroSubtitle,
    url: basePath ? `${basePath}/01zhe` : '/01zhe',
    items: [],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-950/50 via-slate-950 to-slate-950 border-b border-amber-500/20 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-amber-400" />
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 text-sm px-3 py-1">最低0.1折</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">{t.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              <Link href={`${basePath}/boxes`}>
                <Box className="h-5 w-5 mr-2" />
                {t.ctaBoxes}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-amber-500/50 hover:border-amber-400">
              <Link href={`${basePath}/games`}>
                <Gamepad2 className="h-5 w-5 mr-2" />
                {t.ctaGames}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 什么是0.1折科普 */}
      <section className="bg-amber-500/5 border-b border-amber-500/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4">
            <Percent className="h-6 w-6 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-amber-300 mb-1">{t.tipTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.tipDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        <Suspense fallback={<PageSkeleton />}>
          <DiscountGamesSection locale={locale} />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-slate-800/50 rounded-xl animate-pulse" />}>
          <DiscountArticlesSection locale={locale} />
        </Suspense>

        {/* 底部CTA */}
        <section className="text-center py-8 border border-amber-500/20 rounded-xl bg-amber-500/5">
          <Box className="h-10 w-10 mx-auto mb-3 text-amber-400" />
          <h3 className="text-xl font-bold mb-2">
            {locale === 'zh-CN'
              ? '找到最低折扣盒子'
              : locale === 'zh-TW'
              ? '找到最低折扣盒子'
              : 'Find the Best Discount Box'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {locale === 'zh-CN'
              ? '对比 50+ 主流游戏盒子，首充续充折扣一目了然'
              : locale === 'zh-TW'
              ? '對比 50+ 主流遊戲盒子，首充續充折扣一目了然'
              : 'Compare 50+ mainstream game boxes side by side'}
          </p>
          <Button asChild className="bg-amber-500 hover:bg-amber-400 text-black font-semibold">
            <Link href={`${basePath}/boxes`}>
              {locale === 'zh-CN' ? '立即比较→' : locale === 'zh-TW' ? '立即比較→' : 'Compare Now →'}
            </Link>
          </Button>
        </section>
      </div>
    </>
  )
}
