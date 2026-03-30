/**
 * 配置系统统一导出
 * 
 * 配置目录结构：
 * - site/    站点配置（基本信息、主题、多语言、模块）
 * - api/     API配置（后端接口）
 * - pages/   页面配置（各页面的UI配置）
 */

// ========================================
// 类型定义
// ========================================

export type {
  // 全局类型
  Locale,
  ModuleType,
  SiteConfig,
  // 模块配置类型
  CategoryFilterConfig,
  DownloadEntryConfig,
  SidebarConfig,
  ArticleListConfig,
  ArticleDetailConfig,
  ThemeConfig,
  ModuleConfig,
  LocaleConfig,
} from './types'

// ========================================
// 站点配置
// ========================================

export {
  // 站点基本信息
  siteConfig,
  // 主题配置
  themeConfig,
  getThemeColor,
  generateCSSVariables,
  // 多语言配置
  locales,
  supportedLocales,
  getLocale,
  defaultLocale,
  // 模块配置
  modules,
  getModuleConfig,
} from './site/index'

export type {
  // 主题类型
  ThemeColors,
  ThemeFonts,
  ThemeLayout,
  ThemeBorderRadius,
  ThemeShadow,
  ThemeConfig as ThemeConfigType,
} from './site/index'

// ========================================
// API配置
// ========================================

export {
  backendConfig,
  apiEndpoints,
  getApiUrl,
  getHeaders,
} from './api/index'

export type {
  BackendConfig,
  ApiEndpoints,
} from './api/index'

// ========================================
// 页面配置
// ========================================

export {
  // 各页面配置
  homeConfig,
  // 配置获取函数
  getPageConfig,
  getHomePageConfig,
} from './pages/index'

export type {
  // 页面配置类型
  HomePageConfig,
  HeroConfig,
  StatItem,
  ContentSectionConfig,
} from './pages/index'

// ========================================
// Sitemap配置
// ========================================

export {
  sitemapConfig,
} from './sitemap/config'

export type {
  SitemapConfig,
  SitemapUrl,
  ContentType,
} from '@/lib/sitemap/types'
