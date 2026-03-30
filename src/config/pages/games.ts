/**
 * 游戏列表页配置
 * 路由: /games
 */

import type { LocalizedString, SeoMetadata } from '../types/common'

// 游戏页面专用配置，不继承通用配置
export interface GamesPageConfig {
  // Hero区域
  hero: {
    title: LocalizedString
    description: LocalizedString
    badge: LocalizedString
  }
  
  // 筛选器
  filter: {
    enabled: boolean
    filters: Array<{
      key: string
      label: LocalizedString
      type: 'select' | 'checkbox'
      options: Array<{
        label: LocalizedString
        value: string
      }>
    }>
  }
  
  // 排序
  sort: {
    enabled: boolean
    defaultSort: string
    options: Array<{
      label: LocalizedString
      value: string
    }>
  }
  
  // 分页
  pagination: {
    pageSize: number
    showSizeChanger: boolean
    pageSizeOptions: number[]
  }

  // 卡片展示
  card: {
    showCover: boolean
    showCategory: boolean
    showDate: boolean
    showViews: boolean
    showReadingTime: boolean
  }

  // UI文本
  ui: {
    gameCategories: LocalizedString
    gamesCount: LocalizedString
    viewAll: LocalizedString
    noCategories: LocalizedString
    noCategoryGames: LocalizedString
    hotLabel: LocalizedString
    uncategorizedTitle: LocalizedString
    unavailableText: LocalizedString
    retryText: LocalizedString
  }
  
  // SEO元数据
  // metadata: SeoMetadata
}

// 多语言文本定义
const heroTexts = {
  title: {
    'zh-CN': '游戏大全',
    'zh-TW': '遊戲大全',
    'en-US': 'Game Library'
  },
  description: {
    'zh-CN': '精选优质手游，涵盖各类热门游戏',
    'zh-TW': '精選優質手遊，涵蓋各類熱門遊戲',
    'en-US': 'Premium mobile games, covering all popular game categories'
  },
  badge: {
    'zh-CN': '游戏',
    'zh-TW': '遊戲',
    'en-US': 'Games'
  }
} as const

const filterTexts = {
  gameType: {
    'zh-CN': '游戏类型',
    'zh-TW': '遊戲類型',
    'en-US': 'Game Type'
  },
  platform: {
    'zh-CN': '平台',
    'zh-TW': '平台',
    'en-US': 'Platform'
  }
} as const

const categoryOptions = {
  all: {
    'zh-CN': '全部',
    'zh-TW': '全部',
    'en-US': 'All'
  },
  rpg: {
    'zh-CN': 'RPG',
    'zh-TW': 'RPG',
    'en-US': 'RPG'
  },
  action: {
    'zh-CN': '动作',
    'zh-TW': '動作',
    'en-US': 'Action'
  },
  strategy: {
    'zh-CN': '策略',
    'zh-TW': '策略',
    'en-US': 'Strategy'
  },
  card: {
    'zh-CN': '卡牌',
    'zh-TW': '卡牌',
    'en-US': 'Card'
  },
  simulation: {
    'zh-CN': '模拟',
    'zh-TW': '模擬',
    'en-US': 'Simulation'
  },
  casual: {
    'zh-CN': '休闲',
    'zh-TW': '休閒',
    'en-US': 'Casual'
  }
} as const

const platformOptions = {
  ios: {
    'zh-CN': 'iOS',
    'zh-TW': 'iOS',
    'en-US': 'iOS'
  },
  android: {
    'zh-CN': 'Android',
    'zh-TW': 'Android',
    'en-US': 'Android'
  }
} as const

const sortTexts = {
  hot: {
    'zh-CN': '最热门',
    'zh-TW': '最熱門',
    'en-US': 'Most Popular'
  },
  latest: {
    'zh-CN': '最新上架',
    'zh-TW': '最新上架',
    'en-US': 'Latest'
  },
  rating: {
    'zh-CN': '评分最高',
    'zh-TW': '評分最高',
    'en-US': 'Highest Rated'
  }
} as const

const uiTexts = {
  gameCategories: {
    'zh-CN': '游戏分类',
    'zh-TW': '遊戲分類',
    'en-US': 'Game Categories'
  },
  gamesCount: {
    'zh-CN': '款游戏',
    'zh-TW': '款遊戲',
    'en-US': 'games'
  },
  viewAll: {
    'zh-CN': '查看全部',
    'zh-TW': '查看全部',
    'en-US': 'View All'
  },
  noCategories: {
    'zh-CN': '暂无游戏分类',
    'zh-TW': '暫無遊戲分類',
    'en-US': 'No game categories available'
  },
  noCategoryGames: {
    'zh-CN': '该分类暂无游戏',
    'zh-TW': '該分類暫無遊戲',
    'en-US': 'No games in this category'
  },
  hotLabel: {
    'zh-CN': 'HOT',
    'zh-TW': 'HOT',
    'en-US': 'HOT'
  },
  uncategorizedTitle: {
    'zh-CN': '其他游戏',
    'zh-TW': '其他遊戲',
    'en-US': 'Other Games'
  },
  unavailableText: {
    'zh-CN': '数据暂时不可用，请稍后刷新重试',
    'zh-TW': '數據暫時不可用，請稍後刷新重試',
    'en-US': 'Data is temporarily unavailable. Please refresh and try again later.'
  },
  retryText: {
    'zh-CN': '重新加载',
    'zh-TW': '重新載入',
    'en-US': 'Reload'
  }
} as const

export const gamesListConfig: GamesPageConfig = {
  // Hero区域
  hero: {
    title: heroTexts.title,
    description: heroTexts.description,
    badge: heroTexts.badge,
  },

  // 筛选器
  filter: {
    enabled: true,
    filters: [
      {
        key: 'category',
        label: filterTexts.gameType,
        type: 'select',
        options: [
          { label: categoryOptions.all, value: 'all' },
          { label: categoryOptions.rpg, value: 'rpg' },
          { label: categoryOptions.action, value: 'action' },
          { label: categoryOptions.strategy, value: 'strategy' },
          { label: categoryOptions.card, value: 'card' },
          { label: categoryOptions.simulation, value: 'simulation' },
          { label: categoryOptions.casual, value: 'casual' },
        ],
      },
      {
        key: 'platform',
        label: filterTexts.platform,
        type: 'checkbox',
        options: [
          { label: platformOptions.ios, value: 'ios' },
          { label: platformOptions.android, value: 'android' },
        ],
      },
    ],
  },

  // 排序
  sort: {
    enabled: true,
    defaultSort: 'hot',
    options: [
      { label: sortTexts.hot, value: 'hot' },
      { label: sortTexts.latest, value: 'latest' },
      { label: sortTexts.rating, value: 'rating' },
    ],
  },

  // 分页
  pagination: {
    pageSize: 24,
    showSizeChanger: true,
    pageSizeOptions: [24, 48, 72, 96],
  },

  // 卡片展示
  card: {
    showCover: true,
    showCategory: true,
    showDate: false,
    showViews: true,
    showReadingTime: false,
  },

  // UI文本
  ui: {
    gameCategories: uiTexts.gameCategories,
    gamesCount: uiTexts.gamesCount,
    viewAll: uiTexts.viewAll,
    noCategories: uiTexts.noCategories,
    noCategoryGames: uiTexts.noCategoryGames,
    hotLabel: uiTexts.hotLabel,
    uncategorizedTitle: uiTexts.uncategorizedTitle,
    unavailableText: uiTexts.unavailableText,
    retryText: uiTexts.retryText,
  },
}
