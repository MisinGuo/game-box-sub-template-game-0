/**
 * 内容中心配置
 * 路由: /content
 * 说明: 统一管理攻略、资讯、评测等所有内容类型
 */

import type { LocalizedString, SeoMetadata } from '../types/common'

/**
 * 内容板块枚举
 * 用于区分不同类型的内容
 */
export enum ContentSection {
  // ── 攻略板块（AI可数据驱动生成）──────────────────
  /** 盒子选择攻略：哪个盒子更划算 */
  BOX_GUIDE = 'box_guide',
  /** 礼包领取攻略：礼包码汇总+领取教程 */
  GIFT_GUIDE = 'gift_guide',

  // ── 评测板块（数据横评，AI直接用数据出结论）──────
  /** 游戏横评：同品类多款游戏对比 */
  GAME_REVIEW = 'game_review',
  /** 盒子横评：多平台折扣对比 */
  BOX_REVIEW = 'box_review',

  // ── 专题板块（系统自动维护）──────────────────────
  /** 排行榜专题：下载量/评分/热度排行 */
  RANK_TOPIC = 'rank_topic',
  /** 省钱指南专题：官服 vs 盒子价差分析 */
  SAVING_TOPIC = 'saving_topic',
  /** 礼包特辑专题：限时/节日/品类礼包汇总 */
  GIFT_TOPIC = 'gift_topic',
  /** 品类推荐专题：零氪/护肝/国风等标签聚合 */
  CATEGORY_TOPIC = 'category_topic',
  /** 版本更新资讯（内嵌至游戏/盒子详情页） */
  NEWS_UPDATE = 'news_update',
  /** 活动资讯（内嵌至游戏/盒子详情页） */
  NEWS_EVENT = 'news_event',
  /** 行业动态（内嵌至游戏/盒子详情页） */
  NEWS_INDUSTRY = 'news_industry',
}

/**
 * 内容类型分组
 */
export const ContentGroups = {
  /** 攻略板块（默认按后端顶级 section slug 识别） */
  guides: [
    'guide-section',
  ],
  /** 评测板块（默认按后端顶级 section slug 识别） */
  reviews: [
    'review-section',
  ],
  /** 专题板块（默认按后端顶级 section slug 识别） */
  topics: [
    'event-section',
  ],
  /** 资讯（默认按后端顶级 section slug 识别） */
  news: [
    'news-section',
  ],
} as const

function parseSectionSlugEnv(input?: string): string[] {
  if (!input) return []
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function readGroupFromEnv(envKey: string, fallback: readonly string[]): readonly string[] {
  const configured = parseSectionSlugEnv(process.env[envKey])
  return configured.length > 0 ? configured : fallback
}

/**
 * 站点可配置的板块 slug 分组
 * 可通过 .env 配置：
 * - NEXT_PUBLIC_SECTION_SLUGS_GUIDES
 * - NEXT_PUBLIC_SECTION_SLUGS_REVIEWS
 * - NEXT_PUBLIC_SECTION_SLUGS_TOPICS
 * - NEXT_PUBLIC_SECTION_SLUGS_NEWS
 */
export const SiteSectionSlugGroups = {
  guides: readGroupFromEnv('NEXT_PUBLIC_SECTION_SLUGS_GUIDES', ContentGroups.guides),
  reviews: readGroupFromEnv('NEXT_PUBLIC_SECTION_SLUGS_REVIEWS', ContentGroups.reviews),
  topics: readGroupFromEnv('NEXT_PUBLIC_SECTION_SLUGS_TOPICS', ContentGroups.topics),
  news: readGroupFromEnv('NEXT_PUBLIC_SECTION_SLUGS_NEWS', ContentGroups.news),
} as const

/**
 * 板块显示配置
 */
export const sectionConfig: Record<ContentSection, {
  label: LocalizedString
  description: LocalizedString
  icon: string
  color: string
}> = {
  [ContentSection.NEWS_UPDATE]: {
    label: {
      'zh-CN': '版本更新',
      'zh-TW': '版本更新',
      'en-US': 'Version Update',
    },
    description: {
      'zh-CN': '最新版本,更新内容',
      'zh-TW': '最新版本,更新內容',
      'en-US': 'Latest version, update notes',
    },
    icon: '🆕',
    color: '#06b6d4',
  },
  [ContentSection.NEWS_EVENT]: {
    label: {
      'zh-CN': '活动资讯',
      'zh-TW': '活動資訊',
      'en-US': 'Events',
    },
    description: {
      'zh-CN': '限时活动,福利资讯',
      'zh-TW': '限時活動,福利資訊',
      'en-US': 'Limited events, rewards',
    },
    icon: '🎉',
    color: '#ec4899',
  },
  [ContentSection.NEWS_INDUSTRY]: {
    label: {
      'zh-CN': '行业动态',
      'zh-TW': '行業動態',
      'en-US': 'Industry News',
    },
    description: {
      'zh-CN': '游戏行业,最新动态',
      'zh-TW': '遊戲行業,最新動態',
      'en-US': 'Gaming industry, latest news',
    },
    icon: '📰',
    color: '#64748b',
  },
  [ContentSection.BOX_GUIDE]: {
    label: {
      'zh-CN': '盒子选择攻略',
      'zh-TW': '盒子選擇攻略',
      'en-US': 'Box Selection Guide',
    },
    description: {
      'zh-CN': '折扣对比,选对平台省大钱',
      'zh-TW': '折扣對比,選對平台省大錢',
      'en-US': 'Compare discounts, pick the best platform',
    },
    icon: '💰',
    color: '#f59e0b',
  },
  [ContentSection.GIFT_GUIDE]: {
    label: {
      'zh-CN': '礼包领取攻略',
      'zh-TW': '禮包領取攻略',
      'en-US': 'Gift Pack Guide',
    },
    description: {
      'zh-CN': '礼包码汇总,注册即领',
      'zh-TW': '禮包碼匯總,注冊即領',
      'en-US': 'Gift codes roundup, claim on registration',
    },
    icon: '🎁',
    color: '#ec4899',
  },
  [ContentSection.GAME_REVIEW]: {
    label: {
      'zh-CN': '游戏横评',
      'zh-TW': '遊戲橫評',
      'en-US': 'Game Comparison',
    },
    description: {
      'zh-CN': '同品类多款游戏数据对比',
      'zh-TW': '同品類多款遊戲數據對比',
      'en-US': 'Data-driven comparison of games by genre',
    },
    icon: '🎮',
    color: '#6366f1',
  },
  [ContentSection.BOX_REVIEW]: {
    label: {
      'zh-CN': '盒子横评',
      'zh-TW': '盒子橫評',
      'en-US': 'Box Platform Review',
    },
    description: {
      'zh-CN': '多平台真实折扣率横向对比',
      'zh-TW': '多平台真實折扣率橫向對比',
      'en-US': 'Cross-platform real discount rate comparison',
    },
    icon: '📊',
    color: '#14b8a6',
  },
  [ContentSection.RANK_TOPIC]: {
    label: {
      'zh-CN': '排行榜专题',
      'zh-TW': '排行榜專題',
      'en-US': 'Rankings',
    },
    description: {
      'zh-CN': '下载量/评分/热度实时排行',
      'zh-TW': '下載量/評分/熱度實時排行',
      'en-US': 'Real-time rankings by downloads, rating, popularity',
    },
    icon: '🏆',
    color: '#f97316',
  },
  [ContentSection.SAVING_TOPIC]: {
    label: {
      'zh-CN': '省钱指南',
      'zh-TW': '省錢指南',
      'en-US': 'Saving Guide',
    },
    description: {
      'zh-CN': '官服 vs 盒子价差分析,最省攻略',
      'zh-TW': '官服 vs 盒子價差分析,最省攻略',
      'en-US': 'Official vs box platform price comparison',
    },
    icon: '💡',
    color: '#10b981',
  },
  [ContentSection.GIFT_TOPIC]: {
    label: {
      'zh-CN': '礼包特辑',
      'zh-TW': '禮包特輯',
      'en-US': 'Gift Pack Special',
    },
    description: {
      'zh-CN': '限时/节日/品类礼包全收录',
      'zh-TW': '限時/節日/品類禮包全收錄',
      'en-US': 'Limited, holiday and category gift packs',
    },
    icon: '🎀',
    color: '#e11d48',
  },
  [ContentSection.CATEGORY_TOPIC]: {
    label: {
      'zh-CN': '品类推荐',
      'zh-TW': '品類推薦',
      'en-US': 'Category Picks',
    },
    description: {
      'zh-CN': '零氪/护肝/国风等标签聚合推荐',
      'zh-TW': '零氪/護肝/國風等標籤聚合推薦',
      'en-US': 'Free-to-play, casual, genre-specific picks',
    },
    icon: '🗂️',
    color: '#8b5cf6',
  },
}

/**
 * 内容页面配置
 */
export interface ContentPageConfig {
  // Hero区域
  hero: {
    title: LocalizedString
    description: LocalizedString
    badge: LocalizedString
  }
  
  // 板块导航
  sections: {
    enabled: boolean
    showAll: boolean  // 是否显示"全部"选项
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
    showSection: boolean  // 显示板块标签
    showDate: boolean
    showViews: boolean
    showReadingTime: boolean
  }

  // SEO
  seo: SeoMetadata

  // UI文本
  ui: {
    allContent: LocalizedString
    allSections: LocalizedString
    guides: LocalizedString
    news: LocalizedString
    reviews: LocalizedString
    topics: LocalizedString
    latest: LocalizedString
    contentCount: LocalizedString
    viewAll: LocalizedString
    noContent: LocalizedString
    hotLabel: LocalizedString
    viewsLabel: LocalizedString
  }
}

/**
 * 内容列表页配置
 */
export const contentListConfig: ContentPageConfig = {
  hero: {
    title: {
      'zh-CN': '内容中心',
      'zh-TW': '內容中心',
      'en-US': 'Content Center'
    },
    description: {
      'zh-CN': '游戏攻略、资讯评测，助你成为游戏高手',
      'zh-TW': '遊戲攻略、資訊評測，助你成為遊戲高手',
      'en-US': 'Game guides, news and reviews to help you become a gaming expert'
    },
    badge: {
      'zh-CN': '精选内容',
      'zh-TW': '精選內容',
      'en-US': 'Featured'
    }
  },

  sections: {
    enabled: true,
    showAll: true,
  },

  filter: {
    enabled: true,
    filters: [
      {
        key: 'category',
        label: {
          'zh-CN': '游戏品类',
          'zh-TW': '遊戲品類',
          'en-US': 'Category'
        },
        type: 'select',
        options: []  // 动态从API获取
      },
      {
        key: 'difficulty',
        label: {
          'zh-CN': '难度',
          'zh-TW': '難度',
          'en-US': 'Difficulty'
        },
        type: 'select',
        options: [
          {
            label: { 'zh-CN': '新手', 'zh-TW': '新手', 'en-US': 'Beginner' },
            value: 'beginner'
          },
          {
            label: { 'zh-CN': '进阶', 'zh-TW': '進階', 'en-US': 'Advanced' },
            value: 'advanced'
          },
          {
            label: { 'zh-CN': '专家', 'zh-TW': '專家', 'en-US': 'Expert' },
            value: 'expert'
          }
        ]
      }
    ]
  },

  sort: {
    enabled: true,
    defaultSort: 'latest',
    options: [
      {
        label: { 'zh-CN': '最新发布', 'zh-TW': '最新發布', 'en-US': 'Latest' },
        value: 'latest'
      },
      {
        label: { 'zh-CN': '最多浏览', 'zh-TW': '最多瀏覽', 'en-US': 'Most Viewed' },
        value: 'views'
      },
      {
        label: { 'zh-CN': '最多收藏', 'zh-TW': '最多收藏', 'en-US': 'Most Favorited' },
        value: 'favorites'
      }
    ]
  },

  pagination: {
    pageSize: 24,
    showSizeChanger: false,
    pageSizeOptions: [12, 24, 48]
  },

  card: {
    showCover: true,
    showCategory: true,
    showSection: true,
    showDate: true,
    showViews: true,
    showReadingTime: true,
  },

  seo: {
    title: {
      'zh-CN': '内容中心 - 游戏攻略资讯评测',
      'zh-TW': '內容中心 - 遊戲攻略資訊評測',
      'en-US': 'Content Center - Game Guides News Reviews'
    },
    description: {
      'zh-CN': '提供全面的游戏攻略、资讯、评测和专题内容，助你成为游戏高手',
      'zh-TW': '提供全面的遊戲攻略、資訊、評測和專題內容，助你成為遊戲高手',
      'en-US': 'Comprehensive game guides, news, reviews and featured content to help you become a gaming expert'
    },
    keywords: {
      'zh-CN': ['游戏攻略', '游戏资讯', '游戏评测', '新手攻略', '进阶攻略', '游戏新闻'],
      'zh-TW': ['遊戲攻略', '遊戲資訊', '遊戲評測', '新手攻略', '進階攻略', '遊戲新聞'],
      'en-US': ['game guide', 'game news', 'game review', 'beginner guide', 'advanced guide', 'gaming news']
    }
  },

  ui: {
    allContent: {
      'zh-CN': '全部内容',
      'zh-TW': '全部內容',
      'en-US': 'All Content'
    },
    allSections: {
      'zh-CN': '全部板块',
      'zh-TW': '全部板塊',
      'en-US': 'All Sections'
    },
    guides: {
      'zh-CN': '攻略',
      'zh-TW': '攻略',
      'en-US': 'Guides'
    },
    news: {
      'zh-CN': '资讯',
      'zh-TW': '資訊',
      'en-US': 'News'
    },
    reviews: {
      'zh-CN': '评测',
      'zh-TW': '評測',
      'en-US': 'Reviews'
    },
    topics: {
      'zh-CN': '专题',
      'zh-TW': '專題',
      'en-US': 'Topics'
    },
    latest: {
      'zh-CN': '最新内容',
      'zh-TW': '最新內容',
      'en-US': 'Latest Content'
    },
    contentCount: {
      'zh-CN': '篇内容',
      'zh-TW': '篇內容',
      'en-US': 'items'
    },
    viewAll: {
      'zh-CN': '查看全部',
      'zh-TW': '查看全部',
      'en-US': 'View All'
    },
    noContent: {
      'zh-CN': '暂无内容',
      'zh-TW': '暫無內容',
      'en-US': 'No content available'
    },
    hotLabel: {
      'zh-CN': 'HOT',
      'zh-TW': 'HOT',
      'en-US': 'HOT'
    },
    viewsLabel: {
      'zh-CN': '次浏览',
      'zh-TW': '次瀏覽',
      'en-US': 'views'
    }
  }
}
