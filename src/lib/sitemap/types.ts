/**
 * Sitemap URL 配置
 */
export interface SitemapUrl {
  /** URL 地址 */
  loc: string
  /** 最后修改时间 (ISO 8601 格式) */
  lastmod?: string
  /** 更新频率 */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  /** 优先级 (0.0 - 1.0) */
  priority?: number
  /** 多语言变体 */
  alternates?: {
    locale: string
    href: string
  }[]
}

/**
 * Sitemap 配置
 */
export interface SitemapConfig {
  /** 允许的域名白名单 */
  allowedHosts: string[]
  /** 默认域名（当请求来自非白名单域名时使用） */
  defaultHostname: string
  /** 单个 sitemap 文件的最大 URL 数量 */
  maxUrlsPerSitemap: number
  /** 各内容类型的默认配置 */
  contentTypes: Record<string, {
    changefreq: string
    priority: number
  }>
}

/**
 * 内容类型
 */
export type ContentType = 'static' | 'games' | 'boxes' | 'guides' | 'news' | 'reviews' | 'topics'
