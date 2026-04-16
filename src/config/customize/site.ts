/**
 * 主站站点配置文件
 *
 * 修改此文件即可调整主站品牌、导航、主题和站点基础信息，
 * Header/Footer/Layout 统一消费这里的配置。
 */

import type { SiteConfigFile } from '@/config/types/site'

const siteConfigData: SiteConfigFile = {
  branding: {
    siteName: '我爱玩游戏网',
    siteNameI18n: {
      'zh-TW': '我愛玩遊戲網',
      'en-US': '5AWYX Game Hub',
    },
    tagline: '汇集主流游戏盒子、热门游戏库和内容资讯，一站完成选盒、找游、看攻略。',
    description: '我爱玩游戏网 - 汇集 50+ 主流游戏盒子，一键对比首充续充折扣，发现最划算的游戏优惠。',
    copyright: 'Copyright © 2025-至今 我爱玩游戏网',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    ogImage: '/logo.svg',
    author: {
      name: '我爱玩游戏网',
      url: 'https://www.5awyx.com',
      email: 'contact@example.com',
    },
    social: {
      github: 'https://github.com/your-org/gamebox',
      twitter: 'https://twitter.com/gamebox',
      discord: 'https://discord.gg/gamebox',
      telegram: 'https://t.me/gamebox',
    },
    keywords: [
      '游戏盒子',
      '游戏折扣',
      '首充折扣',
      '续充折扣',
      'BT游戏',
      '破解游戏',
      '游戏攻略',
    ],
    footerDescription: '最专业的中立游戏盒子聚合平台。',
    footerDescription2: '汇集全网优质游戏盒子，提供最客观的折扣对比与攻略评测。',
    footerDescriptionI18n: {
      'zh-TW': {
        footerDescription: '最專業的中立遊戲盒子聚合平台。',
        footerDescription2: '匯集全網優質遊戲盒子，提供最客觀的折扣對比與攻略評測。',
      },
      'en-US': {
        footerDescription: 'A neutral hub for game boxes, deals and content discovery.',
        footerDescription2: 'Compare discounts, browse curated games, and follow practical guides in one place.',
      },
    },
  },

  site: {
    hostname: 'https://www.5awyx.com',
    jumpDomain: 'https://www.5awyx.com',
    defaultLocale: 'zh-CN',
    supportedLocales: ['zh-CN', 'zh-TW', 'en-US'],
  },

  theme: {
    primaryColor: '#60a5fa',
    secondaryColor: '#a78bfa',
    accentColor: '#fbbf24',
    colorScheme: 'blue',
    darkMode: true,
    borderRadius: '8px',
  },

  navigation: {
    header: [
      { path: '/', i18nKey: 'home', label: '首页', enabled: true, inSitemap: true },
      { path: '/games', i18nKey: 'games', label: '游戏库', enabled: true, inSitemap: true },
      { path: '/boxes', i18nKey: 'boxes', label: '盒子大全', enabled: true, inSitemap: true },
      { path: '/01zhe', i18nKey: 'discount', label: '0.1折专区', enabled: true, inSitemap: true },
      { path: '/rank', i18nKey: 'rank', label: '排行榜', enabled: true, inSitemap: true },
      { path: '/content', i18nKey: 'content', label: '内容中心', enabled: true, inSitemap: true },
      { path: '/news', i18nKey: 'news', label: '资讯', enabled: true, inSitemap: true },
    ],
  },

  features: {
    search: true,
    darkMode: true,
    comments: false,
    analytics: true,
    i18n: false,
    rss: true,
  },

  integrations: {
    googleAnalyticsId: '',
    clarityId: '',
    customHeadScript: '',
    customBodyScript: '',
  },

  verification: {
    other: {
      'baidu-site-verification': 'codeva-rDKX3wvhke',
    },
  },
}

export default siteConfigData