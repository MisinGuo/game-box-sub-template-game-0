import { cache, Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Download, Star, Users, Calendar, Tag, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ImageWithFallback from '../../ImageWithFallback'
import ApiClient from '@/lib/api'
import GameGifts from '@/components/game/GameGifts'
import GameGuides from '@/components/game/GameGuides'
import GameBoxes from '@/components/game/GameBoxes'
import type { BoxRelation } from '@/components/game/GameBoxes'
import RelatedGames from '@/components/game/RelatedGames'
import ScreenshotLightbox from '@/components/game/ScreenshotLightbox'
import { generateGameJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'
import { gamePageTranslations, getT } from '@/i18n/page-translations'
import { defaultLocale, supportedLocales, type Locale } from '@/config/site/locales'

// 游戏类型定义
interface Game {
  id: number
  name: string
  subtitle?: string | null
  description: string
  iconUrl: string
  coverUrl?: string | null
  screenshots?: string | null  // JSON 字符串数组
  videoUrl?: string | null
  downloadUrl?: string | null
  androidUrl?: string | null
  iosUrl?: string | null
  downloadCount: number
  rating?: number | null
  categoryName?: string | null
  categoryIcon?: string | null
  categoryId?: number | null
  version?: string | null
  size?: string | null
  launchTime?: string | null
  developer?: string | null
  publisher?: string | null
  tags?: string | null  // JSON 字符串或逗号分隔
  features?: string | null
  deviceSupport?: string | null
  discountLabel?: string | null
  isNew?: string
  isHot?: string
  isRecommend?: string
  status?: string
}

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

// 翻译数据已迁移至 src/i18n/page-translations.ts → gamePageTranslations

// 按需渲染 + ISR 缓存，构建时不预生成，首次访问后缓存 5 分钟
export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = 300

// 获取游戏可用语言版本（cache() 防止重复请求）
const getAvailableGameLocales = cache(async (id: string): Promise<Locale[]> => {
  try {
    const response = await ApiClient.getArticleLocales(parseInt(id, 10))
    if (response.code === 200 && Array.isArray(response.data)) {
      const available = response.data.filter((l: string) =>
        supportedLocales.includes(l as any)
      ) as Locale[]
      return available.length > 0 ? available : [defaultLocale]
    }
  } catch (error) {
    console.warn(`获取游戏 ${id} 语言版本失败:`, error)
  }
  return [defaultLocale]
})

// 获取游戏数据（cache() 确保同一次渲染内相同参数只发一次请求）
const getGameData = cache(async (id: string, locale: string) => {
  try {
    // 获取游戏详情
    const gameResult = await ApiClient.getGameDetail(Number(id), locale)
    
    if (gameResult.code !== 200 || !gameResult.data) {
      return null
    }
    
    const rawGame = gameResult.data
    
    // 解析 screenshots（如果是 JSON 字符串，需要解析）
    let screenshotUrls: string[] = []
    if (rawGame.screenshots) {
      try {
        screenshotUrls = typeof rawGame.screenshots === 'string' 
          ? JSON.parse(rawGame.screenshots) 
          : rawGame.screenshots
      } catch (e) {
        console.error('Failed to parse screenshots:', e)
      }
    }
    
    // 解析 tags（如果是 JSON 字符串或逗号分隔，需要解析）
    let tagList: string[] = []
    if (rawGame.tags) {
      try {
        if (typeof rawGame.tags === 'string') {
          // 尝试 JSON 解析
          try {
            tagList = JSON.parse(rawGame.tags)
          } catch {
            // 如果不是 JSON，尝试逗号分隔
            tagList = rawGame.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          }
        } else if (Array.isArray(rawGame.tags)) {
          tagList = rawGame.tags
        }
      } catch (e) {
        console.error('Failed to parse tags:', e)
      }
    }
    // 过滤无效标签：太长、含URL、含换行符的内容（导入时可能把描述文字映射到了tags字段）
    tagList = tagList.filter((tag: string) =>
      tag.length <= 30 &&
      !tag.includes('\n') &&
      !tag.includes('\r') &&
      !tag.includes('http') &&
      !tag.includes('://')
    )
    
    // 组装游戏数据
    const game = {
      ...rawGame,
      screenshotUrls,
      tagList,
    }
    
    return { game, screenshotUrls, tagList }
  } catch (error) {
    console.error('Error fetching game:', error)
    return null
  }
})

// 异步组件：获取相关游戏
async function RelatedGamesSection({
  gameId,
  categoryId,
  categoryName,
  categoryIcon,
  locale,
}: {
  gameId: number
  categoryId?: number
  categoryName?: string
  categoryIcon?: string
  locale: string
}) {
  if (!categoryId) {
    return null
  }

  try {
    const relatedResult = await ApiClient.getCategoryGames(categoryId, {
      locale: locale as any,
      pageNum: 1,
      pageSize: 12,
    })
    
    let relatedGames: Game[] = []
    if (relatedResult.code === 200 && relatedResult.data?.rows) {
      relatedGames = relatedResult.data.rows.filter(
        (g: Game) => g.id !== gameId
      )
    }

    if (relatedGames.length === 0) {
      return null
    }

    return (
      <RelatedGames
        categoryName={categoryName}
        categorySlug={categoryIcon}
        games={relatedGames.map((g: any) => ({
          ...g,
          title: g.name,
        }))}
        locale={locale}
        defaultLocale={defaultLocale}
      />
    )
  } catch (error) {
    console.error('[获取相关游戏失败]', error)
    return null
  }
}

// 异步组件：获取游戏所属盒子
async function GameBoxesSection({
  gameId,
  locale,
}: {
  gameId: number
  locale: string
}) {
  try {
    const result = await ApiClient.getGameBoxes(gameId)
    let boxes: BoxRelation[] = []
    if (result.code === 200 && result.data) {
      boxes = Array.isArray(result.data) ? result.data : []
    }

    if (boxes.length === 0) return null

    return (
      <GameBoxes
        boxes={boxes}
        locale={locale}
        defaultLocale={defaultLocale}
      />
    )
  } catch (error) {
    console.error('[获取游戏盒子失败]', error)
    return null
  }
}

// Skeleton 加载组件
function GameGiftsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse mb-3" />
            <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function GameGuidesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse mb-3" />
            <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatedGamesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="w-full aspect-square bg-slate-800 rounded-lg animate-pulse mb-3" />
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

// 生成元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params
  const data = await getGameData(id, locale)
  
  if (!data) {
    return {
      title: getT(gamePageTranslations, locale).notFound,
      description: getT(gamePageTranslations, locale).notFoundDesc,
    }
  }
  
  const { game } = data
  const t = getT(gamePageTranslations, locale)
  const gameUrl = locale === defaultLocale ? `/games/${id}` : `/${locale}/games/${id}`
  const imageUrl = game.coverUrl || game.iconUrl || ''
  const description = game.description || `${t.metaDescPrefix}${game.name}${t.metaDescSuffix}`

  const availableGameLocales = await getAvailableGameLocales(id)
  const languages: Record<string, string> = {}
  if (availableGameLocales.length > 1) {
    availableGameLocales.forEach(l => {
      languages[l] = l === defaultLocale ? `/games/${id}` : `/${l}/games/${id}`
    })
    languages['x-default'] = `/games/${id}`
  }

  return {
    title: `${game.name}${t.metaTitleSuffix}`,
    description,
    openGraph: {
      title: game.name,
      description,
      url: gameUrl,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: game.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: game.name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: gameUrl,
      ...(availableGameLocales.length > 1 && { languages }),
    },
  }
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const data = await getGameData(id, locale)
  const t = getT(gamePageTranslations, locale)

  // 根据 locale 生成带前缀的路径，默认语言无前缀
  const localePath = (path: string) =>
    locale === defaultLocale ? path : `/${locale}${path}`
  
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{t.notFound}</h1>
          <p className="text-slate-400 mb-8">{t.notFoundDesc}</p>
          <Button asChild>
            <Link href={localePath('/games')}>{t.backToGames}</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const { game, screenshotUrls, tagList } = data
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateGameJsonLd(game)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            { name: t.home, url: localePath('/') },
            { name: t.gameLibrary, url: localePath('/games') },
            { name: game.name, url: localePath(`/games/${id}`) },
          ])),
        }}
      />
      {/* Hero Banner —— 模糊封面背景 */}
      <div className="relative overflow-hidden">
        {/* 背景模糊封面 */}
        <div className="absolute inset-0">
          <img
            src={game.coverUrl || game.iconUrl || ''}
            alt=""
            className="w-full h-full object-cover scale-110"
            style={{ filter: 'blur(24px)', opacity: 0.25 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
        </div>

        {/* 面包屑 */}
        <div className="relative border-b border-white/5">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link href={localePath('/')} className="text-slate-400 hover:text-white transition-colors">{t.home}</Link>
              <span className="text-slate-600">/</span>
              <Link href={localePath('/games')} className="text-slate-400 hover:text-white transition-colors">{t.gameLibrary}</Link>
              <span className="text-slate-600">/</span>
              <span className="text-white">{game.name}</span>
            </div>
          </div>
        </div>

        {/* 游戏详情主区域 */}
        <div className="relative container mx-auto max-w-6xl px-4 py-6 md:py-10">
          {/* 移动端：图标+基本信息横排；桌面端：图标左列+信息右列 */}
          <div className="flex flex-row md:flex-row gap-4 md:gap-8 items-start">
            {/* 游戏图标 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-44 md:h-44 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-2xl shadow-black/60">
                <ImageWithFallback
                  src={game.iconUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 游戏信息 */}
            <div className="flex-1 min-w-0">
              {/* 分类 + 折扣标签 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {game.categoryName && (
                  <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/25 text-xs">{game.categoryName}</Badge>
                )}
                {game.discountLabel && (
                  <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/25 text-xs">{game.discountLabel}</Badge>
                )}
              </div>

              {/* 标题 */}
              <h1 className="text-xl md:text-4xl font-bold text-white leading-tight mb-1">{game.name}</h1>
              {game.subtitle && (
                <p className="text-slate-400 text-sm md:text-base mb-2">{game.subtitle}</p>
              )}

              {/* 评分 + 下载量 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm md:text-lg">{game.rating || 4.5}</span>
                  {t.ratingUnit && <span className="text-slate-500 text-xs">{t.ratingUnit}</span>}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs md:text-sm">
                  <Download className="h-3.5 w-3.5" />
                  <span>{game.downloadCount ? `${(game.downloadCount / 1000).toFixed(1)}K` : '1.2K'} {t.downloads}</span>
                </div>
              </div>

              {/* 按钮组 —— 移动端全宽，桌面端自适应 */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                {(game.downloadUrl || game.androidUrl) ? (
                  <Button
                    size="default"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 font-bold shadow-lg shadow-blue-500/30 sm:px-8"
                    asChild
                  >
                    <a href={game.downloadUrl || game.androidUrl || '#'} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      {game.downloadUrl ? t.downloadNow : t.androidDownload}
                    </a>
                  </Button>
                ) : (
                  <Button size="default" className="w-full sm:w-auto sm:px-8 bg-slate-700 text-slate-400 cursor-not-allowed" disabled>
                    <Download className="h-4 w-4 mr-2" />{t.noDownload}
                  </Button>
                )}
                {game.iosUrl && (
                  <Button
                    size="default"
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 font-bold shadow-lg shadow-green-500/30 sm:px-8"
                    asChild
                  >
                    <a href={game.iosUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />{t.iosDownload}
                    </a>
                  </Button>
                )}
                <Button size="default" variant="outline" className="w-full sm:w-auto border-white/10 text-slate-300 hover:text-white hover:border-white/20">
                  <Share2 className="h-4 w-4 mr-2" />{t.share}
                </Button>
              </div>

              {/* 信息条 */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:text-sm border-t border-white/5 pt-3">
                {game.version && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">{t.version}</span>
                    <span className="text-slate-200 font-medium mt-0.5">{game.version}</span>
                  </div>
                )}
                {game.size && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">{t.size}</span>
                    <span className="text-slate-200 font-medium mt-0.5">{game.size}</span>
                  </div>
                )}
                {game.launchTime && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">{t.updateTime}</span>
                    <span className="text-slate-200 font-medium mt-0.5">{new Date(game.launchTime).toLocaleDateString(locale)}</span>
                  </div>
                )}
                {game.developer && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">{t.developer}</span>
                    <span className="text-slate-200 font-medium mt-0.5">{game.developer}</span>
                  </div>
                )}
                {game.publisher && game.publisher !== game.developer && (
                  <div className="flex flex-col">
                    <span className="text-slate-500">{t.publisher}</span>
                    <span className="text-slate-200 font-medium mt-0.5">{game.publisher}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 游戏简介 */}
      <section className="container mx-auto max-w-6xl px-4 py-5 md:py-8">
        <h2 className="text-xl font-bold text-white mb-3">{t.gameIntro}</h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
          {game.description || t.noIntro}
        </p>
        {/* 标签 */}
        {tagList && tagList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tagList.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="border-slate-700 text-slate-400">
                <Tag className="h-3 w-3 mr-1" />{tag}
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* 游戏所属盒子 */}
      <Suspense fallback={
        <section className="container mx-auto max-w-6xl px-4 py-5 md:py-8">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="h-6 w-32 bg-slate-800 rounded animate-pulse mb-3" />
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      }>
        <section className="container mx-auto max-w-6xl px-4 py-5 md:py-8">
          <GameBoxesSection gameId={game.id} locale={locale} />
        </section>
      </Suspense>

      {/* 游戏视频 */}
      {game.videoUrl && (
        <section className="container mx-auto max-w-6xl px-4 py-5 md:py-8">
          <h2 className="text-xl font-bold text-white mb-4">{t.gameVideo}</h2>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl max-w-2xl mx-auto md:mx-0">
            <video
              src={game.videoUrl}
              controls
              preload="metadata"
              className="w-full max-h-[260px] md:max-h-[420px]"
              poster={game.coverUrl || game.iconUrl || undefined}
            />
          </div>
        </section>
      )}

      {/* 游戏截图 */}
      {(screenshotUrls && screenshotUrls.length > 0) && (
        <section className="py-5 md:py-8 bg-slate-900/40 border-y border-slate-800">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-xl font-bold text-white mb-4">{t.gameScreenshots}</h2>
            <ScreenshotLightbox urls={screenshotUrls} gameName={game.name} />
          </div>
        </section>
      )}

      {/* 游戏专属礼包 */}
      <Suspense fallback={
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <GameGiftsSkeleton />
          </div>
        </section>
      }>
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <GameGifts
              gameName={game.name}
              gameId={game.id}
              gifts={[]}
              locale={locale}
              defaultLocale={defaultLocale}
            />
          </div>
        </section>
      </Suspense>

      {/* 游戏攻略 */}
      <Suspense fallback={
        <section className="py-12 px-4 bg-slate-900/30">
          <div className="container mx-auto max-w-6xl">
            <GameGuidesSkeleton />
          </div>
        </section>
      }>
        <section className="py-12 px-4 bg-slate-900/30">
          <div className="container mx-auto max-w-6xl">
            <GameGuides
              gameName={game.name}
              gameId={game.id}
              guides={[]}
              categorySlug={game.categoryIcon}
              locale={locale}
              defaultLocale={defaultLocale}
            />
          </div>
        </section>
      </Suspense>

      {/* 相关游戏推荐 */}
      <Suspense fallback={
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <RelatedGamesSkeleton />
          </div>
        </section>
      }>
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <RelatedGamesSection
              gameId={game.id}
              categoryId={game.categoryId}
              categoryName={game.categoryName}
              categoryIcon={game.categoryIcon}
              locale={locale}
            />
          </div>
        </section>
      </Suspense>
    </div>
  )
}
