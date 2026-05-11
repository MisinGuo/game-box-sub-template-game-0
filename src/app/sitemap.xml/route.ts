import { NextResponse } from 'next/server'
import { generateSitemapIndex, getSitemapChunkCount } from '@/lib/sitemap/generator'
import { fetchUrlsByType, fetchStaticUrls } from '@/lib/sitemap/fetchers'
import { sitemapConfig } from '@/config/sitemap/config'
import { supportedLocales, type Locale } from '@/config/site/locales'
import { getSecureHostname } from '@/lib/sitemap/security'
import type { ContentType } from '@/lib/sitemap/types'

/**
 * 主 sitemap 索引
 * 路由: /sitemap.xml
 * 包含所有语言的 sitemap 链接（两层结构：索引 → urlset，不嵌套 sitemapindex）
 */

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

export async function GET(request: Request) {
  // 优先从 Cloudflare PoP 本地缓存返回，避免穿透后端
  if (process.env.NODE_ENV !== 'development') {
    const cached = await getCfCache(request.url)
    if (cached) return cached
  }

  try {
    // 验证并获取安全的 hostname（防止内容被盗用）
    const hostname = getSecureHostname(request)
    const fallback = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z'

    const entries: { locale: string; type: ContentType; chunk: number; lastmod?: string }[] = []

    const articleTypes = new Set<string>(['guides', 'reviews', 'news'])
    const nonStaticTypes = validTypes.filter((t) => t !== 'static')

    // 按 locale 并行处理：先拉非 static 类型，从文章结果提取最新日期，再生成 static（避免重复拉文章）
    const tasks = supportedLocales.map(async (locale) => {
      const settled = await Promise.allSettled(
        nonStaticTypes.map((type) =>
          fetchUrlsByType(locale, type, hostname).then((urls) => ({ type, urls }))
        )
      )

      let latestArticleDate: string | undefined

      for (const result of settled) {
        if (result.status !== 'fulfilled') continue
        const { type, urls } = result.value

        // 从文章类型中提取最新 lastmod，供 static 页复用
        if (articleTypes.has(type)) {
          const latest = urls.map((u) => u.lastmod ?? '').filter(Boolean).sort().at(-1)
          if (latest && (!latestArticleDate || latest > latestArticleDate)) {
            latestArticleDate = latest
          }
        }

        if (urls.length === 0) continue
        const chunkCount = getSitemapChunkCount(urls.length)
        const latestLastmod = urls.map((u) => u.lastmod ?? '').filter(Boolean).sort().at(-1) ?? fallback
        for (let chunk = 1; chunk <= chunkCount; chunk++) {
          entries.push({ locale, type: type as ContentType, chunk, lastmod: latestLastmod })
        }
      }

      // 用已知的文章最新日期生成 static 页，不额外发请求
      const staticUrls = await fetchStaticUrls(locale, hostname, latestArticleDate)
      if (staticUrls.length > 0) {
        const chunkCount = getSitemapChunkCount(staticUrls.length)
        const latestLastmod = staticUrls.map((u) => u.lastmod ?? '').filter(Boolean).sort().at(-1) ?? fallback
        for (let chunk = 1; chunk <= chunkCount; chunk++) {
          entries.push({ locale, type: 'static', chunk, lastmod: latestLastmod })
        }
      }
    })
    await Promise.all(tasks)

    // 并行任务完成顺序不确定，排序保证输出稳定
    const typeOrder = Object.keys(sitemapConfig.contentTypes) as ContentType[]
    const localeOrder = supportedLocales
    entries.sort((a, b) => {
      const li = localeOrder.indexOf(a.locale as Locale) - localeOrder.indexOf(b.locale as Locale)
      if (li !== 0) return li
      const ti = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
      if (ti !== 0) return ti
      return a.chunk - b.chunk
    })

    const maxLocPerIndex = 50000
    if (entries.length > maxLocPerIndex) {
      console.error(`[Sitemap] 主索引超限 entries=${entries.length}`)
      return new NextResponse('主索引超出限制', { status: 500 })
    }

    console.log('[Sitemap] 生成主索引 sitemap.xml，共', entries.length, '条')
    const xml = generateSitemapIndex(hostname, entries)

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
    console.error('生成主 sitemap 索引失败:', error)
    return new NextResponse('生成 sitemap 失败', { status: 500 })
  }
}

