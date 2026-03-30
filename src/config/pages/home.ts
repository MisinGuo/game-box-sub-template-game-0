/**
 * 首页配置
 * 路由: /
 */

import type { LocalizedString, LocalizedArray, SeoMetadata, LayoutType, DataLoadConfig } from '../types/common'
import { locales } from '../site/locales'

/** Hero区域配置 */
export interface HeroConfig {
  badge: LocalizedString
  title: LocalizedString
  highlightText: LocalizedString
  description: LocalizedArray<string>
  primaryButton: {
    text: LocalizedString
    href: string
  }
  secondaryButton: {
    text: LocalizedString
    href: string
  }
}

/** 统计数据项 */
export interface StatItem {
  label: LocalizedString
  value: string
  icon: string
  dataKey?: 'boxCount' | 'gameCount' | 'articleCount' | 'totalSavings'
  visible?: boolean | Record<string, boolean>
}

/** 内容区块配置 */
export interface ContentSectionConfig {
  title: LocalizedString
  description: LocalizedString
  moreLink?: {
    text: LocalizedString
    href: string
  }
  badge?: LocalizedString
  layout?: LayoutType
}

/** 首页完整配置 */
export interface HomePageConfig {
  hero: HeroConfig
  stats: StatItem[]
  sections: {
    strategy: ContentSectionConfig
    special: ContentSectionConfig
    articles?: ContentSectionConfig
  }
  data: DataLoadConfig & {
    strategyCount: number
    specialCount: number
    articleCount: number
  }
}

export const homeConfig: HomePageConfig = {
  // Hero区域
  hero: {
    badge: {
      'zh-CN': `${locales['zh-CN'].translations.siteName} · 全网游戏盒子聚合平台`,
      'zh-TW': `${locales['zh-TW'].translations.siteName} · 全網遊戲盒子聚合平台`,
      'en-US': `${locales['en-US'].translations.siteName} · All-in-One Game Box Platform`,
    },
    title: {
      'zh-CN': '发现最划算的',
      'zh-TW': '發現最划算的',
      'en-US': 'Discover the Best',
    },
    highlightText: {
      'zh-CN': '游戏折扣',
      'zh-TW': '遊戲折扣',
      'en-US': 'Game Deals',
    },
    description: {
      'zh-CN': [
        '汇集 50+ 主流游戏盒子，一键对比首充续充折扣。',
        '不花冤枉钱，玩转最强福利版。',
      ],
      'zh-TW': [
        '匯集 50+ 主流遊戲盒子，一鍵對比首充續充折扣。',
        '不花冤枉錢，玩轉最強福利版。',
      ],
      'en-US': [
        'Aggregating 50+ mainstream game boxes, compare first-charge and recharge discounts with one click.',
        'Save money, enjoy the best benefits.',
      ],
    },
    primaryButton: {
      text: {
        'zh-CN': '浏览盒子大全',
        'zh-TW': '瀏覽盒子大全',
        'en-US': 'Browse All Boxes',
      },
      href: '/boxes',
    },
    secondaryButton: {
      text: {
        'zh-CN': '查看游戏攻略',
        'zh-TW': '查看遊戲攻略',
        'en-US': 'View Game Guides',
      },
      href: '/content/guides',
    },
  },

  // 统计数据（支持多语言和后端数据映射）
  stats: [
    {
      label: {
        'zh-CN': '收录盒子',
        'zh-TW': '收錄盒子',
        'en-US': 'Boxes',
      },
      value: '50+',
      icon: 'Download',
      dataKey: 'boxCount', // 后端原始数字字段
    },
    {
      label: {
        'zh-CN': '覆盖游戏',
        'zh-TW': '覆蓋遊戲',
        'en-US': 'Games',
      },
      value: '10W+',
      icon: 'Flame',
      dataKey: 'gameCount',
    },
    {
      label: {
        'zh-CN': '日更攻略',
        'zh-TW': '日更攻略',
        'en-US': 'Guides',
      },
      value: '200+',
      icon: 'BookOpen',
      dataKey: 'articleCount',
    },
    {
      label: {
        'zh-CN': '累计省钱',
        'zh-TW': '累計省錢',
        'en-US': 'Total Savings',
      },
      value: '¥5000W',
      icon: 'Gift',
      dataKey: 'totalSavings',
    },
  ],

  // 内容区块
  sections: {
    // 攻略区块
    strategy: {
      title: {
        'zh-CN': '最新游戏攻略',
        'zh-TW': '最新遊戲攻略',
        'en-US': 'Latest Game Guides',
      },
      description: {
        'zh-CN': '深度的游戏解析，帮你快速上手',
        'zh-TW': '深度的遊戲解析，幫你快速上手',
        'en-US': 'In-depth game analysis to help you get started quickly',
      },
      moreLink: {
        text: {
          'zh-CN': '全部攻略',
          'zh-TW': '全部攻略',
          'en-US': 'All Guides',
        },
        href: '/content/guides',
      },
      badge: {
        'zh-CN': '攻略',
        'zh-TW': '攻略',
        'en-US': 'Guide',
      },
      layout: 'grid-3',
    },
    // 特价游戏区块
    special: {
      title: {
        'zh-CN': '热门游戏',
        'zh-TW': '熱門遊戲',
        'en-US': 'Hot Games',
      },
      description: {
        'zh-CN': '超低折扣，限时福利版本',
        'zh-TW': '超低折扣，限時福利版本',
        'en-US': 'Super low discounts, limited-time benefits',
      },
      moreLink: {
        text: {
          'zh-CN': '更多游戏',
          'zh-TW': '更多遊戲',
          'en-US': 'More Games',
        },
        href: '/games',
      },
      badge: {
        'zh-CN': '0.1折',
        'zh-TW': '0.1折',
        'en-US': '90% OFF',
      },
      layout: 'grid-6',
    },
  },

  // 数据配置
  data: {
    strategyCount: 6,
    specialCount: 6,
    articleCount: 6,
    enableCache: true,
    cacheTime: 1800, // 30分钟
  },
}
