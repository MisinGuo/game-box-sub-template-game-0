import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronRight, Download, Star, Users, Shield, Gift, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import ApiClient from '@/lib/api'
import ImageWithFallback from '../../ImageWithFallback'
import { boxPageTranslations, getT } from '@/i18n/page-translations'
import { generateBoxJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'

// 按需渲染 + ISR 缓存，构建时不预生成，首次访问后缓存 5 分钟
export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = 300

interface BoxDetailPageProps {
  params: Promise<{ locale: string; id: string }>
  searchParams?: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: BoxDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params
  const query = searchParams ? await searchParams : undefined
  const currentPage = Math.max(1, Number(query?.page || 1))
  const t = getT(boxPageTranslations, locale)
  const localeTyped = locale as Locale

  // Canonical always points to the base box URL (page 1), regardless of pagination
  const boxUrl = localeTyped === defaultLocale ? `/boxes/${id}` : `/${localeTyped}/boxes/${id}`
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? `/boxes/${id}` : `/${l}/boxes/${id}`
  })
  languages['x-default'] = `/boxes/${id}`

  try {
    const response = await ApiClient.getBoxDetail(Number(id), locale)
    const box = response.data
    const titleWithPage = currentPage > 1
      ? `${box.name} - ${locale === 'en-US' ? `Page ${currentPage}` : `第${currentPage}页`}${t.metaTitleSuffix}`
      : `${box.name}${t.metaTitleSuffix}`

    return {
      title: titleWithPage,
      description: box.description || `${t.metaDescPrefix}${box.name}${t.metaDescSuffix}`,
      alternates: { canonical: boxUrl, languages },
    }
  } catch {
    return {
      title: t.metaFallbackTitle,
      description: t.metaFallbackDesc,
      alternates: { canonical: boxUrl, languages },
    }
  }
}

function BoxDetailSkeleton() {
  return (
    <div className="bg-slate-950">
      {/* 面包屑导航 */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-5 w-72 bg-slate-800 rounded animate-pulse" />
      </div>

      {/* 盒子头部区域 */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo 占位符 */}
            <div className="w-24 h-24 rounded-2xl bg-slate-800 animate-pulse shrink-0" />
            
            {/* 内容区 */}
            <div className="flex-1 space-y-4">
              {/* 标题 + Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
              </div>

              {/* 描述 */}
              <div className="space-y-2 mb-6">
                <div className="h-5 w-full bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-2/3 bg-slate-800 rounded animate-pulse" />
              </div>

              {/* 统计信息 */}
              <div className="flex gap-6 mb-6">
                <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
              </div>

              {/* 下载按钮 */}
              <div className="h-12 w-40 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 游戏网格 */}
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded">
              <div className="aspect-square bg-slate-800 animate-pulse rounded-t" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

async function BoxDetailContent({ locale, id, pageNum }: { locale: Locale; id: number; pageNum: number }) {
  const t = getT(boxPageTranslations, locale)
  const lp = (path: string) => locale === defaultLocale ? path : `/${locale}${path}`
  const BOX_GAMES_PAGE_SIZE = 15

  const extractRows = (response: any): any[] => {
    if (Array.isArray(response?.rows)) {
      return response.rows
    }
    if (Array.isArray(response?.data?.rows)) {
      return response.data.rows
    }
    return []
  }

  let box: any = null
  let games: any[] = []
  let gamesTotalCount = 0
  let totalPages = 1
  const requestedPage = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1
  let currentPage = requestedPage

  try {
    const response = await ApiClient.getBoxDetail(Number(id), locale)
    if (response.code === 200 && response.data) {
      box = response.data

      // 复用盒子汇总接口数据（补充 logoUrl、分类等信息）
      const boxesSummaryResponse = await ApiClient.getBoxes({
        locale,
        pageNum: 1,
        pageSize: 50,
      }).catch(() => null)
      const summaryRows = extractRows(boxesSummaryResponse)
      const summaryBox = summaryRows.find((item: any) => Number(item?.id) === Number(id))
      if (summaryBox) {
        box = { ...box, ...summaryBox }
      }

      const countHint = Number(box.gameCount || 0)
      gamesTotalCount = Number.isFinite(countHint) && countHint > 0 ? countHint : 0
      totalPages = gamesTotalCount > 0 ? Math.max(1, Math.ceil(gamesTotalCount / BOX_GAMES_PAGE_SIZE)) : 1
      currentPage = Math.min(requestedPage, totalPages)

      const boxGamesResponse = await ApiClient.getBoxGames(Number(id), {
        locale,
        pageNum: currentPage,
        pageSize: BOX_GAMES_PAGE_SIZE,
      }).catch(() => null)
      games = extractRows(boxGamesResponse)

      // 后端暂未返回总数时，使用可见数据兜底
      if (gamesTotalCount === 0) {
        gamesTotalCount = games.length
        totalPages = 1
      }
    }
  } catch (error) {
    console.error('获取盒子详情失败:', error)
    notFound()
  }

  if (!box) {
    notFound()
  }

  let features: string[] = []
  if (box.features) {
    try {
      const parsed = typeof box.features === 'string' ? JSON.parse(box.features) : box.features
      features = Array.isArray(parsed) ? parsed : []
    } catch {
      features = []
    }
  }

  const discountText = box.discountRate
    ? locale === 'en-US'
      ? `${Math.round((1 - box.discountRate) * 100)}${t.discountSuffix}`
      : `${(box.discountRate * 10).toFixed(1)}${t.discountSuffix}`
    : ''

  const colors = ['bg-orange-500', 'bg-green-500', 'bg-purple-600', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']
  const colorIndex = box.name ? box.name.charCodeAt(0) % colors.length : 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBoxJsonLd({
            name: box.name,
            description: box.description,
            logoUrl: box.logoUrl,
            id: box.id,
            gameCount: box.gameCount,
            discountRate: box.discountRate,
            websiteUrl: box.websiteUrl,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            { name: t.home, url: locale === defaultLocale ? '/' : `/${locale}` },
            { name: t.boxes, url: locale === defaultLocale ? '/boxes' : `/${locale}/boxes` },
            { name: box.name, url: locale === defaultLocale ? `/boxes/${id}` : `/${locale}/boxes/${id}` },
          ])),
        }}
      />
      <nav className="container mx-auto px-4 py-4 text-sm text-slate-400 flex items-center">
        <Link href={lp('/')} className="hover:text-white">{t.home}</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={lp('/boxes')} className="hover:text-white">{t.boxes}</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-white">{box.name}</span>
      </nav>

      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {box.logoUrl ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 shadow-xl shrink-0 border border-slate-700">
                <ImageWithFallback
                  src={box.logoUrl}
                  alt={box.name ? `${box.name} - 游戏盒子官方Logo` : '游戏盒子Logo'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-2xl ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-4xl shadow-xl shrink-0`}>
                {box.name?.substring(0, 1) || 'B'}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{box.name}</h1>
                {discountText && (
                  <Badge className="bg-orange-500 text-white text-base px-3 py-1">
                    {discountText}
                  </Badge>
                )}
              </div>

              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                {box.description || t.noDesc}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-white">4.5</span>
                  <span className="text-sm">{t.rating}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Download className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-white">{box.gameCount || 0}</span>
                  <span className="text-sm">{t.games}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-white">{t.users100w}</span>
                  <span className="text-sm">{t.users}</span>
                </div>
              </div>

              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8" asChild>
                <Link href={lp(`/boxes/${box.id}/download`)}>
                  <Download className="mr-2 h-5 w-5" />
                  {t.downloadNow}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {features.length > 0 && (
        <div className="container mx-auto px-4 py-12 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">{t.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t.includedGames}</h2>
          <span className="text-slate-400">{gamesTotalCount}{t.gamesCount}</span>
        </div>

        {games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {games.map((game: any) => (
              <Link key={game.id} href={lp(`/games/${game.id}`)}>
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                  <div className="aspect-square bg-slate-800 relative overflow-hidden">
                    <ImageWithFallback
                      src={game.iconUrl}
                      alt={game.name ? `${game.name}${game.categoryName ? ` - ${game.categoryName}` : ''}` : '游戏图标'}
                      className="w-full h-full object-cover"
                    />
                    {game.isNew === '1' && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-xs">{t.isNew}</Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {game.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{game.categoryName || t.uncategorized}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">{t.noGames}</div>
            <div className="text-sm text-slate-500">{t.noGamesDesc}</div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={lp(`/boxes/${box.id}`) + `?page=${Math.max(1, currentPage - 1)}`}
              className={`px-3 py-2 rounded border text-sm transition-colors ${
                currentPage <= 1
                  ? 'pointer-events-none border-slate-800 text-slate-600'
                  : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              {locale === 'en-US' ? 'Prev' : '上一页'}
            </Link>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => (
                <div key={p} className="contents">
                  {idx > 0 && p - arr[idx - 1] > 1 && (
                    <span className="px-2 text-slate-500">...</span>
                  )}
                  <Link
                    href={lp(`/boxes/${box.id}`) + `?page=${p}`}
                    className={`min-w-9 h-9 px-3 rounded border text-sm inline-flex items-center justify-center transition-colors ${
                      p === currentPage
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {p}
                  </Link>
                </div>
              ))}

            <Link
              href={lp(`/boxes/${box.id}`) + `?page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-3 py-2 rounded border text-sm transition-colors ${
                currentPage >= totalPages
                  ? 'pointer-events-none border-slate-800 text-slate-600'
                  : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              {locale === 'en-US' ? 'Next' : '下一页'}
            </Link>
          </div>
        )}
      </div>

      {box.websiteUrl && (
        <div className="container mx-auto px-4 pb-12">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">{t.moreInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-blue-400" />
                <a
                  href={box.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {t.visitWebsite}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default async function BoxDetailPage({ params, searchParams }: BoxDetailPageProps) {
  const { locale: localeParam, id } = await params
  const query = searchParams ? await searchParams : undefined
  const pageNum = Number(query?.page || 1)

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale

  return (
    <div className="bg-slate-950 min-h-screen">
      <Suspense fallback={<BoxDetailSkeleton />}>
        <BoxDetailContent locale={locale} id={Number(id)} pageNum={pageNum} />
      </Suspense>
    </div>
  )
}
