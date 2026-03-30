import type { SiteConfig } from '../types'
import { buildNavMenu } from './routes'

/**
 * 站点全局配置
 * 
 * 🔧 用户主要修改此文件来自定义站点信息
 * 
 * 修改步骤：
 * 1. 修改 name - 你的网站名称
 * 2. 修改 description - 网站描述（用于SEO）
 * 3. 修改 hostname - 你的网站域名
 * 4. 修改 logo/favicon - 替换成你的Logo文件
 * 5. 修改 social - 添加你的社交媒体链接
 * 
 * 📋 路由和导航配置在 routes.ts 中统一管理
 */
export const siteConfig: SiteConfig = {
  // ========================================
  // 基础信息
  // ========================================
  
  /** 网站名称 */
  name: '我爱玩游戏网',
  
  /** 网站描述（用于SEO和社交分享） */
  description: '我爱玩游戏网 - 汇集 50+ 主流游戏盒子，一键对比首充续充折扣，发现最划算的游戏优惠。',

  
  // -----------------------------------------
  // ！！！！！！！！！！！！！！！！！！这里向自己添加可以自行添加进行替换文章内容！！！！！！！！！！！！！！！！！！！！！！！！！！！！
  // -----------------------------------------
  /** 网站域名（用于生成绝对URL） */
  hostname: 'https://www.5awyx.com',
  
  /** 跳转域名（用于下载链接等） */
  jumpDomain: 'https://download.example.com',
  
  // ========================================
  // 品牌资源
  // ========================================
  
  /** Logo文件路径（放在 public 目录） */
  logo: '/logo.svg',
  
  /** Favicon文件路径 */
  favicon: '/favicon.ico',
  
  /** Open Graph 图片（用于社交分享预览） */
  ogImage: '/og-image.jpg',
  
  // ========================================
  // SEO配置
  // ========================================
  
  /** SEO关键词 */
  keywords: [
    '游戏盒子',
    '游戏折扣',
    '首充折扣',
    '续充折扣',
    'BT游戏',
    '破解游戏',
    '游戏攻略',
  ],
  
  /** 默认语言 */
  defaultLocale: 'zh-CN',
  
  /** 支持的语言列表 */
  supportedLocales: ['zh-CN', 'zh-TW', 'en-US'],
  
  // ========================================
  // 版权和作者信息
  // ========================================
  
  /** 版权声明 */
  copyright: 'Copyright © 2025-至今 我爱玩游戏网',
  
  /** 作者信息 */
  author: {
    name: '我爱玩游戏网',
    url: 'https://www.5awyx.com',
    email: 'contact@example.com',
  },
  
  // ========================================
  // 社交媒体链接（可选）
  // ========================================
  
  social: {
    github: 'https://github.com/your-org/gamebox',
    twitter: 'https://twitter.com/gamebox',
    discord: 'https://discord.gg/gamebox',
    telegram: 'https://t.me/gamebox',
    // 添加更多社交媒体...
  },
  
  // ========================================
  // 功能开关
  // ========================================
  
  features: {
    /** 启用搜索功能 */
    search: true,
    
    /** 启用深色模式 */
    darkMode: true,
    
    /** 启用评论系统 */
    comments: false,
    
    /** 启用数据分析 */
    analytics: true,
    
    /** 启用多语言 */
    i18n: false,
    
    /** 启用RSS订阅 */
    rss: true,
  },
  
  // ========================================
  // 导航配置（自动从 routes.ts 生成）
  // ========================================
  
  nav: buildNavMenu(),
  
  // ========================================
  // 侧边栏配置（可选）
  // ========================================
  
  sidebar: {
    '/games/': [
      {
        text: '热门游戏',
        items: [
          { text: 'RPG游戏', link: '/games/rpg' },
          { text: '卡牌游戏', link: '/games/card' },
          { text: '策略游戏', link: '/games/strategy' },
        ],
      },
    ],
    '/boxes/': [
      {
        text: '推荐盒子',
        items: [
          { text: '高折扣盒子', link: '/boxes/discount' },
          { text: 'BT盒子', link: '/boxes/bt' },
        ],
      },
    ],
  },
}
