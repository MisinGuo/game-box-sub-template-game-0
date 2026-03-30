/**
 * 主题配置文件
 * 用户可以通过修改此文件自定义网站外观
 */

export interface ThemeColors {
  /** 主色调 */
  primary: string
  /** 辅助色 */
  secondary: string
  /** 强调色 */
  accent: string
  /** 成功色 */
  success: string
  /** 警告色 */
  warning: string
  /** 错误色 */
  error: string
  /** 信息色 */
  info: string
  /** 背景色 */
  background: string
  /** 前景色（文字） */
  foreground: string
  /** 卡片背景 */
  card: string
  /** 边框颜色 */
  border: string
  /** 输入框背景 */
  input: string
  /** 环形进度条 */
  ring: string
}

export interface ThemeFonts {
  /** 无衬线字体 */
  sans: string[]
  /** 衬线字体 */
  serif: string[]
  /** 等宽字体 */
  mono: string[]
  /** 标题字体 */
  heading?: string[]
}

export interface ThemeLayout {
  /** 最大内容宽度 */
  maxWidth: string
  /** 内容宽度 */
  contentWidth: string
  /** 侧边栏宽度 */
  sidebarWidth: string
  /** 头部高度 */
  headerHeight: string
  /** 容器内边距 */
  containerPadding: string
}

export interface ThemeBorderRadius {
  /** 小圆角 */
  sm: string
  /** 默认圆角 */
  DEFAULT: string
  /** 中圆角 */
  md: string
  /** 大圆角 */
  lg: string
  /** 超大圆角 */
  xl: string
  /** 全圆角 */
  full: string
}

export interface ThemeShadow {
  /** 小阴影 */
  sm: string
  /** 默认阴影 */
  DEFAULT: string
  /** 中等阴影 */
  md: string
  /** 大阴影 */
  lg: string
  /** 超大阴影 */
  xl: string
}

export interface ThemeConfig {
  /** 颜色配置 */
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
  /** 字体配置 */
  fonts: ThemeFonts
  /** 布局配置 */
  layout: ThemeLayout
  /** 圆角配置 */
  borderRadius: ThemeBorderRadius
  /** 阴影配置 */
  shadow: ThemeShadow
  /** Logo配置 */
  logo: {
    /** 亮色模式Logo */
    light: string
    /** 暗色模式Logo */
    dark: string
    /** Logo高度（px） */
    height: number
    /** Logo宽度（px，auto为自适应） */
    width: number | 'auto'
  }
  /** 自定义CSS */
  customCSS?: string
}

/**
 * 默认主题配置
 * 用户可以根据需要修改这些值
 */
export const themeConfig: ThemeConfig = {
  colors: {
    // 亮色模式配置
    light: {
      primary: '#3B82F6',        // 蓝色
      secondary: '#8B5CF6',      // 紫色
      accent: '#F59E0B',         // 橙色
      success: '#10B981',        // 绿色
      warning: '#F59E0B',        // 黄色
      error: '#EF4444',          // 红色
      info: '#3B82F6',           // 蓝色
      background: '#FFFFFF',     // 白色
      foreground: '#1F2937',     // 深灰
      card: '#F9FAFB',           // 浅灰
      border: '#E5E7EB',         // 边框灰
      input: '#FFFFFF',          // 输入框白
      ring: '#3B82F6',           // 聚焦环蓝
    },
    // 暗色模式配置
    dark: {
      primary: '#60A5FA',        // 亮蓝
      secondary: '#A78BFA',      // 亮紫
      accent: '#FBBF24',         // 亮橙
      success: '#34D399',        // 亮绿
      warning: '#FBBF24',        // 亮黄
      error: '#F87171',          // 亮红
      info: '#60A5FA',           // 亮蓝
      background: '#0F172A',     // 深蓝灰
      foreground: '#F1F5F9',     // 浅灰白
      card: '#1E293B',           // 卡片深灰
      border: '#334155',         // 边框灰
      input: '#1E293B',          // 输入框深灰
      ring: '#60A5FA',           // 聚焦环亮蓝
    },
  },
  
  fonts: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Noto Sans',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji',
    ],
    serif: [
      'Georgia',
      'Cambria',
      'Times New Roman',
      'Times',
      'serif',
    ],
    mono: [
      'Fira Code',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    heading: [
      'Inter',
      'system-ui',
      'sans-serif',
    ],
  },
  
  layout: {
    maxWidth: '1440px',
    contentWidth: '960px',
    sidebarWidth: '280px',
    headerHeight: '64px',
    containerPadding: '1rem',
  },
  
  borderRadius: {
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    full: '9999px',    // 圆形
  },
  
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  logo: {
    light: '/logo-light.svg',
    dark: '/logo-dark.svg',
    height: 40,
    width: 'auto',
  },
  
  // 自定义CSS（可选）
  customCSS: undefined,
}

/**
 * 获取颜色值（根据当前主题模式）
 */
export function getThemeColor(colorKey: keyof ThemeColors, isDark: boolean = false): string {
  return isDark ? themeConfig.colors.dark[colorKey] : themeConfig.colors.light[colorKey]
}

/**
 * 生成CSS变量
 */
export function generateCSSVariables(isDark: boolean = false): string {
  const colors = isDark ? themeConfig.colors.dark : themeConfig.colors.light
  
  return Object.entries(colors)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n  ')
}
