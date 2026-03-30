/**
 * 页面级翻译数据集中管理
 *
 * 结构：每个命名空间导出一个 TranslationMap（locale → Record<key, string>）
 * 使用方法：
 *   import { gamePageTranslations, getT } from '@/i18n/page-translations'
 *   const t = getT(gamePageTranslations, locale)
 *   // → t.downloadNow
 */

import type { Locale } from '@/config/site/locales'

export type TranslationMap = Record<Locale, Record<string, string>>

/** 从 TranslationMap 获取当前语言翻译，找不到则 fallback 到 zh-CN */
export function getT(map: TranslationMap, locale: string): Record<string, string> {
  return map[locale as Locale] ?? map['zh-CN']
}

// ─────────────────────────────────────────────
// 游戏详情页  games/[id]/page.tsx
// ─────────────────────────────────────────────
export const gamePageTranslations: TranslationMap = {
  'zh-CN': {
    home: '首页', gameLibrary: '游戏库',
    notFound: '游戏不存在', notFoundDesc: '您访问的游戏不存在或已被删除', backToGames: '返回游戏列表',
    ratingUnit: '分', downloads: '下载',
    downloadNow: '立即下载', androidDownload: 'Android 下载', noDownload: '暂无下载', iosDownload: 'iOS 下载', share: '分享',
    version: '版本', size: '大小', updateTime: '更新时间', developer: '开发商', publisher: '发行商',
    gameIntro: '游戏简介', noIntro: '暂无游戏简介', gameVideo: '游戏视频', gameScreenshots: '游戏截图',
    metaTitleSuffix: ' - 游戏详情', metaDescPrefix: '下载 ', metaDescSuffix: '，查看游戏详情、评分和玩家评价',
  },
  'zh-TW': {
    home: '首頁', gameLibrary: '遊戲庫',
    notFound: '遊戲不存在', notFoundDesc: '您訪問的遊戲不存在或已被刪除', backToGames: '返回遊戲列表',
    ratingUnit: '分', downloads: '下載',
    downloadNow: '立即下載', androidDownload: 'Android 下載', noDownload: '暫無下載', iosDownload: 'iOS 下載', share: '分享',
    version: '版本', size: '大小', updateTime: '更新時間', developer: '開發商', publisher: '發行商',
    gameIntro: '遊戲簡介', noIntro: '暫無遊戲簡介', gameVideo: '遊戲視頻', gameScreenshots: '遊戲截圖',
    metaTitleSuffix: ' - 遊戲詳情', metaDescPrefix: '下載 ', metaDescSuffix: '，查看遊戲詳情、評分和玩家評價',
  },
  'en-US': {
    home: 'Home', gameLibrary: 'Games',
    notFound: 'Game Not Found', notFoundDesc: 'The game you are looking for does not exist or has been removed.', backToGames: 'Back to Games',
    ratingUnit: '', downloads: 'Downloads',
    downloadNow: 'Download Now', androidDownload: 'Android Download', noDownload: 'No Download Available', iosDownload: 'iOS Download', share: 'Share',
    version: 'Version', size: 'Size', updateTime: 'Updated', developer: 'Developer', publisher: 'Publisher',
    gameIntro: 'About the Game', noIntro: 'No description available.', gameVideo: 'Game Video', gameScreenshots: 'Screenshots',
    metaTitleSuffix: ' - Game Detail', metaDescPrefix: 'Download ', metaDescSuffix: ', view game details, ratings and reviews',
  },
}

// ─────────────────────────────────────────────
// 盒子详情页  boxes/[id]/page.tsx
// ─────────────────────────────────────────────
export const boxPageTranslations: TranslationMap = {
  'zh-CN': {
    home: '首页', boxes: '游戏盒子',
    metaTitleSuffix: ' - 游戏盒子详情', metaDescPrefix: '了解', metaDescSuffix: '游戏盒子的详细信息，包含游戏列表、折扣信息等',
    metaFallbackTitle: '游戏盒子详情', metaFallbackDesc: '游戏盒子详细信息',
    noDesc: '暂无描述',
    rating: '评分', games: '游戏', users: '用户', users100w: '100万+',
    downloadNow: '立即下载',
    features: '特色功能',
    includedGames: '包含游戏', gamesCount: '款游戏',
    noGames: '暂无游戏', noGamesDesc: '该盒子还没有添加游戏',
    isNew: '新游', uncategorized: '未分类',
    moreInfo: '更多信息', visitWebsite: '访问官方网站',
    discountSuffix: '折',
  },
  'zh-TW': {
    home: '首頁', boxes: '遊戲盒子',
    metaTitleSuffix: ' - 遊戲盒子詳情', metaDescPrefix: '了解', metaDescSuffix: '遊戲盒子的詳細信息，包含遊戲列表、折扣信息等',
    metaFallbackTitle: '遊戲盒子詳情', metaFallbackDesc: '遊戲盒子詳細信息',
    noDesc: '暫無描述',
    rating: '評分', games: '遊戲', users: '用戶', users100w: '100萬+',
    downloadNow: '立即下載',
    features: '特色功能',
    includedGames: '包含遊戲', gamesCount: '款遊戲',
    noGames: '暫無遊戲', noGamesDesc: '該盒子還沒有添加遊戲',
    isNew: '新遊', uncategorized: '未分類',
    moreInfo: '更多信息', visitWebsite: '訪問官方網站',
    discountSuffix: '折',
  },
  'en-US': {
    home: 'Home', boxes: 'Game Boxes',
    metaTitleSuffix: ' - Game Box Detail', metaDescPrefix: 'Learn about ', metaDescSuffix: ' game box, including game list, discounts and more.',
    metaFallbackTitle: 'Game Box Detail', metaFallbackDesc: 'Game box detailed information',
    noDesc: 'No description available.',
    rating: 'Rating', games: 'Games', users: 'Users', users100w: '1M+',
    downloadNow: 'Download Now',
    features: 'Features',
    includedGames: 'Included Games', gamesCount: ' games',
    noGames: 'No Games', noGamesDesc: 'No games have been added to this box yet.',
    isNew: 'New', uncategorized: 'Uncategorized',
    moreInfo: 'More Info', visitWebsite: 'Visit Official Website',
    discountSuffix: '% OFF',
  },
}

// ─────────────────────────────────────────────
// 分类 TOP 10 组件  components/category/CategoryTopGames.tsx
// ─────────────────────────────────────────────
export const categoryTopGamesTranslations: TranslationMap = {
  'zh-CN': {
    topTitle: 'TOP 10 推荐', tagline: '精选热门游戏，零氪也能爽玩',
    isNew: '新游', isHot: '热门', isRecommend: '推荐',
    downloads: '次下载', viewDetail: '查看详情', register: '注册下载', gift: '领取礼包',
  },
  'zh-TW': {
    topTitle: 'TOP 10 推薦', tagline: '精選熱門遊戲，零氪也能爽玩',
    isNew: '新遊', isHot: '熱門', isRecommend: '推薦',
    downloads: '次下載', viewDetail: '查看詳情', register: '注冊下載', gift: '領取禮包',
  },
  'en-US': {
    topTitle: 'TOP 10 Picks', tagline: 'Best picks — free-to-play friendly',
    isNew: 'New', isHot: 'Hot', isRecommend: 'Recommended',
    downloads: ' downloads', viewDetail: 'View Details', register: 'Register & Download', gift: 'Claim Gift',
  },
}

// ─────────────────────────────────────────────
// 相关游戏组件  components/game/RelatedGames.tsx
// ─────────────────────────────────────────────
export const relatedGamesTranslations: TranslationMap = {
  'zh-CN': { moreGames: '更多游戏', relatedGames: '相关游戏推荐', explore: '探索同类型精选游戏', viewAll: '查看全部', newGame: '新游' },
  'zh-TW': { moreGames: '更多遊戲', relatedGames: '相關遊戲推薦', explore: '探索同類型精選遊戲', viewAll: '查看全部', newGame: '新遊' },
  'en-US': { moreGames: 'More Games', relatedGames: 'Related Games', explore: 'Explore similar games', viewAll: 'View All', newGame: 'New' },
}

// ─────────────────────────────────────────────
// 盒子筛选面板  app/[locale]/boxes/BoxesFilterSheet.tsx
// tagOptions label key: tag_firstCharge / tag_recharge / tag_highRebate / tag_manyGames / tag_goodSupport
// ─────────────────────────────────────────────
export const filterSheetTranslations: TranslationMap = {
  'zh-CN': {
    filterBtn: '筛选', filterTitle: '筛选盒子', filterDesc: '根据条件筛选合适的游戏盒子',
    discountTitle: '折扣力度', tagTitle: '特色标签', cancel: '取消', apply: '应用筛选',
    tag_firstCharge: '首充福利', tag_recharge: '续充优惠', tag_highRebate: '返利高',
    tag_manyGames: '游戏全', tag_goodSupport: '客服好',
  },
  'zh-TW': {
    filterBtn: '篩選', filterTitle: '篩選盒子', filterDesc: '根據條件篩選合適的遊戲盒子',
    discountTitle: '折扣力度', tagTitle: '特色標籤', cancel: '取消', apply: '應用篩選',
    tag_firstCharge: '首充福利', tag_recharge: '續充優惠', tag_highRebate: '返利高',
    tag_manyGames: '遊戲全', tag_goodSupport: '客服好',
  },
  'en-US': {
    filterBtn: 'Filter', filterTitle: 'Filter Boxes', filterDesc: 'Filter boxes by conditions',
    discountTitle: 'Discount Rate', tagTitle: 'Features', cancel: 'Cancel', apply: 'Apply',
    tag_firstCharge: 'First Charge Bonus', tag_recharge: 'Recharge Discount', tag_highRebate: 'High Rebate',
    tag_manyGames: 'Wide Selection', tag_goodSupport: 'Good Support',
  },
}

// tagOptions 定义（key 列表），label 从上方 filterSheetTranslations 的 tag_* key 取
export const filterTagOptionKeys = [
  'firstCharge',
  'recharge',
  'highRebate',
  'manyGames',
  'goodSupport',
] as const

// ─────────────────────────────────────────────
// 文章布局组件  components/content/ArticleLayout.tsx
// ─────────────────────────────────────────────
export const articleLayoutTranslations: TranslationMap = {
  'zh-CN': {
    home: '首页', readingTime: '阅读约 {n} 分钟', toc: '目录', closeToc: '关闭目录', openToc: '打开目录',
    relatedTitle: '相关', moreContent: '更多精彩内容即将上线...',
    autoClose: '自动关闭', keepOpen: '保持打开', autoCloseHint: '点击后自动关闭', keepOpenHint: '点击后保持打开',
    downloadBox: '下载游戏盒子', downloadNow: '立即下载', priceLabel: '0.1折 起下载',
  },
  'zh-TW': {
    home: '首頁', readingTime: '閱讀約 {n} 分鐘', toc: '目錄', closeToc: '關閉目錄', openToc: '打開目錄',
    relatedTitle: '相關', moreContent: '更多精彩內容即將上線...',
    autoClose: '自動關閉', keepOpen: '保持打開', autoCloseHint: '點擊後自動關閉', keepOpenHint: '點擊後保持打開',
    downloadBox: '下載遊戲盒子', downloadNow: '立即下載', priceLabel: '0.1折 起下載',
  },
  'en-US': {
    home: 'Home', readingTime: '{n} min read', toc: 'Contents', closeToc: 'Close TOC', openToc: 'Open TOC',
    relatedTitle: 'Related', moreContent: 'More content coming soon...',
    autoClose: 'Auto-close', keepOpen: 'Keep open', autoCloseHint: 'Close on click', keepOpenHint: 'Stay open on click',
    downloadBox: 'Download Game Box', downloadNow: 'Download Now', priceLabel: 'Up to 90% OFF',
  },
}
