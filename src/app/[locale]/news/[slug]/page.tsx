import { cache, Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ApiClient from '@/lib/api'
import { ArticleLayout } from '@/components/content/ArticleLayout'
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'
import { getModuleConfig } from '@/config'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { SiteSectionSlugGroups } from '@/config/pages/content'

const moduleConfig = getModuleConfig('news')

export const dynamic = 'auto'
export const revalidate = 300

interface NewsDetail {
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

const getNewsDetail = cache(async (id: string, locale: Locale): Promise<NewsDetail | null> => {
  try {
    const response = await ApiClient.getArticleDetail(parseInt(id, 10), locale)

    if (response.code === 200 && response.data) {
      return response.data
    }
  } catch (error) {
    console.error(`获取资讯 ${id} 失败:`, error)
  }

  return null
})

const getAvailableNewsLocales = cache(async (id: string): Promise<Locale[]> => {
  try {
    // 使用轻量级接口获取可用语言版本 (backend optimized)
    const response = await ApiClient.getArticleLocales(parseInt(id, 10))
    
    if (response.code === 200 && Array.isArray(response.data)) {
      // 过滤出系统支持的语言
      const available = response.data.filter((l: string) => 
        supportedLocales.includes(l as any)
      ) as Locale[]
      
      return available.length > 0 ? available : [defaultLocale]
    }
  } catch (error) {
    console.warn(`获取资讯 ${id} 语言版本失败:`, error)
  }
  return [defaultLocale]
})

// Skeleton 加载组件
function ArticleContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-3/4 bg-slate-800 rounded animate-pulse" />
      <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
      <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse" />
    </div>
  )
}

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
  const news = await getNewsDetail(slug, locale)
  const availableNewsLocales = await getAvailableNewsLocales(slug)

  if (!news) {
    return {
      title: locale === 'en-US' ? 'News Not Found' : locale === 'zh-TW' ? '資訊未找到' : '资讯未找到',
    }
  }

  const newsUrl =
    locale === defaultLocale ? `/news/${slug}` : `/${locale}/news/${slug}`
  const description = news.description || news.title
  const imageUrl = news.coverImage || '/default-og-image.jpg'
  const titleSuffix = locale === 'en-US' ? ' | Game News' : locale === 'zh-TW' ? ' | 遊戲資訊' : ' | 游戏资讯'
  const siteName = locale === 'en-US' ? 'Game News' : locale === 'zh-TW' ? '遊戲資訊速報' : '游戏资讯速报'

  const languages: Record<string, string> = {}
  if (availableNewsLocales.length > 1) {
    availableNewsLocales.forEach(l => {
      languages[l] = l === defaultLocale ? `/news/${slug}` : `/${l}/news/${slug}`
    })
    languages['x-default'] = `/news/${slug}`
  }

  return {
    title: `${news.title}${titleSuffix}`,
    description,
    keywords: news.tags?.join(', '),
    authors: news.author ? [{ name: news.author }] : undefined,
    openGraph: {
      title: news.title,
      description,
      url: newsUrl,
      siteName,
      locale,
      type: 'article',
      publishedTime: news.createTime,
      modifiedTime: news.updateTime,
      authors: news.author ? [news.author] : undefined,
      tags: news.tags,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: news.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: newsUrl,
      ...(availableNewsLocales.length > 1 && { languages }),
    },
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: localeParam, slug } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale
  const news = await getNewsDetail(slug, locale)

  if (!news) {
    notFound()
  }

  const categoryHref = `${locale === defaultLocale ? '/news' : `/${locale}/news`}#${encodeURIComponent(
    news.categoryName || (locale === 'en-US' ? 'News' : locale === 'zh-TW' ? '資訊' : '资讯')
  )}`

  const newsUrl = locale === defaultLocale ? `/news/${slug}` : `/${locale}/news/${slug}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleJsonLd({
            title: news.title,
            description: news.description,
            coverImage: news.coverImage,
            author: news.author,
            createTime: news.createTime,
            updateTime: news.updateTime,
            url: newsUrl,
            tags: news.tags,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            { name: locale === 'zh-TW' ? '首頁' : locale === 'en-US' ? 'Home' : '首页', url: locale === defaultLocale ? '/' : `/${locale}` },
            { name: locale === 'zh-TW' ? '遊戲資訊' : locale === 'en-US' ? 'News' : '游戏资讯', url: locale === defaultLocale ? '/news' : `/${locale}/news` },
            { name: news.title, url: newsUrl },
          ])),
        }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <ArticleContentSkeleton />
          </div>
        </div>
      }>
        <NewsArticleContent
        id={slug}
        news={news}
        categoryHref={categoryHref}
        locale={locale}
        moduleConfig={moduleConfig}
      />
    </Suspense>
    </>
  )
}

// 异步子组件：文章内容
async function NewsArticleContent({
  id,
  news,
  categoryHref,
  locale,
  moduleConfig,
}: {
  id: string
  news: NewsDetail
  categoryHref: string
  locale: Locale
  moduleConfig: ReturnType<typeof getModuleConfig>
}) {
  const availableLocales = await getAvailableNewsLocales(id)

  return (
    <ArticleLayout
      config={moduleConfig}
      frontmatter={{
        title: news.title,
        description: news.description,
        date: news.createTime,
        author: news.author,
        tags: news.tags,
        category: news.categoryName || (locale === 'en-US' ? 'News' : locale === 'zh-TW' ? '資訊' : '资讯'),
      }}
      content={news.content}
      readingTime={Math.ceil(news.content.length / 500)}
      toc={[]}
      availableLocales={availableLocales}
      breadcrumbCategoryHref={categoryHref}
    />
  )
}
