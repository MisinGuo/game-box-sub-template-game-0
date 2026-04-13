import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, cache } from 'react'
import { Trophy, TrendingUp, Flame, Medal, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { formatCount } from '@/lib/format'
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
    return { title: '游戏排行榜' }
  }

  const locale = localeParam as Locale
  const listPath = '/rank'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'games', {
    title:
      locale === 'zh-CN'
        ? '手游排行榜 - 最热门游戏TOP100'
        : locale === 'zh-TW'
        ? '手遊排行榜 - 最熱門遊戲TOP100'
        : 'Mobile Game Rankings - Top 100 Most Popular Games',
    description:
      locale === 'zh-CN'
        ? '按下载量排名的手游排行榜，发现各品类最受欢迎的游戏，并通过游戏盒子找到最低折扣。'
        : locale === 'zh-TW'
        ? '按下載量排名的手遊排行榜，發現各品類最受歡迎的遊戲，並通過遊戲盒子找到最低折扣。'
        : 'Mobile game rankings sorted by download count. Discover the most popular games and find the best discounts.',
    keywords:
      locale === 'zh-CN'
        ? '手游排行榜,热门手游,手游TOP100,最受欢迎手游,游戏排名'
        : locale === 'zh-TW'
        ? '手遊排行榜,熱門手遊,手遊TOP100'
        : 'mobile game rankings,top 100 mobile games,popular games',
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
  downloadCount?: number
  rating?: number
  isHot?: boolean
  isNew?: boolean
  tags?: string[]
}

const getRankedGames = cache(async (locale: Locale): Promise<GameItem[]> => {
  try {
    const response = await ApiClient.getGames(
      { locale, pageSize: 100, pageNum: 1 },
      { timeoutMs: 5000 }
    )
    if (response.code === 200 && response.rows) {
      const games = response.rows as GameItem[]
      // 按下载量降序排序
      return [...games].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
    }
  } catch (error) {
    console.error('[排行榜数据获取失败]', error)
  }
  return []
})

// ===== Skeleton =====

function RankSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="h-8 w-8 bg-slate-800 rounded-full flex-shrink-0" />
          <div className="h-12 w-12 bg-slate-800 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="h-3 w-24 bg-slate-800 rounded" />
          </div>
          <div className="h-4 w-16 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  )
}

// ===== 排行榜项 =====

function RankItem({
  game,
  rank,
  locale,
  basePath,
}: {
  game: GameItem
  rank: number
  locale: Locale
  basePath: string
}) {
  const rankIcon =
    rank === 1 ? '🥇' :
    rank === 2 ? '🥈' :
    rank === 3 ? '🥉' :
    null

  const rankColorClass =
    rank === 1 ? 'text-amber-400 font-bold text-xl' :
    rank === 2 ? 'text-slate-300 font-bold text-xl' :
    rank === 3 ? 'text-amber-700 font-bold text-xl' :
    rank <= 10 ? 'text-sky-400 font-semibold' :
    'text-muted-foreground'

  const t = {
    downloads:
      locale === 'zh-CN' ? '下载' :
      locale === 'zh-TW' ? '下載' :
      'downloads',
    hot: locale === 'zh-CN' ? '热门' : locale === 'zh-TW' ? '熱門' : 'Hot',
    newLabel: locale === 'zh-CN' ? '新游' : locale === 'zh-TW' ? '新遊' : 'New',
    viewBoxes:
      locale === 'zh-CN' ? '查盒子' :
      locale === 'zh-TW' ? '查盒子' :
      'Boxes',
  }

  return (
    <Link href={`${basePath}/games/${game.id}`} className="group block">
      <Card className="hover:border-sky-500/50 transition-all hover:shadow-lg">
        <div className="flex items-center gap-4 p-4">
          {/* 排名 */}
          <div className={`w-10 text-center flex-shrink-0 ${rankColorClass}`}>
            {rankIcon ?? rank}
          </div>

          {/* 游戏图标 */}
          <div className="h-12 w-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
            {game.iconUrl ? (
              <ImageWithFallback
                src={game.iconUrl}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
            )}
          </div>

          {/* 游戏信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm group-hover:text-sky-400 transition-colors truncate">
                {game.name}
              </p>
              {game.isHot && (
                <Badge className="bg-red-500/20 text-red-300 text-xs">{t.hot}</Badge>
              )}
              {game.isNew && (
                <Badge className="bg-green-500/20 text-green-300 text-xs">{t.newLabel}</Badge>
              )}
            </div>
            {game.categoryName && (
              <p className="text-xs text-muted-foreground">{game.categoryName}</p>
            )}
          </div>

          {/* 下载量 */}
          {game.downloadCount !== undefined && game.downloadCount > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                {formatCount(game.downloadCount)}
              </div>
              <p className="text-xs text-muted-foreground">{t.downloads}</p>
            </div>
          )}

          {/* 右箭头 */}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-400 flex-shrink-0" />
        </div>
      </Card>
    </Link>
  )
}

// ===== 排行榜主体 =====

async function RankListSection({ locale }: { locale: Locale }) {
  const games = await getRankedGames(locale)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const t = {
    top10: locale === 'zh-CN' ? '人气TOP 10' : locale === 'zh-TW' ? '人氣TOP 10' : 'Top 10 Popular',
    rest: locale === 'zh-CN' ? '更多热门游戏' : locale === 'zh-TW' ? '更多熱門遊戲' : 'More Popular Games',
    empty: locale === 'zh-CN' ? '暂无排行数据' : locale === 'zh-TW' ? '暫無排行數據' : 'No ranking data yet',
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>{t.empty}</p>
      </div>
    )
  }

  const top10 = games.slice(0, 10)
  const rest = games.slice(10)

  const jsonLd = generateCollectionPageJsonLd({
    name: t.top10,
    description: locale === 'zh-CN' ? '最热门手游排行' : 'Top mobile game rankings',
    url: basePath ? `${basePath}/rank` : '/rank',
    items: top10.map(g => ({ name: g.name, url: `${basePath}/games/${g.id}`, image: g.iconUrl })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* TOP 10 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold">{t.top10}</h2>
          <Badge className="bg-amber-500/20 text-amber-300">10</Badge>
        </div>
        <div className="space-y-3">
          {top10.map((game, idx) => (
            <RankItem key={game.id} game={game} rank={idx + 1} locale={locale} basePath={basePath} />
          ))}
        </div>
      </section>

      {/* 11-100 */}
      {rest.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <Flame className="h-5 w-5 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.rest}</h2>
              <Badge className="bg-sky-500/20 text-sky-300">{rest.length}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            {rest.map((game, idx) => (
              <RankItem key={game.id} game={game} rank={idx + 11} locale={locale} basePath={basePath} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

// ===== 主页面 =====

export default async function RankPage({
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
        ? '手游排行榜'
        : locale === 'zh-TW'
        ? '手遊排行榜'
        : 'Mobile Game Rankings',
    heroSubtitle:
      locale === 'zh-CN'
        ? '按人气下载量排名的精选手游，发现最受玩家喜爱的游戏，一键找到最低折扣盒子。'
        : locale === 'zh-TW'
        ? '按人氣下載量排名的精選手遊，發現最受玩家喜愛的遊戲，一鍵找到最低折扣盒子。'
        : 'Top mobile games ranked by popularity. Discover the most loved games and find the best discount boxes.',
    allGames:
      locale === 'zh-CN'
        ? '查看全部游戏'
        : locale === 'zh-TW'
        ? '查看全部遊戲'
        : 'View All Games',
    compareBoxes:
      locale === 'zh-CN'
        ? '对比折扣盒子'
        : locale === 'zh-TW'
        ? '對比折扣盒子'
        : 'Compare Boxes',
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-950/50 via-slate-950 to-slate-950 border-b border-sky-500/20 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-sky-400" />
            </div>
            <Badge className="bg-sky-500/20 text-sky-300 text-sm px-3 py-1">TOP 100</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">{t.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`${basePath}/games`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sky-500/50 text-sky-400 hover:border-sky-400 transition-colors text-sm"
            >
              {t.allGames} <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${basePath}/boxes`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition-colors text-sm"
            >
              <Medal className="h-4 w-4" />
              {t.compareBoxes}
            </Link>
          </div>
        </div>
      </section>

      {/* 排行榜内容 */}
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<RankSkeleton />}>
          <RankListSection locale={locale} />
        </Suspense>
      </div>
    </>
  )
}
