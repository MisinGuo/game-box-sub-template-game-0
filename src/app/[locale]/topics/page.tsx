import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { siteConfig } from '@/config/site/site'
import ApiClient from '@/lib/api'
import ImageWithFallback from '../ImageWithFallback'

export const dynamic = 'auto'
export const revalidate = 600

export async function generateStaticParams() {
  return supportedLocales
    .filter(locale => locale !== defaultLocale)
    .map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  if (!isValidLocale(localeParam)) return { title: 'Topics' }
  const locale = localeParam as Locale

  const title =
    locale === 'zh-TW'
      ? '專題合集 | ' + siteConfig.name
      : locale === 'en-US'
      ? 'Topic Hub | ' + siteConfig.name
      : '专题合集 | ' + siteConfig.name
  const description =
    locale === 'zh-TW'
      ? '瀏覽所有遊戲專題合集，探索精選遊戲內容。'
      : locale === 'en-US'
      ? 'Browse all game topic collections and explore curated content.'
      : '浏览所有游戏专题合集，探索精选游戏内容。'
  const canonicalUrl =
    locale === defaultLocale
      ? `${siteConfig.hostname}/topics`
      : `${siteConfig.hostname}/${locale}/topics`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, type: 'website' },
  }
}

interface TopicItem {
  masterArticleId: number
  title: string
  description?: string
  coverImage?: string
  coverUrl?: string
  createTime?: string
}

async function getTopics(locale: Locale): Promise<TopicItem[]> {
  try {
    const response = await ApiClient.getTopics({ locale, pageNum: 1, pageSize: 100 })
    if (response.code === 200 && response.rows) {
      return response.rows as TopicItem[]
    }
  } catch (error) {
    console.error('[topics] 获取专题列表失败:', error)
  }
  return []
}

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  if (!isValidLocale(localeParam)) return null

  const locale = localeParam as Locale
  const topics = await getTopics(locale)
  const basePath = locale === defaultLocale ? '' : `/${locale}`

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="border-b bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-background">
        <div className="container py-10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-purple-500" />
            <h1 className="text-3xl font-bold">
              {locale === 'zh-TW' ? '專題合集' : locale === 'en-US' ? 'Topic Hub' : '专题合集'}
            </h1>
          </div>
          <p className="text-sm mt-2 text-muted-foreground">
            {locale === 'zh-TW'
              ? '探索精心策劃的遊戲專題，發現更多精彩內容'
              : locale === 'en-US'
              ? 'Explore curated game topic collections and discover great content'
              : '探索精心策划的游戏专题，发现更多精彩内容'}
          </p>
        </div>
      </div>

      {/* 专题列表 */}
      <div className="container py-10">
        {topics.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {locale === 'zh-TW' ? '暫無專題' : locale === 'en-US' ? 'No topics yet' : '暂无专题'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map(topic => {
              const coverSrc = topic.coverImage || topic.coverUrl
              return (
                <Link key={topic.masterArticleId} href={`${basePath}/topics/${topic.masterArticleId}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-purple-500/50 cursor-pointer group overflow-hidden">
                    <div className="relative h-44 overflow-hidden bg-muted">
                      {coverSrc ? (
                        <ImageWithFallback
                          src={coverSrc}
                          alt={topic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                      )}
                    </div>
                    <CardHeader className="p-5">
                      <CardTitle className="text-base group-hover:text-purple-400 transition-colors line-clamp-2">
                        {topic.title}
                      </CardTitle>
                      {topic.description && (
                        <CardDescription className="line-clamp-2 text-xs mt-2">{topic.description}</CardDescription>
                      )}
                      {topic.createTime && (
                        <p className="text-xs mt-3 text-muted-foreground">{topic.createTime.substring(0, 10)}</p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
