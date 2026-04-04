import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Layers, Calendar, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, defaultLocale, getTranslation, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { SiteSectionSlugGroups } from '@/config/pages/content'
import ImageWithFallback from '../../ImageWithFallback'
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
    return { title: '游戏专题' }
  }

  const locale = localeParam as Locale
  const listPath = '/content/topics'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'strategy', {
    title:
      locale === 'zh-CN'
        ? '专题中心 - 排行榜·省钱·礼包·品类推荐'
        : locale === 'zh-TW'
        ? '專題中心 - 排行榜·省錢·禮包·品類推薦'
        : 'Topic Hub - Rankings · Saving · Gifts · Categories',
    description:
      locale === 'zh-CN'
        ? '系统自动维护的游戏专题：热度排行榜、省钱攻略、礼包大全、品类精选，数据实时更新'
        : locale === 'zh-TW'
        ? '系統自動維護的遊戲專題：熱度排行榜、省錢攻略、禮包大全、品類精選'
        : 'Auto-maintained game topics: rankings, saving guides, gift packs, category picks.',
    keywords:
      locale === 'zh-CN'
        ? '游戏排行榜,手游省钱,礼包大全,手游推荐'
        : 'game ranking,mobile game saving,gift pack list,game recommendation',
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

interface TopicArticle {
  masterArticleId: number
  title: string
  description?: string
  coverImage?: string
  categoryName?: string
  section?: string
  viewCount?: number
  createTime: string
}

async function getArticlesBySections(locale: Locale, sections: readonly string[]): Promise<TopicArticle[]> {
  const articleMap = new Map<number, TopicArticle>()

  for (const section of sections) {
    try {
      const response = await ApiClient.getArticles({
        pageNum: 1,
        pageSize: 200,
        locale,
        section,
      })

      if (response.code === 200 && response.rows) {
        for (const article of response.rows as TopicArticle[]) {
          if (article?.masterArticleId) {
            articleMap.set(article.masterArticleId, article)
          }
        }
      }
    } catch (error) {
      console.error(`获取专题 section=${section} 失败:`, error)
    }
  }

  return Array.from(articleMap.values())
}

async function getTopicArticles(locale: Locale) {
  return getArticlesBySections(locale, SiteSectionSlugGroups.topics as readonly string[])
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

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return null
  }

  const locale = localeParam as Locale
  const articles = await getTopicArticles(locale)
  const groupedArticles = Array.from(
    articles.reduce((map, article) => {
      const groupName = article.categoryName?.trim() || (locale === 'en-US' ? 'Uncategorized' : locale === 'zh-TW' ? '未分類' : '未分类')
      if (!map.has(groupName)) {
        map.set(groupName, [])
      }
      map.get(groupName)!.push(article)
      return map
    }, new Map<string, TopicArticle[]>())
  )

  const t = (key: string) => getTranslation(key, locale)
  const basePath = locale === 'zh-CN' ? '' : `/${locale}`

  const ArticleCard = ({ article }: { article: TopicArticle }) => (
    <Link href={`${basePath}/content/topics/${article.masterArticleId}`} className="group">
      <Card className="h-full hover:shadow-lg transition-all hover:border-emerald-500/50">
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
            <CardTitle className="text-base group-hover:text-emerald-400 transition-colors line-clamp-2">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionPageJsonLd({
            name: locale === 'zh-CN' ? '专题' : locale === 'zh-TW' ? '專題' : 'Topics',
            description: locale === 'zh-CN'
              ? '系统自动维护的游戏专题：热度排行榜、省钱攻略、礼包大全、品类精选'
              : locale === 'zh-TW'
              ? '系統自動維護的遊戲專題：熱度排行榜、省錢攻略、禮包大全、品類精選'
              : 'Auto-maintained game topics: rankings, saving guides, gift packs, category picks.',
            url: basePath ? `${basePath}/content/topics` : '/content/topics',
            items: articles.slice(0, 30).map((article) => ({
              name: article.title,
              url: `${basePath}/content/topics/${article.masterArticleId}`,
              image: article.coverImage,
            })),
          })),
        }}
      />
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
            {locale === 'zh-CN' ? '专题' : locale === 'zh-TW' ? '專題' : 'Topics'}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-background relative overflow-hidden">
        <div className="container py-12 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              <Layers className="h-4 w-4" />
              <span className="font-semibold text-sm">{articles.length} {locale === 'en-US' ? 'Topics' : locale === 'zh-TW' ? '個專題' : '个专题'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {locale === 'zh-CN' ? '专题' : locale === 'zh-TW' ? '專題' : 'Topics'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {locale === 'zh-CN'
                ? '系统自动维护，数据实时更新 — 排行榜、省钱、礼包、品类，一站全览'
                : locale === 'zh-TW'
                ? '系統自動維護，數據實時更新 — 排行榜、省錢、禮包、品類，一站全覽'
                : 'Auto-maintained, always up to date — rankings, saving, gifts, and more'}
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

      {/* 专题列表 */}
      <section className="container py-12 space-y-14">
        {groupedArticles.map(([groupName, items]) => (
          <div key={groupName} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-2xl">🗂️</div>
              <div>
                <h2 className="text-2xl font-bold">{groupName}</h2>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ml-auto">{items.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((article: TopicArticle) => (
                <ArticleCard key={article.masterArticleId} article={article} />
              ))}
            </div>
          </div>
        ))}

        {/* 空态 */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗂️</div>
            <h3 className="text-2xl font-bold mb-2">{t('noArticles')}</h3>
            <p className="text-muted-foreground">{t('stayTuned')}</p>
          </div>
        )}
      </section>
    </div>
  )
}
