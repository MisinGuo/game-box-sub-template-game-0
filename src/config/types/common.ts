/**
 * 共享通用类型
 * 用于跨模块使用的基础类型定义
 */

// 导入Locale类型以确保类型一致性
import type { Locale } from '../types'

/** 多语言文本类型 */
export type LocalizedString = Record<Locale, string>

/** 多语言数组类型 */
export type LocalizedArray<T> = Record<Locale, T[]>

/** 链接配置 */
export interface LinkConfig {
  /** 链接文本 */
  text: LocalizedString
  /** 链接地址 */
  href: string
  /** 是否在新窗口打开 */
  target?: '_blank' | '_self'
}

/** 按钮配置 */
export interface ButtonConfig extends LinkConfig {
  /** 按钮样式 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg'
}

/** SEO元数据 */
export interface SeoMetadata {
  /** 页面标题 */
  title: LocalizedString
  /** 页面描述 */
  description: LocalizedString
  /** 关键词 */
  keywords: Record<Locale, string[]>
  /** OG图片 */
  ogImage?: string
}

/** 布局类型 */
export type LayoutType = 'grid-2' | 'grid-3' | 'grid-4' | 'grid-6' | 'list' | 'compact'

/** 数据加载配置 */
export interface DataLoadConfig {
  /** 是否启用缓存 */
  enableCache: boolean
  /** 缓存时间（秒） */
  cacheTime: number
  /** 每页数量 */
  pageSize?: number
}
