import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BoxCard } from '@/components/common/BoxCard'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { fallbackMetadata } from '@/config/fallback-metadata'
import { generateListMetadata } from '@/lib/metadata'
import { boxesListConfig } from '@/config/pages/boxes'
import ApiClient from '@/lib/api'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'
import { siteConfig } from '@/config'

export async function generateStaticParams() {
  return supportedLocales
    .filter(locale => locale !== defaultLocale)
    .map(locale => ({ locale }))
}

// 启用请求期渲染与流式输出
export const dynamic = 'auto'
export const revalidate = 300

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return {
      title: 'Game Boxes',
      description: 'Discover premium game boxes',
    }
  }

  const locale = localeParam as Locale
  const fallback = fallbackMetadata.boxes
  const listPath = '/boxes'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'boxes', {
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

interface BoxStats {
  totalBoxes: number
  totalGames: number
  totalUsers: string
}

async function getBoxesPageData(locale: Locale): Promise<{ boxes: any[]; stats: BoxStats }> {
  const totalUsersMap: Record<string, string> = {
    'zh-CN': '100万+', 'zh-TW': '100萬+', 'en-US': '1M+'
  }

  const stats: BoxStats = {
    totalBoxes: 0,
    totalGames: 0,
    totalUsers: totalUsersMap[locale] ?? '1M+'
  }

  try {
    const response = await ApiClient.getBoxes({
      locale,
      pageNum: 1,
      pageSize: 50,
    })

    if (response.code !== 200) {
      return { boxes: [], stats }
    }

    const boxes = response.rows || []
    const totalBoxes = response.total || 0
    const totalGames = boxes.reduce((sum: number, box: any) => sum + (box.gameCount || 0), 0)

    return {
      boxes,
      stats: {
        ...stats,
        totalBoxes,
        totalGames,
      },
    }
  } catch (error) {
    console.error('[Boxes页面] 获取游戏盒子数据失败:', error)
    return { boxes: [], stats }
  }
}

function BoxesDataSkeleton({ locale }: { locale: Locale }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="h-6 w-1/2 bg-slate-800 rounded animate-pulse mb-4" />
            <div className="h-4 w-full bg-slate-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse mb-4" />
            <div className="h-4 w-2/3 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="sr-only">{boxesListConfig.ui.searchPlaceholder[locale]}</div>
    </>
  )
}

async function BoxesDataSections({ locale }: { locale: Locale }) {
  const { boxes, stats } = await getBoxesPageData(locale)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
          <div className="text-2xl font-bold text-white mb-1">{stats.totalBoxes}+</div>
          <div className="text-sm text-slate-400">{boxesListConfig.ui.statsBoxes[locale]}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
          <div className="text-2xl font-bold text-white mb-1">{stats.totalGames}+</div>
          <div className="text-sm text-slate-400">{boxesListConfig.ui.statsGames[locale]}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
          <div className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</div>
          <div className="text-sm text-slate-400">{boxesListConfig.ui.statsUsers[locale]}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.length > 0 ? (
          boxes.map((box) => {
            // 提取所有分类标签
            const tags: string[] = box.categories
              ? box.categories
                  .filter((cat: any) => cat.categoryIcon && cat.categoryName)
                  .map((cat: any) => `${cat.categoryIcon} ${cat.categoryName}`.trim())
              : []

            const discountText = box.discountRate && box.discountRate < 1
              ? locale === 'en-US'
                ? `${(100 - box.discountRate * 100).toFixed(0)}% OFF`
                : `${(box.discountRate * 10).toFixed(1)}折`
              : ''

            const colors = ['bg-orange-500', 'bg-green-500', 'bg-purple-600', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']
            const colorIndex = box.name ? box.name.charCodeAt(0) % colors.length : 0

            return (
              <BoxCard
                key={box.id}
                id={box.id}
                name={box.name}
                logoColor={colors[colorIndex]}
                logoText={box.name?.substring(0, 1) || boxesListConfig.ui.defaultLogoText[locale]}
                logoUrl={box.logoUrl}
                description={box.description || ''}
                tags={tags}
                gameCount={box.gameCount || 0}
                rating={4.5}
                discount={discountText}
                locale={locale}
              />
            )
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            {boxesListConfig.ui.noCategoryBoxes[locale]}
          </div>
        )}
      </div>
    </>
  )
}

export default async function LocalizedBoxesPage({
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
    name: boxesListConfig.hero.title[locale],
    description: boxesListConfig.hero.description[locale],
    url: locale === defaultLocale ? '/boxes' : `/${locale}/boxes`,
    items: [],
  })

  return (
    <div className="bg-slate-950 min-h-screen py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{boxesListConfig.hero.title[locale]}</h1>
          <p className="text-slate-400 text-lg">
            {boxesListConfig.hero.description[locale]}
          </p>
        </div>

        <Suspense fallback={<BoxesDataSkeleton locale={locale} />}>
          <BoxesDataSections locale={locale} />
        </Suspense>
      </div>
    </div>
  )
}
