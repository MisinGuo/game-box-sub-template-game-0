import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowRight, Flame, Gift, BookOpen, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { homeConfig } from '@/config/pages/home'
import { fallbackMetadata } from '@/config/fallback-metadata'
import { supportedLocales, defaultLocale, locales } from '@/config/site/locales'
import ApiClient from '@/lib/api'
import { generateHomeMetadata } from '@/lib/metadata'
import { formatCount, formatMoney } from '@/lib/format'
import ImageWithFallback from './ImageWithFallback'
import { generateWebSiteJsonLd, generateOrganizationJsonLd } from '@/lib/jsonld'
import type { Metadata } from 'next'
import type { Locale } from '@/config/types'
import type { ArticleListItem, GameListItem } from '@/lib/api-types'
import type { StatItem } from '@/config/pages/home'
// // ISR: 增量静态再生成 + 5分钟缓存---注意cloudflare不支持ISR，设置 revalidate=0 禁用 Next.js 缓存，完全交由 Cloudflare Workers 控制缓存策略（通过 Cache-Control 头）。这样可以确保内容更新后立即生效，同时仍然利用 Cloudflare 的边缘缓存加速全球访问。
// export const revalidate = 300
// 禁用缓存，每次请求都生成新内容。Cloudflare Workers 将识别 Cache-Control: no-cache 头，不会缓存。
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // 只为支持的语言生成静态页面
  return supportedLocales.map((locale) => ({
    locale: locale,
  }))
}

// 动态生成metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale: currentLocale } = await params
  
  // 验证 locale 是否有效
  if (!supportedLocales.includes(currentLocale as any)) {
    return {}
  }

  const listPath = '/'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}`
  })
  languages['x-default'] = listPath

  const base = await generateHomeMetadata(
    currentLocale,
    fallbackMetadata.home.title[currentLocale],
    fallbackMetadata.home.description[currentLocale]
  )
  return {
    ...base,
    alternates: {
      canonical: currentLocale === defaultLocale ? '/' : `/${currentLocale}`,
      languages,
    },
  }
}

function HomeSectionsSkeleton() {
  return (
    <>
      <section className="py-12 border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse mb-3" />
              <div className="h-6 w-16 bg-slate-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="h-8 w-56 bg-slate-800 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="aspect-video bg-slate-800 animate-pulse" />
              <div className="p-4">
                <div className="h-5 w-5/6 bg-slate-800 rounded animate-pulse mb-3" />
                <div className="h-4 w-2/3 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="h-8 w-56 bg-slate-800 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="aspect-square bg-slate-800 animate-pulse" />
                <div className="p-3">
                  <div className="h-4 w-4/5 bg-slate-800 rounded animate-pulse mb-2" />
                  <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

async function HomeDataSections({ currentLocale }: { currentLocale: Locale }) {
  const t = locales[currentLocale || defaultLocale].translations
  const lp = (path: string) => currentLocale === defaultLocale ? path : `/${currentLocale}${path}`

  const iconMap: Record<string, any> = {
    Download,
    Flame,
    BookOpen,
    Gift,
  }

  const response = await ApiClient.getHomeData({
    locale: currentLocale,
    strategyCount: homeConfig.data.strategyCount,
    hotGamesCount: homeConfig.data.specialCount,
    articleCount: homeConfig.data.articleCount,
  }).catch((error) => {
    console.error('[HomePage] 获取首页数据失败，已降级为空数据:', error)
    return { code: 500, msg: 'home data fallback', data: {}, rows: [] }
  })

  const homeData = response.data || {}
  const strategyArticles = homeData.strategyArticles || []
  const hotGames = homeData.hotGames || []
  const statistics = homeData.statistics || null

  const statsData = statistics ? homeConfig.stats
    .filter((stat: StatItem) => {
      if (stat.visible === undefined) return true
      if (typeof stat.visible === 'boolean') return stat.visible
      return stat.visible[currentLocale] !== false
    })
    .map((stat: StatItem) => {
      const label = stat.label[currentLocale as keyof typeof stat.label] || stat.label[defaultLocale as keyof typeof stat.label]

      let value = stat.value

      if (stat.dataKey && statistics[stat.dataKey] != null) {
        const rawValue = statistics[stat.dataKey]

        if (stat.dataKey === 'totalSavings') {
          value = formatMoney(rawValue)
        } else {
          value = formatCount(rawValue)
        }
      }

      return {
        label,
        value,
        icon: stat.icon,
      }
    }) : []

  return (
    <>
      {/* Stats / Features */}
      {statsData.length > 0 && (
        <section className="py-12 border-b border-slate-800 bg-slate-900/30">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat: { label: string; value: string; icon: string }, i: number) => {
              const IconComponent = iconMap[stat.icon] || Download
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-blue-400">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Strategy Articles */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{homeConfig.sections.strategy.title[currentLocale as keyof typeof homeConfig.sections.strategy.title]}</h2>
            <p className="text-slate-400 text-sm">{homeConfig.sections.strategy.description[currentLocale as keyof typeof homeConfig.sections.strategy.description]}</p>
          </div>
          {homeConfig.sections.strategy.moreLink && (
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-transparent p-0" asChild>
              <Link href={lp(homeConfig.sections.strategy.moreLink.href)}>
                {homeConfig.sections.strategy.moreLink.text[currentLocale as keyof typeof homeConfig.sections.strategy.moreLink.text]} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategyArticles.length > 0 ? (
            strategyArticles.map((article: ArticleListItem) => (
              <Link key={article.masterArticleId} href={lp(`/content/guides/${article.masterArticleId}`)}>
                <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-slate-700 transition-colors cursor-pointer group h-full">
                  <div className="aspect-video bg-slate-800 relative overflow-hidden">
                    <ImageWithFallback
                      src={article.coverUrl || article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">
                      {homeConfig.sections.strategy.badge && homeConfig.sections.strategy.badge[currentLocale as keyof typeof homeConfig.sections.strategy.badge]}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(article.createTime).toLocaleDateString(currentLocale)}</span>
                      {article.readingTime && <span>{t.readAbout} {article.readingTime} {t.minutesRead}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-slate-400 mb-2">{t.noArticles}</div>
              <div className="text-sm text-slate-500">
                {t.stayTuned}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Special Games */}
      <section className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{homeConfig.sections.special.title[currentLocale as keyof typeof homeConfig.sections.special.title]}</h2>
              <p className="text-slate-400 text-sm">{homeConfig.sections.special.description[currentLocale as keyof typeof homeConfig.sections.special.description]}</p>
            </div>
            {homeConfig.sections.special.moreLink && (
              <Button variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-transparent p-0" asChild>
                <Link href={lp(homeConfig.sections.special.moreLink.href)}>
                  {homeConfig.sections.special.moreLink.text[currentLocale as keyof typeof homeConfig.sections.special.moreLink.text]} <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {hotGames.map((game: GameListItem) => (
              <Link key={game.id} href={lp(`/games/${game.slug || game.id}`)}>
                <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-orange-500/50 transition-colors cursor-pointer group">
                  <div className="aspect-square bg-slate-800 relative overflow-hidden">
                    <ImageWithFallback
                      src={game.iconUrl}
                      alt={game.name || 'game'}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-orange-500/90 text-xs">
                      {homeConfig.sections.special.badge && homeConfig.sections.special.badge[currentLocale as keyof typeof homeConfig.sections.special.badge]}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {game.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {game.downloadCount ? `${(game.downloadCount / 1000).toFixed(1)}K ${t.download}` : t.defaultCategory}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale: currentLocale } = await params
  
  // 验证 locale 是否有效，防止被错误匹配（如 sitemap 路由）
  if (!supportedLocales.includes(currentLocale as any)) {
    notFound()
  }

  const lp = (path: string) => currentLocale === defaultLocale ? path : `/${currentLocale}${path}`
  
  // 处理 hero description  
  const heroDescription = homeConfig.hero.description[currentLocale as keyof typeof homeConfig.hero.description] || homeConfig.hero.description[defaultLocale as keyof typeof homeConfig.hero.description]
  
  return (
    <div className="bg-slate-950 min-h-screen pb-12">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationJsonLd()) }}
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-950 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-4 py-1">
            {homeConfig.hero.badge[currentLocale as keyof typeof homeConfig.hero.badge]}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            {homeConfig.hero.title[currentLocale as keyof typeof homeConfig.hero.title]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{homeConfig.hero.highlightText[currentLocale as keyof typeof homeConfig.hero.highlightText]}</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            {heroDescription[0]}
            <br className="hidden md:inline" />
            {heroDescription[1]}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg font-bold" asChild>
              <Link href={lp(homeConfig.hero.primaryButton.href)}>{homeConfig.hero.primaryButton.text[currentLocale as keyof typeof homeConfig.hero.primaryButton.text]}</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" asChild>
              <Link href={lp(homeConfig.hero.secondaryButton.href)}>{homeConfig.hero.secondaryButton.text[currentLocale as keyof typeof homeConfig.hero.secondaryButton.text]}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeDataSections currentLocale={currentLocale} />
      </Suspense>
    </div>
  )
}
