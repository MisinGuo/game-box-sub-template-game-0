import { NextResponse } from 'next/server'
import ApiClient from '@/lib/api'
import { siteConfig } from '@/config'
import { SiteSectionSlugGroups } from '@/config/pages/content'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

interface Article {
  masterArticleId: number
  title: string
  description?: string
  content?: string
  coverImage?: string
  author?: string
  createTime: string
  section?: string
}

function getArticleUrl(article: Article): string {
  const section = article.section || ''
  const allSections = {
    news: SiteSectionSlugGroups.news,
    guides: SiteSectionSlugGroups.guides,
    reviews: SiteSectionSlugGroups.reviews,
    topics: SiteSectionSlugGroups.topics,
  }

  for (const [category, slugs] of Object.entries(allSections)) {
    if ((slugs as readonly string[]).includes(section)) {
      if (category === 'news') {
        return `${siteConfig.hostname}/news/${article.masterArticleId}`
      }
      return `${siteConfig.hostname}/content/${category}/${article.masterArticleId}`
    }
  }
  return `${siteConfig.hostname}/content/topics/${article.masterArticleId}`
}

export async function GET() {
  try {
    const allSections = [
      ...SiteSectionSlugGroups.news,
      ...SiteSectionSlugGroups.guides,
      ...SiteSectionSlugGroups.reviews,
      ...SiteSectionSlugGroups.topics,
    ]

    const articles: Article[] = []

    for (const section of allSections) {
      try {
        const response = await ApiClient.getArticles({
          locale: 'zh-CN',
          section,
          pageSize: 10,
          pageNum: 1,
        })
        if (response.code === 200 && response.rows) {
          articles.push(...response.rows)
        }
      } catch {
        // 跳过失败的 section
      }
    }

    // 按创建时间降序排列，取最新50条
    articles.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    const latestArticles = articles.slice(0, 50)

    const lastBuildDate = latestArticles.length > 0
      ? new Date(latestArticles[0].createTime).toUTCString()
      : new Date().toUTCString()

    const items = latestArticles.map(article => {
      const url = getArticleUrl(article)
      const description = article.description || (article.content ? stripHtml(article.content).slice(0, 200) : article.title)
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(article.createTime).toUTCString()}</pubDate>
      ${article.author ? `<author>${escapeXml(article.author)}</author>` : ''}
    </item>`
    }).join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.hostname}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteConfig.hostname}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('RSS feed generation failed:', error)
    return new NextResponse('RSS feed generation failed', { status: 500 })
  }
}
