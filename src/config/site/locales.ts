import type { LocaleConfig, Locale } from '../types'

// 重新导出类型，方便其他文件使用
export type { Locale, LocaleConfig } from '../types'

/**
 * 多语言配置
 * 默认语言（zh-CN）：无路由前缀，如 /special/
 * 其他语言：有路由前缀，如 /zh-TW/special/, /en/special/
 */

// 默认语言（主语言，无路由前缀）
export const defaultLocale: Locale = 'zh-CN'

// 支持的所有语言
export const supportedLocales: Locale[] = ['zh-CN', 'zh-TW', 'en-US']

export const locales: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    routePrefix: '',  // 默认语言，URL 无前缀
    translations: {
      // 导航
      home: '首页',
      articles: '文章',
      categories: '分类',
      tags: '标签',
      special: '特价游戏',
      strategy: '游戏攻略',
      article: '游戏资讯',
      content: '内容中心',
      boxes: '盒子大全',
      games: '游戏库',
      gifts: '礼包',
      // discounts: '福利中心',
      search: '搜索',
      
      // 操作
      readMore: '阅读更多',
      download: '下载',
      downloadNow: '立即下载',
      freeDownload: '免费下载',
      backToList: '返回列表',
      share: '分享',
      viewAll: '查看全部',
      viewDetail: '查看详情',
      
      // 信息
      readingTime: '阅读时间',
      minutes: '分钟',
      minutesRead: '分钟',
      readAbout: '阅读约',
      publishedAt: '发布于',
      updatedAt: '更新于',
      views: '浏览',
      
      // 内容
      relatedArticles: '相关文章',
      tableOfContents: '目录',
      allCategories: '全部分类',
      latestArticles: '最新文章',
      popularArticles: '热门文章',
      hotGames: '热门游戏',
      
      // 折扣
      // discountInfo: '折扣资讯',
      specialOffer: '特价优惠',
      limitedTime: '限时优惠',
      
      // 状态
      noResults: '没有找到相关结果',
      noArticles: '暂无攻略文章',
      stayTuned: '敬请期待更多精彩内容',
      defaultCategory: '游戏',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      
      // 表单
      searchPlaceholder: '搜索游戏、盒子、攻略...',
      emailPlaceholder: '请输入邮箱',
      submit: '提交',
      cancel: '取消',
      confirm: '确认',
      
      // 页面标题
      siteName: '我爱玩游戏网',
      specialTitle: '特价游戏',
      strategyTitle: '游戏攻略',
      articlesTitle: '文章资讯',
      gamesTitle: '游戏库',
      boxesTitle: '盒子大全',
      searchTitle: '搜索结果',
      
      // 游戏页面
      gameLibrary: '游戏库',
      hotGameDiscounts: '热门游戏折扣对比',
      premiumMobileGames: '精选热门手游，无限钻石、满V福利、内置修改器',
      gameCategories: '游戏分类',
      gamesCount: '款游戏',
      noGameCategories: '暂无游戏分类',
      noCategoryGames: '该分类暂无游戏',
      hotLabel: 'HOT',
      
      // 盒子页面
      boxCollection: '盒子大全',
      premiumGameBoxes: '精选 50+ 主流游戏盒子，一键对比首充续充折扣',
      boxCategories: '盒子分类',
      boxesCount: '个盒子',
      noBoxCategories: '暂无盒子分类',
      noCategoryBoxes: '该分类暂无盒子',
      
      // 攻略页面
      strategyGuide: '游戏攻略大全',
      comprehensiveGuides: '最全面的游戏攻略，助你快速上手，成为游戏高手',
      strategyCategories: '政略分类',
      strategiesCount: '篇政略',
      noStrategyCategories: '暂无攻略分类',
      noCategoryStrategies: '该分类暂无攻略',
      
      // 内容中心
      guides: '游戏攻略',
      news: '游戏资讯',
      reviews: '游戏评测',
      topics: '专题内容',
      guidesTitle: '游戏攻略',
      guidesDesc: '从新手到高手，全方位提升游戏技巧',
      newsTitle: '游戏资讯',
      newsDesc: '最新更新、活动资讯和行业动态',
      reviewsTitle: '游戏评测',
      reviewsDesc: '专业评测和深度对比分析',
      topicsTitle: '专题内容',
      topicsDesc: '精选专题合集和深度内容',
      heroTitleGuides: '成为游戏高手',
      heroDescGuides: '精选游戏攻略，从新手入门到竞技高手，全方位提升你的游戏技巧',
      heroTitleNews: '最新游戏资讯',
      heroDescNews: '第一时间掌握游戏更新、活动资讯和行业动态，不错过任何精彩内容',
      beginnerGuide: '新手入门',
      advancedGuide: '进阶技巧',
      pvpGuide: 'PVP竞技',
      lineupGuide: '阵容搭配',
      developmentGuide: '养成攻略',
      versionUpdate: '版本更新',
      eventNews: '活动资讯',
      industryNews: '行业动态',
      articlesCount: '篇内容',
      hot: '热门',
      
      // 搜索页面
      hotKeywords: '热门关键词',
      recentSearches: '最近搜索',
      searchResults: '搜索结果',
      searchTips: '尝试使用不同的关键词或查看热门搜索',
      
      // 通用排序和筛选
      all: '全部',
      relevance: '相关度',
      newest: '最新',
      popular: '热门',
      rating: '评分',
      alphabetical: '字母',
      sortBy: '排序方式',
      filterBy: '筛选条件',
      category: '分类',
      difficulty: '难度',
      beginner: '新手',
      intermediate: '中级',
      advanced: '高级',
      expert: '专家',
      clearFilters: '清除筛选',
      
      // SEO 后缀
      titleSuffix: 'GameBox',
      specialTitleSuffix: '特价游戏 - GameBox',
      strategyTitleSuffix: '游戏攻略 - GameBox',
      articleTitleSuffix: '文章 - GameBox',      
      // Footer
      footerDescription: '最专业的中立游戏盒子聚合平台。',
      footerDescription2: '汇集全网优质游戏盒子，提供最客观的折扣对比与攻略评测。',
      platformNavigation: '平台导航',
      aboutUs: '关于我们',
      followUs: '关注我们',
      subscribeNewsletter: '订阅最新游戏折扣情报',
      yourEmail: '您的邮箱',
      subscribe: '订阅',
      contactUs: '联系合作',
      disclaimer: '免责声明',
      privacyPolicy: '隐私政策',
      joinUs: '加入我们',
      allRightsReserved: 'Platform. All rights reserved.',    },
  },
  'zh-TW': {
    code: 'zh-TW',
    name: '繁體中文',
    routePrefix: '/zh-TW',  // 非默认语言，有前缀
    translations: {
      // 导航
      home: '首頁',
      articles: '文章',
      categories: '分類',
      tags: '標籤',
      special: '特價遊戲',
      strategy: '遊戲攻略',
      article: '遊戲資訊',
      content: '內容中心',
      boxes: '盒子大全',
      games: '遊戲庫',
      gifts: '禮包',
      // discounts: '福利中心',
      search: '搜索',
      
      // 操作
      readMore: '閱讀更多',
      download: '下載',
      downloadNow: '立即下載',
      freeDownload: '免費下載',
      backToList: '返回列表',
      share: '分享',
      viewAll: '查看全部',
      viewDetail: '查看詳情',
      
      // 信息
      readingTime: '閱讀時間',
      minutes: '分鐘',
      minutesRead: '分鐘',
      readAbout: '閱讀約',
      publishedAt: '發布於',
      updatedAt: '更新於',
      views: '瀏覽',
      
      // 内容
      relatedArticles: '相關文章',
      tableOfContents: '目錄',
      allCategories: '全部分類',
      latestArticles: '最新文章',
      popularArticles: '熱門文章',
      hotGames: '熱門遊戲',
      
      specialOffer: '特價優惠',
      limitedTime: '限時優惠',
      
      // 状态
      noResults: '沒有找到相關結果',
      noArticles: '暫無攻略文章',
      stayTuned: '敬請期待更多精彩內容',
      defaultCategory: '遊戲',
      loading: '載入中...',
      error: '錯誤',
      success: '成功',
      
      // 表單
      searchPlaceholder: '搜索遊戲、盒子、攻略...',
      emailPlaceholder: '請輸入郵箱',
      submit: '提交',
      cancel: '取消',
      confirm: '確認',
      
      // 頁面標題
      siteName: '我愛玩遊戲網',
      specialTitle: '特價遊戲',
      strategyTitle: '遊戲攻略',
      articlesTitle: '文章資訊',
      gamesTitle: '遊戲庫',
      boxesTitle: '盒子大全',
      searchTitle: '搜索結果',
      
      // 游戏页面
      gameLibrary: '遊戲庫',
      hotGameDiscounts: '熱門遊戲折扣對比',
      premiumMobileGames: '精選熱門手遊，無限鑽石、滿V福利、內置修改器',
      gameCategories: '遊戲分類',
      gamesCount: '款遊戲',
      noGameCategories: '暫無遊戲分類',
      noCategoryGames: '該分類暫無遊戲',
      hotLabel: 'HOT',      
      // 盒子頁面
      boxCollection: '盒子大全',
      premiumGameBoxes: '精選 50+ 主流遊戲盒子，一鍵對比首充續充折扣',
      boxCategories: '盒子分類',
      boxesCount: '個盒子',
      noBoxCategories: '暫無盒子分類',
      noCategoryBoxes: '該分類暫無盒子',
      
      // 攻略頁面
      strategyGuide: '遊戲攻略大全',
      comprehensiveGuides: '最全面的遊戲攻略，助你快速上手，成為遊戲高手',
      strategyCategories: '攻略分類',
      strategiesCount: '篇攻略',
      noStrategyCategories: '暫無攻略分類',
      noCategoryStrategies: '該分類暫無攻略',      
      // 內容中心
      guides: '遊戲攻略',
      news: '遊戲資訊',
      reviews: '遊戲評測',
      topics: '專題內容',
      guidesTitle: '遊戲攻略',
      guidesDesc: '從新手到高手，全方位提升遊戲技巧',
      newsTitle: '遊戲資訊',
      newsDesc: '最新更新、活動資訊和行業動態',
      reviewsTitle: '遊戲評測',
      reviewsDesc: '專業評測和深度對比分析',
      topicsTitle: '專題內容',
      topicsDesc: '精選專題合集和深度內容',
      heroTitleGuides: '成為遊戲高手',
      heroDescGuides: '精選遊戲攻略，從新手入門到競技高手，全方位提升你的遊戲技巧',
      heroTitleNews: '最新遊戲資訊',
      heroDescNews: '第一時間掌握遊戲更新、活動資訊和行業動態，不錯過任何精彩內容',
      beginnerGuide: '新手入門',
      advancedGuide: '進階技巧',
      pvpGuide: 'PVP競技',
      lineupGuide: '陣容搭配',
      developmentGuide: '養成攻略',
      versionUpdate: '版本更新',
      eventNews: '活動資訊',
      industryNews: '行業動態',
      articlesCount: '篇內容',
      hot: '熱門',
      
      // 搜尋頁面
      hotKeywords: '熱門關鍵詞',
      recentSearches: '最近搜尋',
      searchResults: '搜尋結果',
      searchTips: '嘗試使用不同的關鍵詞或查看熱門搜尋',
      
      // 通用排序和篩選
      all: '全部',
      relevance: '相關度',
      newest: '最新',
      popular: '熱門',
      rating: '評分',
      alphabetical: '字母',
      sortBy: '排序方式',
      filterBy: '篩選條件',
      category: '分類',
      difficulty: '難度',
      beginner: '新手',
      intermediate: '中級',
      advanced: '高級',
      expert: '專家',
      clearFilters: '清除篩選',
      

      // SEO 后缀
      titleSuffix: 'GameBox',
      specialTitleSuffix: '特價遊戲 - GameBox',
      strategyTitleSuffix: '遊戲攻略 - GameBox',
      articleTitleSuffix: '文章 - GameBox',
      
      // Footer
      footerDescription: '最專業的中立遊戲盒子聚合平台。',
      footerDescription2: '匯集全網優質遊戲盒子，提供最客觀的折扣對比與攻略評測。',
      platformNavigation: '平台導航',
      aboutUs: '關於我們',
      followUs: '關注我們',
      subscribeNewsletter: '訂閱最新遊戲折扣情報',
      yourEmail: '您的郵箱',
      subscribe: '訂閱',
      contactUs: '聯繫合作',
      disclaimer: '免責聲明',
      privacyPolicy: '隱私政策',
      joinUs: '加入我們',
      allRightsReserved: 'Platform. All rights reserved.',
    },
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    routePrefix: '/en-US',  // 非默认语言，有前缀
    translations: {
      // Navigation
      home: 'Home',
      articles: 'Articles',
      categories: 'Categories',
      tags: 'Tags',
      special: 'Special Offers',
      strategy: 'Game Guides',
      article: 'Game News',
      content: 'Content',
      boxes: 'Game Boxes',
      games: 'Games',
      gifts: 'Gifts',
      // discounts: 'Rewards Center',
      search: 'Search',
      
      // Actions
      readMore: 'Read More',
      download: 'Download',
      downloadNow: 'Download Now',
      freeDownload: 'Free Download',
      backToList: 'Back to List',
      share: 'Share',
      viewAll: 'View All',
      viewDetail: 'View Details',
      
      // Info
      readingTime: 'Reading Time',
      minutes: 'min',
      minutesRead: 'min',
      readAbout: 'About',
      publishedAt: 'Published at',
      updatedAt: 'Updated at',
      views: 'Views',
      
      // Content
      relatedArticles: 'Related Articles',
      tableOfContents: 'Table of Contents',
      allCategories: 'All Categories',
      latestArticles: 'Latest Articles',
      popularArticles: 'Popular Articles',
      hotGames: 'Hot Games',
      
      // Discounts
      // discountInfo: 'Discount Info',
      specialOffer: 'Special Offer',
      limitedTime: 'Limited Time',
      
      // Status
      noArticles: 'No articles yet',
      stayTuned: 'Stay tuned for more exciting content',
      defaultCategory: 'Game',
      error: 'Error',
      success: 'Success',
      
      // Forms
      searchPlaceholder: 'Search games, boxes, guides...',
      emailPlaceholder: 'Enter your email',
      submit: 'Submit',
      cancel: 'Cancel',
      confirm: 'Confirm',
      
      // Page titles (before footer)
      siteName: 'GameBox',
      specialTitle: 'Special Offers',
      strategyTitle: 'Game Guides',
      articlesTitle: 'Articles',
      gamesTitle: 'Game Library',
      boxesTitle: 'Game Boxes',
      searchTitle: 'Search Results',
      
      // Games page
      gameLibrary: 'Game Library',
      hotGameDiscounts: 'Hot Game Discount Comparison',
      premiumMobileGames: 'Premium mobile games with unlimited diamonds, VIP benefits, and built-in modifiers',
      gameCategories: 'Game Categories',
      gamesCount: 'games',
      noGameCategories: 'No game categories available',
      noCategoryGames: 'No games in this category',
      hotLabel: 'HOT',
      
      // Boxes page
      boxCollection: 'Box Collection',
      premiumGameBoxes: 'Premium 50+ game boxes, compare first-charge and recharge discounts with one click',
      boxCategories: 'Box Categories',
      boxesCount: 'boxes',
      noBoxCategories: 'No box categories available',
      noCategoryBoxes: 'No boxes in this category',
      
      // Strategy page
      strategyGuide: 'Game Strategy Guide',
      comprehensiveGuides: 'Comprehensive game guides to help you get started quickly and become a gaming expert',
      strategyCategories: 'Strategy Categories',
      strategiesCount: 'strategies',
      noStrategyCategories: 'No strategy categories available',
      noCategoryStrategies: 'No strategies in this category',
      
      // Content Center
      guides: 'Guides',
      news: 'News',
      reviews: 'Reviews',
      topics: 'Topics',
      guidesTitle: 'Game Guides',
      guidesDesc: 'From beginner to pro gamer',
      newsTitle: 'Game News',
      newsDesc: 'Latest updates and industry news',
      reviewsTitle: 'Game Reviews',
      reviewsDesc: 'Professional reviews and comparisons',
      topicsTitle: 'Featured Topics',
      topicsDesc: 'Curated topics and in-depth content',
      heroTitleGuides: 'Become a Pro Gamer',
      heroDescGuides: 'Curated game guides from beginner to pro, level up your gaming skills',
      heroTitleNews: 'Latest Game News',
      heroDescNews: 'Stay updated with game updates, events and industry news',
      beginnerGuide: 'Beginner',
      advancedGuide: 'Advanced',
      pvpGuide: 'PVP',
      lineupGuide: 'Team Comp',
      developmentGuide: 'Development',
      versionUpdate: 'Updates',
      eventNews: 'Events',
      industryNews: 'Industry',
      articlesCount: ' articles',
      hot: 'Hot',
      
      // Search page
      hotKeywords: 'Hot Keywords',
      recentSearches: 'Recent Searches',
      searchResults: 'Search Results',
      searchTips: 'Try different keywords or check hot searches',
      
      // Common sorting and filtering
      all: 'All',
      relevance: 'Relevance',
      newest: 'Newest',
      popular: 'Popular',
      rating: 'Rating',
      alphabetical: 'Alphabetical',
      sortBy: 'Sort By',
      filterBy: 'Filter By',
      category: 'Category',
      difficulty: 'Difficulty',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
      clearFilters: 'Clear Filters',
      
      // Footer
      footerDescription: 'The most professional neutral game box aggregation platform.',
      footerDescription2: 'Gathering high-quality game boxes from across the web, providing objective discount comparisons and strategy reviews.',
      platformNavigation: 'Platform',
      aboutUs: 'About Us',
      followUs: 'Follow Us',
      subscribeNewsletter: 'Subscribe to the latest game discount alerts',
      yourEmail: 'Your email',
      subscribe: 'Subscribe',
      contactUs: 'Contact',
      disclaimer: 'Disclaimer',
      privacyPolicy: 'Privacy Policy',
      joinUs: 'Join Us',
      allRightsReserved: 'Platform. All rights reserved.',
    },
  },
}

/** 获取语言配置 */
export function getLocale(code: Locale): LocaleConfig {
  return locales[code] || locales[defaultLocale]
}

/** 根据路径获取语言代码 */
export function getLocaleFromPath(path: string): Locale {
  // 检查路径是否以语言前缀开头
  if (path.startsWith('/zh-TW/') || path === '/zh-TW') {
    return 'zh-TW'
  }
  if (path.startsWith('/en-US/') || path === '/en-US') {
    return 'en-US'
  }
  // 默认语言（无前缀）
  return defaultLocale
}

/** 检查是否为有效的语言代码 */
export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale)
}

/** 服务器端翻译函数（用于 Server Components） */
export function getTranslation(key: string, locale: Locale = defaultLocale): string {
  const config = getLocale(locale)
  return (config.translations as any)[key] || key
}
