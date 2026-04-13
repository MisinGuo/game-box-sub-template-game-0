import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, cache } from 'react'
import { Tag, Gamepad2, Newspaper, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'
import { generatePageMetadata } from '@/lib/metadata'
import ImageWithFallback from '../../ImageWithFallback'

// 不预生成静态参数（tag太多，用动态渲染）
export async function generateStaticParams() {
  return supportedLocales.map(locale => ({ locale, tag: '' })).filter(() => false)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>
}): Promise<Metadata> {
  const { locale: localeParam, tag: rawTag } = await params

  if (!isValidLocale(localeParam)) {
    return { title: 'Tag' }
  }

  const locale = localeParam as Locale
  const tag = decodeURIComponent(rawTag)
  const listPath = `/tag/${rawTag}`
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generatePageMetadata(locale, {
    title:
      locale === 'zh-CN'
        ? `「${tag}」相关游戏与攻略 - 我爱玩游戏网`
        : locale === 'zh-TW'
        ? `「${tag}」相關遊戲與攻略 - 我愛玩遊戲網`
        : `「${tag}」Games & Guides - 5AWYX`,
    description:
      locale === 'zh-CN'
        ? `查看所有标签为「${tag}」的手游与攻略文章，并对比游戏盒子折扣找到最优惠的玩法。`
        : locale === 'zh-TW'
        ? `查看所有標籤為「${tag}」的手遊與攻略文章，並對比遊戲盒子折扣找到最優惠的玩法。`
        : `Browse all games and guides tagged with 「${tag}」. Compare game box discounts.`,
    keywords:
      locale === 'zh-CN'
        ? `${tag},${tag}手游,${tag}攻略,${tag}游戏盒子`
        : `${tag},${tag} games,${tag} guides`,
  })

  return {
    ...base,
    alternates: {
      canonical: locale === defaultLocale ? listPath : `/${locale}${listPath}`,
      languages,
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

const getTagGames = cache(async (locale: Locale, tag: string): Promise<GameItem[]> => {
  try {
    const response = await ApiClient.searchGames(tag, {
      pageNum: 1,
      pageSize: 40,
      locale,
    })
    if (response.code === 200 && response.rows) {
      return response.rows as GameItem[]
    }
  } catch (error) {
    console.error(`[Tag游戏搜索失败] tag=${tag}`, error)
  }
  return []
})

const getTagArticles = cache(async (locale: Locale, tag: string): Promise<ArticleItem[]> => {
  try {
    const response = await ApiClient.searchArticles(tag, {
      pageNum: 1,
      pageSize: 18,
      locale,
    })
    if (response.code === 200 && response.rows) {
      return response.rows as ArticleItem[]
    }
  } catch (error) {
    console.error(`[Tag文章搜索失败] tag=${tag}`, error)
  }
  return []
})

// ===== Skeleton =====

function TagPageSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="aspect-square bg-slate-800 rounded-lg mb-3" />
            <div className="h-4 w-3/4 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== 游戏区域 =====

async function TagGamesSection({
  locale,
  tag,
}: {
  locale: Locale
  tag: string
}) {
  const games = await getTagGames(locale, tag)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const t = {
    title:
      locale === 'zh-CN'
        ? `「${tag}」相关游戏`
        : locale === 'zh-TW'
        ? `「${tag}」相關遊戲`
        : `「${tag}」Games`,
    viewAll:
      locale === 'zh-CN' ? '查看游戏库' : locale === 'zh-TW' ? '查看遊戲庫' : 'View All Games',
    empty:
      locale === 'zh-CN'
        ? `暂无「${tag}」相关游戏`
        : locale === 'zh-TW'
        ? `暫無「${tag}」相關遊戲`
        : `No games found for 「${tag}」`,
    hot: locale === 'zh-CN' ? '热门' : locale === 'zh-TW' ? '熱門' : 'Hot',
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>{t.empty}</p>
        <Link href={`${basePath}/games`} className="mt-4 inline-flex text-sky-400 text-sm hover:underline">
          {t.viewAll} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 text-sky-400" />
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <Badge className="bg-sky-500/20 text-sky-300">{games.length}</Badge>
        </div>
        <Link href={`${basePath}/games`} className="text-sm text-sky-400 hover:underline flex items-center gap-1">
          {t.viewAll} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {games.map((game) => (
          <Link key={game.id} href={`${basePath}/games/${game.id}`} className="group">
            <Card className="h-full hover:border-sky-500/50 transition-all hover:shadow-lg">
              <div className="p-3">
                {game.iconUrl ? (
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-800 mb-3">
                    <ImageWithFallback
                      src={game.iconUrl}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-slate-800 mb-3 flex items-center justify-center text-3xl">🎮</div>
                )}
                <p className="font-medium text-sm line-clamp-2 group-hover:text-sky-400 transition-colors">
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

// ===== 文章区域 =====

async function TagArticlesSection({
  locale,
  tag,
}: {
  locale: Locale
  tag: string
}) {
  const articles = await getTagArticles(locale, tag)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const t = {
    title:
      locale === 'zh-CN'
        ? `「${tag}」相关内容`
        : locale === 'zh-TW'
        ? `「${tag}」相關內容`
        : `「${tag}」Related Content`,
    empty:
      locale === 'zh-CN'
        ? `暂无「${tag}」相关文章`
        : locale === 'zh-TW'
        ? `暫無「${tag}」相關文章`
        : `No articles found for 「${tag}」`,
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
        <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Newspaper className="h-5 w-5 text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <Badge className="bg-violet-500/20 text-violet-300">{articles.length}</Badge>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link key={article.masterArticleId} href={`${basePath}/news/${article.masterArticleId}`} className="group">
            <Card className="h-full hover:border-violet-500/50 transition-all hover:shadow-lg">
              <CardHeader className="p-4">
                <CardTitle className="text-base group-hover:text-violet-400 transition-colors line-clamp-2">
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

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>
}) {
  const { locale: localeParam, tag: rawTag } = await params

  if (!isValidLocale(localeParam)) {
    return null
  }

  const locale = localeParam as Locale
  const tag = decodeURIComponent(rawTag)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  const jsonLd = generateCollectionPageJsonLd({
    name: `${tag}`,
    description: locale === 'zh-CN' ? `「${tag}」相关游戏与攻略` : `Games and guides tagged 「${tag}」`,
    url: basePath ? `${basePath}/tag/${rawTag}` : `/tag/${rawTag}`,
    items: [],
  })

  const t = {
    tagPageTitle:
      locale === 'zh-CN'
        ? `# ${tag}`
        : locale === 'zh-TW'
        ? `# ${tag}`
        : `# ${tag}`,
    tagDesc:
      locale === 'zh-CN'
        ? `以下是与「${tag}」相关的游戏与内容，对比各大游戏盒子折扣找到最划算的玩法。`
        : locale === 'zh-TW'
        ? `以下是與「${tag}」相關的遊戲與內容，對比各大遊戲盒子折扣找到最划算的玩法。`
        : `Games and content related to 「${tag}」. Compare game box discounts to find the best deal.`,
    allTags:
      locale === 'zh-CN' ? '← 返回游戏库' : locale === 'zh-TW' ? '← 返回遊戲庫' : '← Back to Games',
    boxes:
      locale === 'zh-CN'
        ? '对比折扣盒子'
        : locale === 'zh-TW'
        ? '對比折扣盒子'
        : 'Compare Discount Boxes',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-slate-800 py-12 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <Link href={`${basePath}/games`} className="text-sm text-muted-foreground hover:text-sky-400 flex items-center gap-1 mb-4">
            {t.allTags}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Tag className="h-5 w-5 text-violet-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{tag}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-6">{t.tagDesc}</p>
          <Link
            href={`${basePath}/boxes`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-colors text-sm"
          >
            {t.boxes} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 内容区 */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        <Suspense fallback={<TagPageSkeleton />}>
          <TagGamesSection locale={locale} tag={tag} />
        </Suspense>

        <Suspense fallback={<div className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />}>
          <TagArticlesSection locale={locale} tag={tag} />
        </Suspense>
      </div>
    </>
  )
}
