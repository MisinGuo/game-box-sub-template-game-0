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

// 获取模块配置（使用内容中心模块配置）
const moduleConfig = getModuleConfig('content')

// 攻略文章详情数据类型
interface GuideDetail {
  id: number
  title: string
  description?: string
  content: string
  coverImage?: string
  categoryName?: string
  categoryId?: number
  author?: string
  createTime: string
  updateTime?: string
  viewCount?: number
  likeCount?: number
  tags?: string[]
  section?: string
  locale?: string
}

function normalizeLocale(value?: string): string | undefined {
  return value ? value.replace('_', '-') : undefined
}

// 获取攻略详情（cache() 确保同一次渲染内相同参数只发一次 HTTP 请求）
const getGuideDetail = cache(async (id: string, locale: Locale): Promise<GuideDetail | null> => {
  try {
    const response = await ApiClient.getArticleDetail(parseInt(id, 10), locale)
    
    if (response.code === 200 && response.data) {
      return response.data
    }
  } catch (error) {
    console.error(`获取攻略 ${id} 失败:`, error)
  }
  
  return null
})

const getAvailableGuideLocales = cache(async (id: string): Promise<Locale[]> => {
  try {
    // 使用轻量级接口获取可用语言版本
    const response = await ApiClient.getArticleLocales(parseInt(id, 10))
    
    if (response.code === 200 && Array.isArray(response.data)) {
      const available = response.data.filter((l: string) => 
        supportedLocales.includes(l as any)
      ) as Locale[]
      return available.length > 0 ? available : [defaultLocale]
    }
  } catch (error) {
    console.warn(`获取攻略 ${id} 语言版本失败:`, error)
  }
  return [defaultLocale]
})

// 生成 Metadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  
  if (!isValidLocale(localeParam)) {
    return {}
  }
  
  const locale = localeParam as Locale
  const guide = await getGuideDetail(slug, locale)
  
  if (!guide) {
    return {
      title: locale === 'zh-TW' ? '攻略未找到' : locale === 'en-US' ? 'Guide Not Found' : '攻略未找到'
    }
  }

  const guideUrl = locale === defaultLocale 
    ? `/content/guides/${slug}` 
    : `/${locale}/content/guides/${slug}`
  const description = guide.description || guide.title
  const imageUrl = guide.coverImage || '/default-og-image.jpg'
  const titleSuffix = locale === 'zh-TW' ? ' | 遊戲攻略' : locale === 'en-US' ? ' | Game Guides' : ' | 游戏攻略'
  const siteNameStr = locale === 'zh-TW' ? '遊戲攻略' : locale === 'en-US' ? 'Game Guides' : '游戏攻略'

  return {
    title: `${guide.title}${titleSuffix}`,
    description,
    keywords: guide.tags?.join(', '),
    authors: guide.author ? [{ name: guide.author }] : undefined,
    openGraph: {
      title: guide.title,
      description,
      url: guideUrl,
      siteName: siteNameStr,
      locale,
      type: 'article',
      publishedTime: guide.createTime,
      modifiedTime: guide.updateTime,
      authors: guide.author ? [guide.author] : undefined,
      tags: guide.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: guideUrl,
    },
  }
}

export default async function GuideDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale: localeParam, slug } = await params
  
  if (!isValidLocale(localeParam)) {
    notFound()
  }
  
  const locale = localeParam as Locale
  const guide = await getGuideDetail(slug, locale)
  const availableLocales = await getAvailableGuideLocales(slug)

  if (!guide) {
    notFound()
  }

  const categoryHref = locale === defaultLocale ? '/content/guides' : `/${locale}/content/guides`

  return (
    <ArticleLayout
      config={moduleConfig}
      frontmatter={{
        title: guide.title,
        description: guide.description,
        date: guide.createTime,
        author: guide.author,
        tags: guide.tags,
        category: guide.categoryName || (locale === 'zh-TW' ? '攻略' : locale === 'en-US' ? 'Guide' : '攻略'),
      }}
      content={guide.content}
      readingTime={Math.ceil(guide.content.length / 500)}
      toc={[]}
      availableLocales={availableLocales}
      breadcrumbCategoryHref={categoryHref}
    />
  )
}
