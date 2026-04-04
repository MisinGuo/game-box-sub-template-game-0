import type { SitemapConfig } from '@/lib/sitemap/types'

/**
 * Sitemap 配置
 */
export const sitemapConfig: SitemapConfig = {
  // 允许的域名白名单（防止内容被盗用）
  allowedHosts: [
    '*.5awyx.com',          // 所有 5awyx.com 子域名
    'localhost:3000',
    'localhost:8788', // Cloudflare Workers 本地开发
  ],
  // 默认域名（当请求来自非白名单域名时使用）
  defaultHostname: 'https://www.5awyx.com',
  // 每个 sitemap 文件最多收录的 URL 数量（Google 支持最多 50000 条）
  maxUrlsPerSitemap: 10000,
  
  // 各内容类型的默认配置
  contentTypes: {
    // 静态页面：首页、列表页等
    static: {
      changefreq: 'daily',
      priority: 1.0,
    },
    // 游戏详情和分类页
    games: {
      changefreq: 'daily',
      priority: 0.9,
    },
    // 盒子详情和下载页
    boxes: {
      changefreq: 'weekly',
      priority: 0.8,
    },
    // 攻略文章（guides）
    guides: {
      changefreq: 'weekly',
      priority: 0.7,
    },
    // 评测文章（reviews）
    reviews: {
      changefreq: 'weekly',
      priority: 0.7,
    },
    // 专题文章（topics）
    topics: {
      changefreq: 'weekly',
      priority: 0.7,
    },
    // 资讯文章（news）
    news: {
      changefreq: 'weekly',
      priority: 0.7,
    },
  },
}
