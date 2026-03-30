/**
 * 构建配置
 * 手动指定渲染模式和构建选项
 */

module.exports = {
  /**
   * 渲染模式
   * - 'ssg': 全静态生成（适合文章少的情况）
   * - 'isr': 增量静态再生（适合文章多的情况）
   */
  renderMode: process.env.RENDER_MODE || 'isr',

  /**
   * SSG 模式配置
   */
  ssg: {
    // 是否生成所有页面
    generateAllPages: true,
    // 页面数量阈值（超过此数量建议切换到 ISR）
    pageThreshold: 1000,
  },

  /**
   * ISR 模式配置
   */
  isr: {
    // 重新验证时间（秒）
    revalidate: 1800, // 30分钟
    // 预生成的页面路径
    preGeneratePaths: [
      '/',
      '/special',
      '/strategy',
      '/articles',
    ],
  },

  /**
   * 静态资源生成
   */
  static: {
    // 是否生成 sitemap
    generateSitemap: true,
    // 是否生成统计数据
    generateStats: true,
    // sitemap 更新频率
    sitemapChangefreq: 'daily',
    // sitemap 优先级
    sitemapPriority: 0.7,
  },

  /**
   * API 配置
   */
  api: {
    // 后端 API 地址（构建时使用）
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    // 统计接口（可选，失败时忽略）
    analyticsUrl: process.env.ANALYTICS_URL,
    // 请求超时时间（毫秒）
    timeout: 10000,
  },

  /**
   * 优化配置
   */
  optimization: {
    // 图片优化
    optimizeImages: false,
    // 压缩输出
    compress: true,
    // 并发构建数量
    concurrency: 5,
  },
}
