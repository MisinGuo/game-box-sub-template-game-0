import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ApiClient from '@/lib/api'
import { ArticleLayout } from '@/components/content/ArticleLayout'
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'
import { getModuleConfig } from '@/config'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { SiteSectionSlugGroups } from '@/config/pages/content'

// 按需渲染 + ISR 缓存
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

function normalizeLocale(value?: string): string | undefined {
  return value ? value.replace('_', '-') : undefined
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

  if (!isValidLocale(localeParam)) {
    return {}
  }

  const locale = localeParam as Locale
  const topic = await getTopicDetail(slug, locale)
  const availableLocales = await getAvailableTopicLocales(slug)

  if (!topic) {
    return { title: locale === 'zh-TW' ? '專題未找到' : locale === 'en-US' ? 'Topic Not Found' : '专题未找到' }
  }

  const topicUrl =
    locale === defaultLocale
      ? `/content/topics/${slug}`
      : `/${locale}/content/topics/${slug}`
  const description = topic.description || topic.title
  const imageUrl = topic.coverImage || '/default-og-image.jpg'
  const titleSuffix = locale === 'zh-TW' ? ' | 遊戲專題' : locale === 'en-US' ? ' | Game Topics' : ' | 游戏专题'
  const siteNameStr = locale === 'zh-TW' ? '遊戲專題' : locale === 'en-US' ? 'Game Topics' : '游戏专题'

  const languages: Record<string, string> = {}
  if (availableLocales.length > 1) {
    availableLocales.forEach(l => {
      languages[l] = l === defaultLocale ? `/content/topics/${slug}` : `/${l}/content/topics/${slug}`
    })
    languages['x-default'] = `/content/topics/${slug}`
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
      siteName: siteNameStr,
      locale,
      type: 'article',
      publishedTime: topic.createTime,
      modifiedTime: topic.updateTime,
      authors: topic.author ? [topic.author] : undefined,
      tags: topic.tags,
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

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: localeParam, slug } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale
  const topic = await getTopicDetail(slug, locale)
  const availableLocales = await getAvailableTopicLocales(slug)

  if (!topic) {
    notFound()
  }

  const categoryHref = locale === defaultLocale ? '/content/topics' : `/${locale}/content/topics`
  const topicUrl = locale === defaultLocale ? `/content/topics/${slug}` : `/${locale}/content/topics/${slug}`

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
            { name: locale === 'zh-TW' ? '首頁' : locale === 'en-US' ? 'Home' : '首页', url: locale === defaultLocale ? '/' : `/${locale}` },
            { name: locale === 'zh-TW' ? '內容中心' : locale === 'en-US' ? 'Content' : '内容中心', url: locale === defaultLocale ? '/content' : `/${locale}/content` },
            { name: locale === 'zh-TW' ? '專題' : locale === 'en-US' ? 'Topics' : '专题', url: locale === defaultLocale ? '/content/topics' : `/${locale}/content/topics` },
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
        category: topic.categoryName || (locale === 'zh-TW' ? '專題' : locale === 'en-US' ? 'Topic' : '专题'),
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
