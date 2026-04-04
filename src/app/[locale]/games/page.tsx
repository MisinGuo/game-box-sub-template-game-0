import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, cache } from 'react'
import { ChevronRight, Gamepad2, TrendingUp, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { isValidLocale, getTranslation, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { fallbackMetadata } from '@/config/fallback-metadata'
import { generateListMetadata } from '@/lib/metadata'
import { gamesListConfig } from '@/config/pages/games'
import ApiClient from '@/lib/api'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'
import { siteConfig } from '@/config'

export async function generateStaticParams() {
  return supportedLocales
    .filter(locale => locale !== defaultLocale)
    .map(locale => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return {
      title: 'Game Library',
      description: 'Discover hot games',
    }
  }

  const locale = localeParam as Locale
  const fallback = fallbackMetadata.games
  const listPath = '/games'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'games', {
    title: fallback.title[locale],
    description: fallback.description[locale],
    keywords: fallback.keywords?.[locale],
  })
  return {
    ...base,
    openGraph: {
      type: 'website',
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: locale === defaultLocale ? listPath : `/${locale}${listPath}`,
      languages,
    },
  }
}

// 启用请求期渲染与分块流式输出
export const dynamic = 'auto'
export const revalidate = 300

interface Game {
  id: number
  name: string
  description?: string
  categoryName?: string
  iconUrl?: string
  status?: string
}

interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  count: number
}

async function getGameCategories(locale: string): Promise<Category[]> {
  try {
    const response = await ApiClient.getCategories({
      locale: locale as any,
      categoryType: 'game',
    })

    if (response.code !== 200 || !response.data) {
      console.error('[分类列表API错误]', response.msg)
      return []
    }

    const categories = response.data

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.name,
      icon: cat.icon || '🎮',
      count: cat.relatedDataCount || 0,
    }))
  } catch (error) {
    console.error('[获取游戏分类失败]', error)
    return []
  }
}

async function getGamesByCategory(locale: string, categoryId: number, pageSize: number = 50): Promise<Game[]> {
  try {
    const response = await ApiClient.getCategoryGames(categoryId, {
      locale: locale as any,
      pageSize,
      pageNum: 1,
    }, {
      timeoutMs: 3000,
    })

    if (response.code !== 200 || !response.rows) {
      console.error('[游戏列表API错误]', response.msg)
      return []
    }

    return response.rows
  } catch (error) {
    console.error('[获取游戏列表失败]', error)
    return []
  }
}

async function getUncategorizedGames(locale: string, pageSize: number = 8): Promise<{ games: Game[], total: number }> {
  try {
    const response = await ApiClient.getGames({
      locale: locale as any,
      pageSize,
      pageNum: 1,
      uncategorized: true,
    }, {
      timeoutMs: 3000,
    })

    if (response.code !== 200 || !response.rows) {
      return { games: [], total: 0 }
    }

    return { games: response.rows, total: response.total || response.rows.length }
  } catch (error) {
    console.error('[获取无分类游戏失败]', error)
    return { games: [], total: 0 }
  }
}

const getSortedCategories = cache(async (locale: Locale): Promise<Category[]> => {
  const categories = await getGameCategories(locale)
  return [...categories].sort((a, b) => b.count - a.count)
})

function CategoryGridSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-center">
            <div className="h-10 w-10 mx-auto bg-slate-800 rounded-full animate-pulse mb-3" />
            <div className="h-4 w-20 mx-auto bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-14 mx-auto bg-slate-800 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

function GameCardGridSkeleton({ titleWidth = 'w-56' }: { titleWidth?: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`h-8 ${titleWidth} bg-slate-800 rounded animate-pulse mb-6`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="w-full aspect-square bg-slate-800 rounded-lg animate-pulse mb-3" />
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

async function CategoriesGridSection({ locale }: { locale: Locale }) {
  const sortedCategories = await getSortedCategories(locale)

  if (sortedCategories.length === 0) {
    const retryHref = locale === defaultLocale ? '/games' : `/${locale}/games`

    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Gamepad2 className="h-16 w-16 text-slate-700 mx-auto mb-4" />
        <p className="text-slate-400 text-lg mb-2">{gamesListConfig.ui.noCategories[locale]}</p>
        <p className="text-slate-500 text-sm mb-6">{gamesListConfig.ui.unavailableText[locale]}</p>
        <Link href={retryHref} className="inline-flex items-center px-4 py-2 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors">
          {gamesListConfig.ui.retryText[locale]}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-purple-500" />
        {gamesListConfig.ui.gameCategories[locale]}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedCategories.map((category) => (
          <Link
            key={category.id}
            href={locale === defaultLocale ? `/games/category/${category.slug}` : `/${locale}/games/category/${category.slug}`}
            className="group"
          >
            <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{category.icon || '🎮'}</div>
                <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-500 text-sm mt-1">{category.count} {gamesListConfig.ui.gamesCount[locale]}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

async function CategoryPreviewSections({ locale }: { locale: Locale }) {
  const sortedCategories = await getSortedCategories(locale)
  const topCategories = sortedCategories.filter(cat => cat.count > 0).slice(0, 3)

  const categoryPreviewResults = await Promise.allSettled(
    topCategories.map(async (cat) => {
      const games = await getGamesByCategory(locale, cat.id, 4)
      return {
        ...cat,
        games,
      }
    })
  )

  const categoryPreviews = categoryPreviewResults
    .filter((result): result is PromiseFulfilledResult<Category & { games: Game[] }> => result.status === 'fulfilled')
    .map(result => result.value)

  if (categoryPreviews.length === 0) {
    return null
  }

  return (
    <>
      {categoryPreviews.map((categoryData) => (
        <div key={categoryData.id} className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">{categoryData.icon || '🎮'}</span>
              {categoryData.name}
              <span className="text-slate-500 text-base ml-2">({categoryData.count} {gamesListConfig.ui.gamesCount[locale]})</span>
            </h2>
            <Link
              href={locale === defaultLocale ? `/games/category/${categoryData.slug}` : `/${locale}/games/category/${categoryData.slug}`}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
            >
              {gamesListConfig.ui.viewAll[locale]} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {categoryData.games.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryData.games.slice(0, 4).map((game) => (
                <Link
                  key={game.id}
                  href={locale === defaultLocale ? `/games/${game.id}` : `/${locale}/games/${game.id}`}
                  className="group h-full"
                >
                  <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 h-full flex flex-col">
                    <CardHeader className="p-4 flex flex-col flex-1">
                      <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 bg-slate-800 flex-shrink-0">
                        {game.iconUrl ? (
                          <img
                            src={game.iconUrl}
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Gamepad2 className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          {categoryData.name}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs">{gamesListConfig.ui.hotLabel[locale]}</span>
                        </div>
                      </div>
                      <CardTitle className="text-white text-base group-hover:text-purple-400 transition-colors line-clamp-2">
                        {game.name}
                      </CardTitle>
                      <CardDescription className="text-slate-500 text-sm line-clamp-2 mt-2">
                        {game.description || game.name}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gamepad2 className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">{gamesListConfig.ui.noCategoryGames[locale]}</p>
            </div>
          )}
        </div>
      ))}
    </>
  )
}

async function UncategorizedSection({ locale }: { locale: Locale }) {
  const uncategorizedData = await getUncategorizedGames(locale, 4)

  if (uncategorizedData.total <= 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🎮</span>
          {gamesListConfig.ui.uncategorizedTitle[locale]}
          <span className="text-slate-500 text-base ml-2">({uncategorizedData.total} {gamesListConfig.ui.gamesCount[locale]})</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {uncategorizedData.games.slice(0, 4).map((game) => (
          <Link
            key={game.id}
            href={locale === defaultLocale ? `/games/${game.id}` : `/${locale}/games/${game.id}`}
            className="group h-full"
          >
            <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 h-full flex flex-col">
              <CardHeader className="p-4 flex flex-col flex-1">
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 bg-slate-800 flex-shrink-0">
                  {game.iconUrl ? (
                    <img
                      src={game.iconUrl}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Gamepad2 className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-white text-base group-hover:text-purple-400 transition-colors line-clamp-2">
                  {game.name}
                </CardTitle>
                <CardDescription className="text-slate-500 text-sm line-clamp-2 mt-2">
                  {game.description || game.name}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function LocalizedGamesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale

  const jsonLd = generateCollectionPageJsonLd({
    name: gamesListConfig.hero.title[locale],
    description: gamesListConfig.hero.description[locale],
    url: locale === defaultLocale ? '/games' : `/${locale}/games`,
    items: [],
  })

  return (
    <div className="bg-slate-950 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="container mx-auto px-4 py-4 text-sm text-slate-400 flex items-center">
        <Link href={locale === defaultLocale ? '/' : `/${locale}`} className="hover:text-white">{getTranslation('home', locale)}</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-white">{getTranslation('gamesTitle', locale)}</span>
      </nav>

      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <Gamepad2 className="h-5 w-5 text-purple-500" />
          <span className="text-purple-500 font-medium">{gamesListConfig.hero.badge[locale]}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {gamesListConfig.hero.title[locale]}
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          {gamesListConfig.hero.description[locale]}
        </p>
      </div>

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoriesGridSection locale={locale} />
      </Suspense>

      <Suspense fallback={<GameCardGridSkeleton titleWidth="w-64" />}>
        <CategoryPreviewSections locale={locale} />
      </Suspense>

      <Suspense fallback={<GameCardGridSkeleton titleWidth="w-52" />}>
        <UncategorizedSection locale={locale} />
      </Suspense>
    </div>
  )
}
