import { NextResponse } from 'next/server'
import { generateSitemapIndex } from '@/lib/sitemap/generator'
import { getGameSitemapChunkCountForIndex } from '@/lib/sitemap/fetchers'
import { sitemapConfig } from '@/config/sitemap/config'
import { supportedLocales } from '@/config/site/locales'
import { getSecureHostname } from '@/lib/sitemap/security'
import type { ContentType } from '@/lib/sitemap/types'

/**
 * 主 sitemap 索引
 * 路由: /sitemap.xml
 * 包含所有语言的 sitemap 链接
 */

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1小时重新生成

const validTypes = Object.keys(sitemapConfig.contentTypes) as ContentType[]

function getSitemapCacheControl(): string {
  return process.env.NODE_ENV === 'development'
    ? 'no-store, max-age=0'
    : 'public, max-age=3600, s-maxage=3600'
}

export async function GET(request: Request) {
  try {
    // 验证并获取安全的 hostname（防止内容被盗用）
    const hostname = getSecureHostname(request)

    const entries: { locale: string; type: ContentType; chunk: number; lastmod?: string }[] = []

    for (const locale of supportedLocales) {
      for (const type of validTypes) {
        // 主索引使用轻量分片策略，避免在 /sitemap.xml 触发重型全量抓取
        const chunkCount = type === 'games'
          ? await getGameSitemapChunkCountForIndex(locale)
          : 1
        const lastmod = new Date().toISOString()

        for (let chunk = 1; chunk <= chunkCount; chunk += 1) {
          entries.push({ locale, type, chunk, lastmod })
        }
      }
    }

    const maxLocPerIndex = 50000
    if (entries.length > maxLocPerIndex) {
      console.error(`[Sitemap] 主索引超限 entries=${entries.length}`)
      return new NextResponse('主索引超出限制', { status: 500 })
    }
    
    console.log('[Sitemap] 生成主索引 sitemap.xml')
    const xml = generateSitemapIndex(hostname, entries)
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': getSitemapCacheControl(),
      },
    })
  } catch (error) {
    console.error('生成主 sitemap 索引失败:', error)
    return new NextResponse('生成 sitemap 失败', { status: 500 })
  }
}
