import { supportedLocales, defaultLocale } from '@/config/site/locales'
import { sitemapConfig } from '@/config/sitemap/config'
import type { SitemapUrl, ContentType } from './types'

export interface LocaleSitemapEntry {
  type: ContentType
  chunk: number
  lastmod?: string
}

export interface RootSitemapEntry {
  locale: string
  type: ContentType
  chunk: number
  lastmod?: string
}

/**
 * 生成主 sitemap 索引
 * 包含所有语言的 sitemap 链接
 */
export function generateSitemapIndex(hostname: string, entries: RootSitemapEntry[]): string {
  const fallbackEntries: RootSitemapEntry[] = supportedLocales.map((locale) => ({
    locale,
    type: 'static',
    chunk: 1,
    lastmod: new Date().toISOString(),
  }))
  const safeEntries = entries.length > 0 ? entries : fallbackEntries

  const contentSitemaps = safeEntries
    .map(
      (entry) => `  <sitemap>
    <loc>${hostname}/${buildContentSitemapFilename(entry.locale, entry.type, entry.chunk)}</loc>
    <lastmod>${entry.lastmod || new Date().toISOString()}</lastmod>
  </sitemap>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${contentSitemaps}
</sitemapindex>`
}

/**
 * 生成语言索引
 * 包含某个语言下所有内容类型的 sitemap 链接
 */
export function generateLocaleIndex(locale: string, hostname: string): string {
  const contentTypes = Object.keys(sitemapConfig.contentTypes) as ContentType[]

  const typeSitemaps = contentTypes
    .map(
      (type) => `  <sitemap>
    <loc>${hostname}/${buildContentSitemapFilename(locale, type, 1)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${typeSitemaps}
</sitemapindex>`
}

/**
 * 生成语言索引（支持分片）
 */
export function generateLocaleIndexWithEntries(
  locale: string,
  hostname: string,
  entries: LocaleSitemapEntry[]
): string {
  const fallbackEntries: LocaleSitemapEntry[] = [{ type: 'static', chunk: 1 }]
  const safeEntries: LocaleSitemapEntry[] = entries.length > 0
    ? entries
    : fallbackEntries

  const typeSitemaps = safeEntries
    .map(
      (entry) => `  <sitemap>
    <loc>${hostname}/${buildContentSitemapFilename(locale, entry.type, entry.chunk)}</loc>
    <lastmod>${entry.lastmod || new Date().toISOString()}</lastmod>
  </sitemap>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${typeSitemaps}
</sitemapindex>`
}

/**
 * 生成内容类型 sitemap
 * 包含某个语言下某个内容类型的所有 URL
 */
export function generateContentSitemap(
  urls: SitemapUrl[],
  locale: string,
  type: ContentType
): string {
  const urlsXml = urls.map((url) => formatSitemapUrl(url)).join('\n')
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlsXml}
</urlset>`
}

/**
 * 根据内容数量计算 sitemap 分片数
 */
export function getSitemapChunkCount(totalUrls: number): number {
  const perFile = Math.max(1, sitemapConfig.maxUrlsPerSitemap)
  return Math.max(1, Math.ceil(totalUrls / perFile))
}

/**
 * 获取指定分片（1-based）中的 URL
 */
export function sliceUrlsByChunk(urls: SitemapUrl[], chunk: number): SitemapUrl[] {
  const perFile = Math.max(1, sitemapConfig.maxUrlsPerSitemap)
  const safeChunk = Math.max(1, chunk)
  const start = (safeChunk - 1) * perFile
  return urls.slice(start, start + perFile)
}

/**
 * 生成内容 sitemap 文件名
 */
export function buildContentSitemapFilename(locale: string, type: ContentType, chunk: number): string {
  if (chunk <= 1) {
    return `sitemap-${locale}-${type}.xml`
  }
  return `sitemap-${locale}-${type}-${chunk}.xml`
}

/**
 * 格式化单个 URL 为 XML
 */
function formatSitemapUrl(url: SitemapUrl): string {
  const alternates =
    url.alternates
      ?.map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${alt.href}"/>`
      )
      .join('\n') || ''
  
  return `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `\n    <priority>${url.priority}</priority>` : ''}${alternates ? `\n${alternates}` : ''}
  </url>`
}

/**
 * 生成多语言 URL 变体
 * 为指定路径生成所有语言的 URL
 */
export function generateAlternateUrls(
  path: string,
  hostname: string
): { locale: string; href: string }[] {
  return supportedLocales.map((locale) => {
    const localePrefix = locale === defaultLocale ? '' : `/${locale}`
    return {
      locale,
      href: `${hostname}${localePrefix}${path}`,
    }
  })
}
