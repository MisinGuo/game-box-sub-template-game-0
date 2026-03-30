/**
 * 游戏盒子列表页配置
 * 路由: /boxes
 */

import type { LocalizedString, SeoMetadata } from '../types/common'

// 盒子页面专用配置
export interface BoxesPageConfig {
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
    searchPlaceholder: LocalizedString
    boxCategories: LocalizedString
    boxesCount: LocalizedString
    viewAll: LocalizedString
    noCategories: LocalizedString
    noCategoryBoxes: LocalizedString
    hotLabel: LocalizedString
    // 统计数据标签
    statsBoxes: LocalizedString
    statsBestDiscount: LocalizedString
    statsGames: LocalizedString
    statsUsers: LocalizedString
    defaultLogoText: LocalizedString
  }
  
  // SEO元数据 已经删除，统一在回退配置中配置
  // metadata: SeoMetadata
}

// 多语言文本定义
const heroTexts = {
  title: {
    'zh-CN': '游戏盒子大全',
    'zh-TW': '遊戲盒子大全',
    'en-US': 'Game Box Collection'
  },
  description: {
    'zh-CN': '精选 50+ 主流游戏盒子，一键对比首充续充折扣',
    'zh-TW': '精選 50+ 主流遊戲盒子，一鍵對比首充續充折扣',
    'en-US': 'Premium 50+ game boxes, compare first-charge and recharge discounts with one click'
  },
  badge: {
    'zh-CN': '盒子',
    'zh-TW': '盒子',
    'en-US': 'Boxes'
  }
} as const

const filterTexts = {
  boxType: {
    'zh-CN': '盒子类型',
    'zh-TW': '盒子類型',
    'en-US': 'Box Type'
  },
  discount: {
    'zh-CN': '折扣力度',
    'zh-TW': '折扣力度',
    'en-US': 'Discount Rate'
  }
} as const

const typeOptions = {
  all: {
    'zh-CN': '全部',
    'zh-TW': '全部',
    'en-US': 'All'
  },
  general: {
    'zh-CN': '综合盒子',
    'zh-TW': '綜合盒子',
    'en-US': 'General Box'
  },
  specialized: {
    'zh-CN': '专业盒子',
    'zh-TW': '專業盒子',
    'en-US': 'Specialized Box'
  },
  discount: {
    'zh-CN': '折扣平台',
    'zh-TW': '折扣平台',
    'en-US': 'Discount Platform'
  }
} as const

const discountOptions = {
  all: {
    'zh-CN': '全部',
    'zh-TW': '全部',
    'en-US': 'All'
  },
  ultraLow: {
    'zh-CN': '0.1-1折',
    'zh-TW': '0.1-1折',
    'en-US': '90-99% OFF'
  },
  low: {
    'zh-CN': '1-3折',
    'zh-TW': '1-3折',
    'en-US': '70-90% OFF'
  },
  medium: {
    'zh-CN': '3-5折',
    'zh-TW': '3-5折',
    'en-US': '50-70% OFF'
  },
  high: {
    'zh-CN': '5-7折',
    'zh-TW': '5-7折',
    'en-US': '30-50% OFF'
  }
} as const

const sortTexts = {
  popular: {
    'zh-CN': '最受欢迎',
    'zh-TW': '最受歡迎',
    'en-US': 'Most Popular'
  },
  discount: {
    'zh-CN': '折扣最低',
    'zh-TW': '折扣最低',
    'en-US': 'Best Discount'
  },
  games: {
    'zh-CN': '游戏最多',
    'zh-TW': '遊戲最多',
    'en-US': 'Most Games'
  }
} as const

const uiTexts = {
  searchPlaceholder: {
    'zh-CN': '搜索盒子名称或特点...',
    'zh-TW': '搜尋盒子名稱或特點...',
    'en-US': 'Search box name or features...'
  },
  boxCategories: {
    'zh-CN': '盒子分类',
    'zh-TW': '盒子分類',
    'en-US': 'Box Categories'
  },
  boxesCount: {
    'zh-CN': '个盒子',
    'zh-TW': '個盒子',
    'en-US': 'boxes'
  },
  viewAll: {
    'zh-CN': '查看全部',
    'zh-TW': '查看全部',
    'en-US': 'View All'
  },
  noCategories: {
    'zh-CN': '暂无盒子分类',
    'zh-TW': '暫無盒子分類',
    'en-US': 'No box categories available'
  },
  noCategoryBoxes: {
    'zh-CN': '该分类暂无盒子',
    'zh-TW': '該分類暫無盒子',
    'en-US': 'No boxes in this category'
  },
  hotLabel: {
    'zh-CN': 'HOT',
    'zh-TW': 'HOT',
    'en-US': 'HOT'
  },
  statsBoxes: {
    'zh-CN': '收录盒子',
    'zh-TW': '盒子',
    'en-US': 'Boxes'
  },
  statsBestDiscount: {
    'zh-CN': '最低折扣',
    'zh-TW': '最低折扣',
    'en-US': 'Best Discount'
  },
  statsGames: {
    'zh-CN': '游戏数量',
    'zh-TW': '遊戲數量',
    'en-US': 'Games'
  },
  statsUsers: {
    'zh-CN': '用户选择',
    'zh-TW': '用戶選擇',
    'en-US': 'Users'
  },
  defaultLogoText: {
    'zh-CN': '盒',
    'zh-TW': '盒',
    'en-US': 'Box'
  }
} as const

export const boxesListConfig: BoxesPageConfig = {
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
        key: 'type',
        label: filterTexts.boxType,
        type: 'select',
        options: [
          { label: typeOptions.all, value: 'all' },
          { label: typeOptions.general, value: 'general' },
          { label: typeOptions.specialized, value: 'specialized' },
          { label: typeOptions.discount, value: 'discount' },
        ],
      },
      {
        key: 'discount',
        label: filterTexts.discount,
        type: 'select',
        options: [
          { label: discountOptions.all, value: 'all' },
          { label: discountOptions.ultraLow, value: '0.1-1' },
          { label: discountOptions.low, value: '1-3' },
          { label: discountOptions.medium, value: '3-5' },
          { label: discountOptions.high, value: '5-7' },
        ],
      },
    ],
  },

  // 排序
  sort: {
    enabled: true,
    defaultSort: 'popular',
    options: [
      { label: sortTexts.popular, value: 'popular' },
      { label: sortTexts.discount, value: 'discount' },
      { label: sortTexts.games, value: 'games' },
    ],
  },

  // 分页
  pagination: {
    pageSize: 12,
    showSizeChanger: true,
    pageSizeOptions: [12, 24, 36, 48],
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
    searchPlaceholder: uiTexts.searchPlaceholder,
    boxCategories: uiTexts.boxCategories,
    boxesCount: uiTexts.boxesCount,
    viewAll: uiTexts.viewAll,
    noCategories: uiTexts.noCategories,
    noCategoryBoxes: uiTexts.noCategoryBoxes,
    hotLabel: uiTexts.hotLabel,
    statsBoxes: uiTexts.statsBoxes,
    statsBestDiscount: uiTexts.statsBestDiscount,
    statsGames: uiTexts.statsGames,
    statsUsers: uiTexts.statsUsers,
    defaultLogoText: uiTexts.defaultLogoText,
  },
}
