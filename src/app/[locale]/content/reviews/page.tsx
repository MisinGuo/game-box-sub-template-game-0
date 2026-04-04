import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BarChart2, Calendar, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, defaultLocale, getTranslation, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { SiteSectionSlugGroups } from '@/config/pages/content'
import ImageWithFallback from '../../ImageWithFallback'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'
import { siteConfig } from '@/config'

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
    return { title: '游戏评测' }
  }

  const locale = localeParam as Locale
  const listPath = '/content/reviews'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'strategy', {
    title:
      locale === 'zh-CN'
        ? '横评中心 - 游戏横评·盒子横评'
        : locale === 'zh-TW'
        ? '橫評中心 - 遊戲橫評·盒子橫評'
        : 'Review Hub - Game & Box Comparisons',
    description:
      locale === 'zh-CN'
        ? '同品类游戏数据横评，多平台盒子折扣横评，帮你选出最值得玩、最划算的'
        : locale === 'zh-TW'
        ? '同品類遊戲數據橫評，多平台盒子折扣橫評，幫你選出最值得玩、最划算的'
        : 'Data-driven game and box comparisons to find the best picks.',
    keywords:
      locale === 'zh-CN'
        ? '游戏横评,盒子横评,手游对比,盒子折扣对比'
        : 'game comparison,box review,mobile game review',
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

export const dynamic = 'auto'
export const revalidate = 180

interface ReviewArticle {
  masterArticleId: number
  title: string
  description?: string
  coverImage?: string
  categoryName?: string
  section?: string
  viewCount?: number
  createTime: string
}

async function getArticlesBySections(locale: Locale, sections: readonly string[]): Promise<ReviewArticle[]> {
  const articleMap = new Map<number, ReviewArticle>()

  for (const section of sections) {
    try {
      const response = await ApiClient.getArticles({
        pageNum: 1,
        pageSize: 200,
        locale,
        section,
      })

      if (response.code === 200 && response.rows) {
        for (const article of response.rows as ReviewArticle[]) {
          if (article?.masterArticleId) {
            articleMap.set(article.masterArticleId, article)
          }
        }
      }
    } catch (error) {
      console.error(`获取评测 section=${section} 失败:`, error)
    }
  }

  return Array.from(articleMap.values())
}

async function getReviewArticles(locale: Locale) {
  return getArticlesBySections(locale, SiteSectionSlugGroups.reviews as readonly string[])
}

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

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return null
  }

  const locale = localeParam as Locale
  const articles = await getReviewArticles(locale)
  const groupedArticles = Array.from(
    articles.reduce((map, article) => {
      const groupName = article.categoryName?.trim() || (locale === 'en-US' ? 'Uncategorized' : locale === 'zh-TW' ? '未分類' : '未分类')
      if (!map.has(groupName)) {
        map.set(groupName, [])
      }
      map.get(groupName)!.push(article)
      return map
    }, new Map<string, ReviewArticle[]>())
  )

  const t = (key: string) => getTranslation(key, locale)
  const basePath = locale === 'zh-CN' ? '' : `/${locale}`

  const jsonLd = generateCollectionPageJsonLd({
    name: locale === 'zh-CN' ? '游戏评测' : locale === 'zh-TW' ? '遊戲評測' : 'Game Reviews',
    description: locale === 'zh-CN' ? '同品类游戏数据横评，多平台盒子折扣横评' : locale === 'zh-TW' ? '同品類遊戲數據橫評，多平台盒子折扣橫評' : 'Data-driven game and box comparisons across platforms',
    url: locale === 'zh-CN' ? '/content/reviews' : `/${locale}/content/reviews`,
    items: articles.slice(0, 10).map(a => ({
      name: a.title,
      url: `${basePath}/content/reviews/${a.masterArticleId}`,
      image: a.coverImage,
    })),
  })

  const ArticleCard = ({ article }: { article: ReviewArticle }) => (
    <Link href={`${basePath}/content/reviews/${article.masterArticleId}`} className="group">
      <Card className="h-full hover:shadow-lg transition-all hover:border-indigo-500/50">
        <div className={`grid ${article.coverImage ? 'md:grid-cols-[120px_1fr]' : ''} gap-0`}>
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
            <CardTitle className="text-base group-hover:text-indigo-400 transition-colors line-clamp-2">
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

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
          <Link href={`${basePath}/content`} className="hover:text-foreground transition-colors">
            {t('content')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">
            {locale === 'zh-CN' ? '评测' : locale === 'zh-TW' ? '評測' : 'Reviews'}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background relative overflow-hidden">
        <div className="container py-12 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              <BarChart2 className="h-4 w-4" />
              <span className="font-semibold text-sm">{articles.length} {locale === 'en-US' ? 'Reviews' : locale === 'zh-TW' ? '篇橫評' : '篇横评'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {locale === 'zh-CN' ? '评测' : locale === 'zh-TW' ? '評測' : 'Reviews'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {locale === 'zh-CN'
                ? '数据横评，让选择有据可依 — 游戏好不好、盒子值不值，数字说话'
                : locale === 'zh-TW'
                ? '數據橫評，讓選擇有據可依 — 遊戲好不好、盒子值不值，數字說話'
                : 'Data-driven comparisons — is the game worth it? Is the box a good deal?'}
            </p>
            {groupedArticles.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {groupedArticles.slice(0, 6).map(([groupName]) => (
                  <Badge key={groupName} variant="outline" className="text-sm px-3 py-1.5">
                    {groupName}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 评测列表 */}
      <section className="container py-12 space-y-14">
        {groupedArticles.map(([groupName, items]) => (
          <div key={groupName} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-2xl">📊</div>
              <div>
                <h2 className="text-2xl font-bold">{groupName}</h2>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ml-auto">
                {items.length}
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((article: ReviewArticle) => (
                <ArticleCard key={article.masterArticleId} article={article} />
              ))}
            </div>
          </div>
        ))}

        {/* 空态 */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">{t('noArticles')}</h3>
            <p className="text-muted-foreground">{t('stayTuned')}</p>
          </div>
        )}
      </section>
    </div>
  )
}
