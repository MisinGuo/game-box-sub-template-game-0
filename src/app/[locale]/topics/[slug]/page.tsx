import { cache, Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ApiClient from '@/lib/api'
import { ArticleLayout } from '@/components/content/ArticleLayout'
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'
import { getModuleConfig } from '@/config'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'

export const dynamic = 'auto'
export const revalidate = 600

const moduleConfig = getModuleConfig('content')

interface TopicDetail {
  id: number
  title: string
  description?: string
  content: string
  coverImage?: string
  categoryName?: string
  author?: string
  createTime: string
  updateTime?: string
  viewCount?: number
  tags?: string[]
  section?: string
  locale?: string
}

const getTopicDetail = cache(async (id: string, locale: Locale): Promise<TopicDetail | null> => {
  try {
    const response = await ApiClient.getArticleDetail(parseInt(id, 10), locale)
    if (response.code === 200 && response.data) {
      return response.data
    }
  } catch (error) {
    console.error(`获取专题 ${id} 失败:`, error)
  }
  return null
})

const getAvailableTopicLocales = cache(async (id: string): Promise<Locale[]> => {
  try {
    const response = await ApiClient.getArticleLocales(parseInt(id, 10))
    if (response.code === 200 && Array.isArray(response.data)) {
      const available = response.data.filter((l: string) =>
        supportedLocales.includes(l as any)
      ) as Locale[]
      return available.length > 0 ? available : [defaultLocale]
    }
  } catch (error) {
    console.warn(`获取专题 ${id} 语言版本失败:`, error)
  }
  return [defaultLocale]
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  if (!isValidLocale(localeParam)) return {}

  const locale = localeParam as Locale
  const topic = await getTopicDetail(slug, locale)
  const availableLocales = await getAvailableTopicLocales(slug)

  if (!topic) {
    return { title: locale === 'zh-TW' ? '專題未找到' : locale === 'en-US' ? 'Topic Not Found' : '专题未找到' }
  }

  const topicUrl =
    locale === defaultLocale ? `/topics/${slug}` : `/${locale}/topics/${slug}`
  const description = topic.description || topic.title
  const imageUrl = topic.coverImage || '/default-og-image.jpg'
  const titleSuffix =
    locale === 'zh-TW' ? ' | 遊戲專題' : locale === 'en-US' ? ' | Game Topics' : ' | 游戏专题'

  const languages: Record<string, string> = {}
  if (availableLocales.length > 1) {
    availableLocales.forEach(l => {
      languages[l] = l === defaultLocale ? `/topics/${slug}` : `/${l}/topics/${slug}`
    })
    languages['x-default'] = `/topics/${slug}`
  }

  return {
    title: `${topic.title}${titleSuffix}`,
    description,
    keywords: topic.tags?.join(', '),
    authors: topic.author ? [{ name: topic.author }] : undefined,
    openGraph: {
      title: topic.title,
      description,
      url: topicUrl,
      siteName: locale === 'zh-TW' ? '遊戲專題' : locale === 'en-US' ? 'Game Topics' : '游戏专题',
      locale,
      type: 'article',
      publishedTime: topic.createTime,
      modifiedTime: topic.updateTime,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: topic.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: topicUrl,
      ...(availableLocales.length > 1 && { languages }),
    },
  }
}

function ArticleContentSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b py-3">
        <div className="container mx-auto px-4">
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="h-9 w-3/4 bg-muted rounded animate-pulse mb-3" />
        <div className="h-5 w-1/3 bg-muted rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: localeParam, slug } = await params
  if (!isValidLocale(localeParam)) notFound()

  const locale = localeParam as Locale

  return (
    <Suspense fallback={<ArticleContentSkeleton />}>
      <TopicArticleContent slug={slug} locale={locale} />
    </Suspense>
  )
}

async function TopicArticleContent({ slug, locale }: { slug: string; locale: Locale }) {
  const [topic, availableLocales] = await Promise.all([
    getTopicDetail(slug, locale),
    getAvailableTopicLocales(slug),
  ])

  if (!topic) notFound()

  const categoryHref = locale === defaultLocale ? '/topics' : `/${locale}/topics`
  const topicUrl = locale === defaultLocale ? `/topics/${slug}` : `/${locale}/topics/${slug}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleJsonLd({
            title: topic.title,
            description: topic.description,
            coverImage: topic.coverImage,
            author: topic.author,
            createTime: topic.createTime,
            updateTime: topic.updateTime,
            url: topicUrl,
            tags: topic.tags,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            {
              name: locale === 'zh-TW' ? '首頁' : locale === 'en-US' ? 'Home' : '首页',
              url: locale === defaultLocale ? '/' : `/${locale}`,
            },
            {
              name: locale === 'zh-TW' ? '專題合集' : locale === 'en-US' ? 'Topics' : '专题合集',
              url: locale === defaultLocale ? '/topics' : `/${locale}/topics`,
            },
            { name: topic.title, url: topicUrl },
          ])),
        }}
      />
      <ArticleLayout
        config={moduleConfig}
        frontmatter={{
          title: topic.title,
          description: topic.description,
          date: topic.createTime,
          author: topic.author,
          tags: topic.tags,
          category:
            topic.categoryName ||
            (locale === 'zh-TW' ? '專題' : locale === 'en-US' ? 'Topic' : '专题'),
        }}
        content={topic.content}
        readingTime={Math.ceil(topic.content.length / 500)}
        toc={[]}
        availableLocales={availableLocales}
        breadcrumbCategoryHref={categoryHref}
      />
    </>
  )
}
