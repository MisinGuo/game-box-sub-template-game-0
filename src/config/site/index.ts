/**
 * 站点配置统一导出
 * 包含：站点基本信息、主题、多语言、模块配置
 */

// 导出站点配置
export { siteConfig } from './site'

// 导出主题配置
export {
  themeConfig,
  getThemeColor,
  generateCSSVariables,
} from './theme'
export type {
  ThemeColors,
  ThemeFonts,
  ThemeLayout,
  ThemeBorderRadius,
  ThemeShadow,
  ThemeConfig,
} from './theme'

// 导出多语言配置
export {
  locales,
  supportedLocales,
  getLocale,
  defaultLocale,
} from './locales'

// 导出模块配置
export {
  modules,
  getModuleConfig,
} from './modules'
