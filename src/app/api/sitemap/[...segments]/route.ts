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

export const dynamic = 'auto'
export const revalidate = 86400

const validTypes = Object.keys(sitemapConfig.contentTypes) as ContentType[]

function getSitemapCacheTtl(): number {
  const raw = process.env.SITEMAP_RESPONSE_CACHE_TTL_SECONDS
  if (!raw) return 86400
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 86400
}

function canUseWorkersEdgeCache(): boolean {
  // 在请求时读取，避免模块初始化时 env 尚未注入
  if (process.env.CLOUDFLARE_WORKERS !== 'true') return false
  return getSitemapCacheTtl() > 0
}

function getWorkersEdgeCache(): Cache | null {
  if (!canUseWorkersEdgeCache()) {
    return null
  }

  const maybeDefaultCache = (globalThis as any)?.caches?.default as Cache | undefined
  return maybeDefaultCache || null
}

function withWorkerCacheHeader(response: Response, value: 'HIT' | 'MISS' | 'BYPASS'): Response {
  const headers = new Headers(response.headers)
  headers.set('X-Sitemap-Worker-Cache', value)
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function tryReadWorkersEdgeCache(request: Request): Promise<Response | null> {
  const edgeCache = getWorkersEdgeCache()
  if (!edgeCache) {
    return null
  }

  const cached = await edgeCache.match(request)
  if (!cached) {
    return null
  }

  return withWorkerCacheHeader(cached, 'HIT')
}

async function tryWriteWorkersEdgeCache(request: Request, response: Response): Promise<void> {
  const edgeCache = getWorkersEdgeCache()
  if (!edgeCache) {
    return
  }

  if (response.status !== 200) {
    return
  }

  await edgeCache.put(request, response.clone())
}

function getSitemapCacheControl(): string {
  if (process.env.NODE_ENV === 'development') return 'no-store, max-age=0'
  const ttl = getSitemapCacheTtl()
  return `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=86400`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const cachedResponse = await tryReadWorkersEdgeCache(request)
  if (cachedResponse) {
    return cachedResponse
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

      for (const type of validTypes) {
        const chunkCount = type === 'games'
          ? await getGameSitemapChunkCount(locale)
          : getSitemapChunkCount((await fetchUrlsByType(locale, type, hostname)).length)
        const lastmod = new Date().toISOString()

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

      await tryWriteWorkersEdgeCache(request, response)
      return withWorkerCacheHeader(response, canUseWorkersEdgeCache() ? 'MISS' : 'BYPASS')
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

        await tryWriteWorkersEdgeCache(request, response)
        return withWorkerCacheHeader(response, canUseWorkersEdgeCache() ? 'MISS' : 'BYPASS')
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

      await tryWriteWorkersEdgeCache(request, response)
      return withWorkerCacheHeader(response, canUseWorkersEdgeCache() ? 'MISS' : 'BYPASS')
    } catch (error) {
      console.error('生成内容 sitemap 失败:', error)
      return new NextResponse('生成 sitemap 失败', { status: 500 })
    }
  }
  
  return new NextResponse('Not Found', { status: 404 })
}
