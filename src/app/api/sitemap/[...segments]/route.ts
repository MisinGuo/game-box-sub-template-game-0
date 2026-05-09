import { NextResponse } from 'next/server'
import { supportedLocales } from '@/config/site/locales'
import {
  generateLocaleIndexWithEntries,
  generateContentSitemap,
  getSitemapChunkCount,
  sliceUrlsByChunk,
} from '@/lib/sitemap/generator'
import { fetchUrlsByType, fetchGameUrlsByChunk, getGameSitemapChunkCount } from '@/lib/sitemap/fetchers'
import { getSecureHostname } from '@/lib/sitemap/security'
import type { ContentType } from '@/lib/sitemap/types'
import { sitemapConfig } from '@/config/sitemap/config'

const CACHE_TTL = 86400 // 1 day

const validTypes = Object.keys(sitemapConfig.contentTypes) as ContentType[]

function getSitemapCacheControl(): string {
  return process.env.NODE_ENV === 'development'
    ? 'no-store, max-age=0'
    : `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`
}

/** Cloudflare Cache API — 每个 PoP 本地缓存，避免重复打后端 */
async function getCfCache(url: string): Promise<Response | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfCaches = (globalThis as any).caches
    if (!cfCaches) return null
    return (await cfCaches.default.match(new Request(url))) ?? null
  } catch {
    return null
  }
}

async function putCfCache(url: string, response: Response): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfCaches = (globalThis as any).caches
    if (!cfCaches) return
    await cfCaches.default.put(new Request(url), response)
  } catch {
    // 缓存失败不影响正常响应
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  // 优先从 Cloudflare PoP 本地缓存返回，避免穿透后端
  if (process.env.NODE_ENV !== 'development') {
    const cached = await getCfCache(request.url)
    if (cached) return cached
  }

  const { segments } = await params
  
  // 验证并获取安全的 hostname（防止内容被盗用）
  const hostname = getSecureHostname(request)
  
  console.log('[API Sitemap] segments:', segments)
  
  // /api/sitemap/zh-TW -> ['zh-TW']
  if (segments.length === 1) {
    const locale = segments[0]
    
    if (!supportedLocales.includes(locale as any)) {
      return new NextResponse('不支持的语言', { status: 404 })
    }
    
    try {
      const entries: { type: ContentType; chunk: number; lastmod?: string }[] = []

      const typeChunkCounts = await Promise.all(
        validTypes.map(async (type) => {
          const chunkCount = type === 'games'
            ? await getGameSitemapChunkCount(locale)
            : getSitemapChunkCount((await fetchUrlsByType(locale, type, hostname)).length)
          return { type, chunkCount }
        })
      )

      const lastmod = new Date().toISOString()
      for (const { type, chunkCount } of typeChunkCounts) {
        for (let chunk = 1; chunk <= chunkCount; chunk += 1) {
          entries.push({ type, chunk, lastmod })
        }
      }

      const maxLocPerIndex = 50000
      if (entries.length > maxLocPerIndex) {
        console.error(`[Sitemap] 语言索引超限 locale=${locale}, entries=${entries.length}`)
        return new NextResponse('语言索引超出限制', { status: 500 })
      }

      const xml = generateLocaleIndexWithEntries(locale, hostname, entries)
      const response = new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': getSitemapCacheControl(),
        },
      })
      if (process.env.NODE_ENV !== 'development') {
        await putCfCache(request.url, response.clone())
      }
      return response
    } catch (error) {
      console.error('生成语言索引失败:', error)
      return new NextResponse('生成 sitemap 失败', { status: 500 })
    }
  }
  
  // /api/sitemap/zh-TW/guides -> ['zh-TW', 'guides']
  // /api/sitemap/zh-TW/guides/2 -> ['zh-TW', 'guides', '2']
  if (segments.length === 2 || segments.length === 3) {
    const [locale, type, chunkRaw] = segments
    const chunk = chunkRaw ? Number.parseInt(chunkRaw, 10) : 1
    
    if (!supportedLocales.includes(locale as any)) {
      return new NextResponse('不支持的语言', { status: 404 })
    }
    if (!validTypes.includes(type as ContentType)) {
      return new NextResponse('不支持的内容类型', { status: 404 })
    }
    if (!Number.isInteger(chunk) || chunk < 1) {
      return new NextResponse('无效的分片编号', { status: 404 })
    }
    
    try {
      if (type === 'games') {
        const { urls, chunkCount } = await fetchGameUrlsByChunk(locale, hostname, chunk)
        if (urls.length === 0 || chunk > chunkCount) {
          return new NextResponse('分片不存在', { status: 404 })
        }

        const xml = generateContentSitemap(urls, locale, type as ContentType)
        const response = new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': getSitemapCacheControl(),
          },
        })
        if (process.env.NODE_ENV !== 'development') {
          await putCfCache(request.url, response.clone())
        }
        return response
      }

      const urls = await fetchUrlsByType(locale, type as ContentType, hostname)
      if (urls.length === 0) {
        return new NextResponse('分片不存在', { status: 404 })
      }
      const chunkCount = getSitemapChunkCount(urls.length)

      if (chunk > chunkCount) {
        return new NextResponse('分片不存在', { status: 404 })
      }

      const chunkedUrls = sliceUrlsByChunk(urls, chunk)
      const xml = generateContentSitemap(chunkedUrls, locale, type as ContentType)

      const response = new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': getSitemapCacheControl(),
        },
      })
      if (process.env.NODE_ENV !== 'development') {
        await putCfCache(request.url, response.clone())
      }
      return response
    } catch (error) {
      console.error('生成内容 sitemap 失败:', error)
      return new NextResponse('生成 sitemap 失败', { status: 500 })
    }
  }
  
  return new NextResponse('Not Found', { status: 404 })
}
