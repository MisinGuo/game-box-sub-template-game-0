import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense, cache } from 'react'
import { ChevronRight, Newspaper, Calendar, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, defaultLocale, getTranslation, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { SiteSectionSlugGroups } from '@/config/pages/content'
import ImageWithFallback from '../ImageWithFallback'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'

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
    return { title: '游戏资讯' }
  }

  const locale = localeParam as Locale
  const listPath = '/news'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'strategy', {
    title:
      locale === 'zh-CN'
        ? '游戏资讯速报 - 版本更新·活动·行业动态'
        : locale === 'zh-TW'
        ? '遊戲資訊速報 - 版本更新·活動·行業動態'
        : 'Game News - Updates, Events & Industry',
    description:
      locale === 'zh-CN'
        ? '手游版本更新、平台活动资讯、行业动态一站速览，第一时间掌握游戏圈最新动向'
        : locale === 'zh-TW'
        ? '手遊版本更新、平台活動資訊、行業動態一站速覽，第一時間掌握遊戲圈最新動向'
        : 'Game version updates, platform events and industry news in one place.',
    keywords:
      locale === 'zh-CN'
        ? '游戏资讯,手游更新,游戏活动,手游行业动态'
        : 'game news,mobile game update,game event,game industry',
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
export const revalidate = 180

interface NewsArticle {
  masterArticleId: number
  title: string
  description?: string
  coverImage?: string
  categoryName?: string
  section?: string
  viewCount?: number
  createTime: string
}

async function getArticlesBySections(locale: Locale, sections: readonly string[]): Promise<NewsArticle[]> {
  const articleMap = new Map<number, NewsArticle>()

  for (const section of sections) {
    try {
      const response = await ApiClient.getArticles({
        pageNum: 1,
        pageSize: 200,
        locale,
        section,
      })

      if (response.code === 200 && response.rows) {
        for (const article of response.rows as NewsArticle[]) {
          if (article?.masterArticleId) {
            articleMap.set(article.masterArticleId, article)
          }
        }
      }
    } catch (error) {
      console.error(`获取资讯 section=${section} 失败:`, error)
    }
  }

  return Array.from(articleMap.values())
}

const getNewsArticles = cache(async (locale: Locale) => {
  return getArticlesBySections(locale, SiteSectionSlugGroups.news as readonly string[])
})

function formatDate(dateString: string, locale: Locale): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (locale === 'en-US') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    return dateString.substring(0, 10)
  } catch {
    return dateString.substring(0, 10)
  }
}

function ArticlesGridSkeleton() {
  return (
    <div className="space-y-14">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="h-5 w-3/4 bg-slate-800 rounded animate-pulse mb-3" />
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 异步组件：资讯列表
async function NewsArticlesSection({
  locale,
}: {
  locale: Locale
}) {
  const articles = await getNewsArticles(locale)
  const groupedArticles = Array.from(
    articles.reduce((map, article) => {
      const groupName = article.categoryName?.trim() || (locale === 'en-US' ? 'Uncategorized' : locale === 'zh-TW' ? '未分類' : '未分类')
      if (!map.has(groupName)) {
        map.set(groupName, [])
      }
      map.get(groupName)!.push(article)
      return map
    }, new Map<string, NewsArticle[]>())
  )

  const basePath = locale === 'zh-CN' ? '' : `/${locale}`

  const ArticleCard = ({ article }: { article: NewsArticle }) => (
    <Link href={`${basePath}/news/${article.masterArticleId}`} className="group">
      <Card className="h-full hover:shadow-lg transition-all hover:border-sky-500/50">
        <div className={`grid ${article.coverImage ? 'sm:grid-cols-[100px_1fr]' : ''} gap-0`}>
          {article.coverImage && (
            <div className="aspect-square overflow-hidden rounded-l-lg bg-slate-800">
              <ImageWithFallback
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader className="p-4">
            <CardTitle className="text-base group-hover:text-sky-400 transition-colors line-clamp-2">
              {article.title}
            </CardTitle>
            {article.description && (
              <CardDescription className="line-clamp-2 text-xs">{article.description}</CardDescription>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(article.createTime, locale)}
              </span>
              {article.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {article.viewCount}
                </span>
              )}
            </div>
          </CardHeader>
        </div>
      </Card>
    </Link>
  )

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-2xl font-bold mb-2">
          {locale === 'zh-CN' ? '暂无资讯' : locale === 'zh-TW' ? '暫無資訊' : 'No news yet'}
        </h3>
        <p className="text-muted-foreground">
          {locale === 'zh-CN' ? '敬请期待最新资讯' : locale === 'zh-TW' ? '敬請期待最新資訊' : 'Stay tuned for updates'}
        </p>
        <div className="mt-8">
          <Link
            href={`${basePath}/content`}
            className="text-sky-500 hover:underline text-sm"
          >
            {locale === 'zh-CN' ? '← 前往内容中心' : locale === 'zh-TW' ? '← 前往內容中心' : '← Back to Content Center'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionPageJsonLd({
            name: locale === 'zh-CN' ? '游戏资讯' : locale === 'zh-TW' ? '遊戲資訊' : 'Game News',
            description: locale === 'zh-CN'
              ? '手游版本更新、平台活动资讯、行业动态一站速览'
              : locale === 'zh-TW'
              ? '手遊版本更新、平台活動資訊、行業動態一站速覽'
              : 'Game version updates, platform events and industry news in one place.',
            url: basePath ? `${basePath}/news` : '/news',
            items: articles.slice(0, 30).map((article) => ({
              name: article.title,
              url: `${basePath}/news/${article.masterArticleId}`,
              image: article.coverImage,
            })),
          })),
        }}
      />
      {groupedArticles.map(([groupName, items]) => (
        <div key={groupName} id={encodeURIComponent(groupName)} className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-sky-500/20 flex items-center justify-center text-2xl">📰</div>
            <div>
              <h2 className="text-2xl font-bold">{groupName}</h2>
            </div>
            <Badge className="bg-sky-500/20 text-sky-700 dark:text-sky-300 ml-auto">{items.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((article: NewsArticle) => (
              <ArticleCard key={article.masterArticleId} article={article} />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return null
  }

  const locale = localeParam as Locale
  const t = (key: string) => getTranslation(key, locale)
  const basePath = locale === 'zh-CN' ? '' : `/${locale}`

  return (
    <div className="min-h-screen bg-background">
      {/* 面包屑 */}
      <div className="container py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={locale === 'zh-CN' ? '/' : `/${locale}`}
            className="hover:text-foreground transition-colors"
          >
            {t('home')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">
            {locale === 'zh-CN' ? '资讯速报' : locale === 'zh-TW' ? '資訊速報' : 'News'}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-background relative overflow-hidden">
        <div className="container py-12 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-700 dark:text-sky-300">
              <Newspaper className="h-4 w-4" />
              <span className="font-semibold text-sm">
                <Suspense fallback="...">
                  <ArticleCountBadge locale={locale} />
                </Suspense>
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {locale === 'zh-CN' ? '资讯速报' : locale === 'zh-TW' ? '資訊速報' : 'Game News'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {locale === 'zh-CN'
                ? '版本更新 · 活动资讯 · 行业动态 — 平台与游戏的最新动向，一站速览'
                : locale === 'zh-TW'
                ? '版本更新 · 活動資訊 · 行業動態 — 平台與遊戲的最新動向，一站速覽'
                : 'Version updates, events and industry news — all in one place'}
            </p>
          </div>
        </div>
      </section>

      {/* 资讯列表 */}
      <Suspense fallback={
        <section className="container py-12">
          <ArticlesGridSkeleton />
        </section>
      }>
        <section className="container py-12 space-y-14">
          <NewsArticlesSection locale={locale} />
        </section>
      </Suspense>
    </div>
  )
}

// 异步组件：文章数量显示
async function ArticleCountBadge({ locale }: { locale: Locale }) {
  const articles = await getNewsArticles(locale)
  return (
    <span>
      {articles.length} {locale === 'en-US' ? 'Articles' : locale === 'zh-TW' ? '條資訊' : '条资讯'}
    </span>
  )
}
