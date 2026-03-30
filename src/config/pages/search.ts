/**
 * 搜索页配置
 * 路由: /search
 */

import type { LocalizedString, SeoMetadata } from '../types/common'

export interface SearchPageConfig {
  // 搜索框占位符
  placeholder: LocalizedString

  // 热门关键词
  hotKeywords: Record<'zh-CN' | 'zh-TW' | 'en-US', string[]>

  // 最近搜索
  recentSearches: {
    enabled: boolean
    maxItems: number
  }

  // 筛选功能
  filters: {
    enabled: boolean
  }

  // 结果展示
  results: {
    itemsPerPage: number
  }

  // UI文本
  ui: {
    search: LocalizedString
    searchPlaceholder: LocalizedString
    all: LocalizedString
    games: LocalizedString
    strategies: LocalizedString
    loadMore: LocalizedString
    loading: LocalizedString
    noResultsFound: LocalizedString
    tryOtherKeywords: LocalizedString
    startSearching: LocalizedString
    uncategorized: LocalizedString
    hotKeywords: LocalizedString
    recentSearches: LocalizedString
    searchResults: LocalizedString
    noResults: LocalizedString
    searchTips: LocalizedString
  }

  // SEO元数据
  // metadata: SeoMetadata
}

export const searchConfig: SearchPageConfig = {
  // 搜索框占位符
  placeholder: {
    'zh-CN': '搜索游戏、攻略、资讯...',
    'zh-TW': '搜尋遊戲、攻略、資訊...',
    'en-US': 'Search games, guides, news...'
  },

  // 热门关键词
  hotKeywords: {
    'zh-CN': [
      '传奇手游',
      '仙侠游戏',
      'RPG攻略',
      '破解游戏',
      '游戏盒子',
      '首充折扣',
    ],
    'zh-TW': [
      '傳奇手游',
      '仙俠遊戲',
      'RPG攻略',
      '破解遊戲',
      '遊戲盒子',
      '首充折扣',
    ],
    'en-US': [
      'Legend Mobile',
      'Xianxia Games',
      'RPG Guide',
      'Modded Games',
      'Game Box',
      'First Charge Discount',
    ]
  },

  // 最近搜索
  recentSearches: {
    enabled: true,
    maxItems: 10,
  },

  // 筛选功能
  filters: {
    enabled: true,
  },

  // 结果展示
  results: {
    itemsPerPage: 20,
  },

  // UI文本
  ui: {
    search: {
      'zh-CN': '搜索',
      'zh-TW': '搜尋',
      'en-US': 'Search'
    },
    searchPlaceholder: {
      'zh-CN': '搜索游戏、攻略...',
      'zh-TW': '搜尋遊戲、攻略...',
      'en-US': 'Search games, guides...'
    },
    all: {
      'zh-CN': '全部',
      'zh-TW': '全部',
      'en-US': 'All'
    },
    games: {
      'zh-CN': '游戏',
      'zh-TW': '遊戲',
      'en-US': 'Games'
    },
    strategies: {
      'zh-CN': '攻略',
      'zh-TW': '攻略',
      'en-US': 'Guides'
    },
    loadMore: {
      'zh-CN': '加载更多',
      'zh-TW': '載入更多',
      'en-US': 'Load More'
    },
    loading: {
      'zh-CN': '加载中...',
      'zh-TW': '載入中...',
      'en-US': 'Loading...'
    },
    noResultsFound: {
      'zh-CN': '未找到相关内容',
      'zh-TW': '未找到相關內容',
      'en-US': 'No relevant content found'
    },
    tryOtherKeywords: {
      'zh-CN': '试试其他关键词',
      'zh-TW': '試試其他關鍵詞',
      'en-US': 'Try other keywords'
    },
    startSearching: {
      'zh-CN': '输入关键词开始搜索',
      'zh-TW': '輸入關鍵詞開始搜尋',
      'en-US': 'Enter keywords to start searching'
    },
    uncategorized: {
      'zh-CN': '未分类',
      'zh-TW': '未分類',
      'en-US': 'Uncategorized'
    },
    hotKeywords: {
      'zh-CN': '热门关键词',
      'zh-TW': '熱門關鍵詞',
      'en-US': 'Hot Keywords'
    },
    recentSearches: {
      'zh-CN': '最近搜索',
      'zh-TW': '最近搜尋',
      'en-US': 'Recent Searches'
    },
    searchResults: {
      'zh-CN': '搜索结果',
      'zh-TW': '搜尋結果',
      'en-US': 'Search Results'
    },
    noResults: {
      'zh-CN': '没有找到相关结果',
      'zh-TW': '沒有找到相關結果',
      'en-US': 'No results found'
    },
    searchTips: {
      'zh-CN': '尝试使用不同的关键词或查看热门搜索',
      'zh-TW': '嘗試使用不同的關鍵詞或查看熱門搜索',
      'en-US': 'Try different keywords or check hot searches'
    }
  },
}
