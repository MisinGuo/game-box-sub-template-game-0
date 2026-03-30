import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ApiClient from '@/lib/api'
import { ArticleLayout } from '@/components/content/ArticleLayout'
import { getModuleConfig } from '@/config'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { SiteSectionSlugGroups } from '@/config/pages/content'

// 按需渲染 + ISR 缓存
export const dynamic = 'auto'
export const revalidate = 600

const moduleConfig = getModuleConfig('content')

interface ReviewDetail {
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

const getReviewDetail = cache(async (id: string, locale: Locale): Promise<ReviewDetail | null> => {
  try {
    const response = await ApiClient.getArticleDetail(parseInt(id, 10), locale)

    if (response.code === 200 && response.data) {
      return response.data
    }
  } catch (error) {
    console.error(`获取评测 ${id} 失败:`, error)
  }

  return null
})

const getAvailableReviewLocales = cache(async (id: string): Promise<Locale[]> => {
  try {
    const response = await ApiClient.getArticleLocales(parseInt(id, 10))
    if (response.code === 200 && Array.isArray(response.data)) {
      const available = response.data.filter((l: string) => 
        supportedLocales.includes(l as any)
      ) as Locale[]
      return available.length > 0 ? available : [defaultLocale]
    }
  } catch (error) {
    console.warn(`获取评测 ${id} 语言版本失败:`, error)
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
  const review = await getReviewDetail(slug, locale)
  const availableLocales = await getAvailableReviewLocales(slug)

  if (!review) {
    return { title: locale === 'zh-TW' ? '評測未找到' : locale === 'en-US' ? 'Review Not Found' : '评测未找到' }
  }

  const reviewUrl =
    locale === defaultLocale
      ? `/content/reviews/${slug}`
      : `/${locale}/content/reviews/${slug}`
  const description = review.description || review.title
  const imageUrl = review.coverImage || '/default-og-image.jpg'
  const titleSuffix = locale === 'zh-TW' ? ' | 遊戲橫評' : locale === 'en-US' ? ' | Game Reviews' : ' | 游戏横评'
  const siteNameStr = locale === 'zh-TW' ? '遊戲橫評' : locale === 'en-US' ? 'Game Reviews' : '游戏横评'

  return {
    title: `${review.title}${titleSuffix}`,
    description,
    keywords: review.tags?.join(', '),
    authors: review.author ? [{ name: review.author }] : undefined,
    openGraph: {
      title: review.title,
      description,
      url: reviewUrl,
      siteName: siteNameStr,
      locale,
      type: 'article',
      publishedTime: review.createTime,
      modifiedTime: review.updateTime,
      authors: review.author ? [review.author] : undefined,
      tags: review.tags,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: review.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: review.title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: reviewUrl },
  }
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: localeParam, slug } = await params

  if (!isValidLocale(localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale
  const review = await getReviewDetail(slug, locale)
  const availableLocales = await getAvailableReviewLocales(slug)

  if (!review) {
    notFound()
  }

  const categoryHref = locale === defaultLocale ? '/content/reviews' : `/${locale}/content/reviews`

  return (
    <ArticleLayout
      config={moduleConfig}
      frontmatter={{
        title: review.title,
        description: review.description,
        date: review.createTime,
        author: review.author,
        tags: review.tags,
        category: review.categoryName || (locale === 'zh-TW' ? '橫評' : locale === 'en-US' ? 'Review' : '评测'),
      }}
      content={review.content}
      readingTime={Math.ceil(review.content.length / 500)}
      toc={[]}
      availableLocales={availableLocales}
      breadcrumbCategoryHref={categoryHref}
    />
  )
}
