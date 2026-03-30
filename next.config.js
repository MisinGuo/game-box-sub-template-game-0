/** @type {import('next').NextConfig} */

// 自动检测构建环境
const isCloudflareWorkers = process.env.CLOUDFLARE_WORKERS === 'true'
const isWindows = process.platform === 'win32'
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  // 构建模式：智能选择
  // - Cloudflare Workers: 不使用 standalone（由 opennextjs-cloudflare 处理）
  // - 其他环境: 使用 standalone 支持 ISR
  ...(!isCloudflareWorkers && { output: 'standalone' }),

  // 通过环境变量支持反向代理路径前缀（由管理平台代码预览功能注入）
  // 本地开发直接 pnpm dev 时不设置此变量，行为与之前完全一致
  basePath: process.env.NEXT_BASE_PATH || '',
  
  // 文件跟踪：始终启用（Next.js 未来版本将强制要求）
  outputFileTracing: true,
  
  // 图片优化配置
  images: {
    unoptimized: true,
  },
  
  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
