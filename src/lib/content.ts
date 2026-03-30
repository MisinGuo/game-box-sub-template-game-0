/**
 * 内容管理模块
 * 
 * ⚠️ 已禁用：不再使用 src/docs 目录构建内容
 * 所有内容现在从后端 API 获取
 */

import type { Locale } from '@/config/types'
import { defaultLocale } from '@/config/site/locales'

// ==================== 禁用的代码（不再使用 src/docs） ====================
/*
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// 内容目录路径
const DOCS_DIR = path.join(process.cwd(), 'src/docs')

function getLocalizedDocsDir(locale: Locale = defaultLocale): string {
  const localizedDir = path.join(DOCS_DIR, locale)
  if (fs.existsSync(localizedDir)) {
    return localizedDir
  }
  return DOCS_DIR
}
*/

// 站点配置
export const siteConfig = {
  jumpDomain: 'https://example.com/download',
  bgImageUrl: '/images/bg.jpg',
}

export interface ArticleFrontmatter {
  title: string
  date: string
  category?: string
  icon?: string
  star?: boolean
  keywords?: string
  description?: string
  tags?: string[]
}

export interface Article {
  slug: string
  frontmatter: ArticleFrontmatter
  content: string
  readingTime: number
  category: string
  subcategory?: string
}

// ==================== 禁用的辅助函数 ====================
/*
function processContent(content: string): string {
  return content
    .replace(/\{\{siteConfig\.jumpDomain\}\}/g, siteConfig.jumpDomain)
    .replace(/\{\{siteConfig\.bgImageUrl\}\}/g, siteConfig.bgImageUrl)
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = content.split(/\s+/).filter(Boolean).length
  const totalWords = chineseChars + words
  return Math.ceil(totalWords / wordsPerMinute)
}

function formatDateString(date: unknown): string {
  if (!date) return '2025-01-01'
  if (typeof date === 'string') return date
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }
  return '2025-01-01'
}

function getAllMarkdownFiles(dir: string, basePath: string = ''): string[] {
  // ... 文件扫描逻辑
}

function pathToSlug(filePath: string): string {
  // ... slug 解析逻辑
}
*/

// ==================== API 函数（返回空数据）====================

/**
 * 获取特价游戏列表
 * ⚠️ 已禁用：请使用后端 API /api/public/articles
 */
export async function getSpecialArticles(locale: Locale = defaultLocale): Promise<Article[]> {
  return []
}


/**
 * 获取单篇特价游戏文章
 * ⚠️ 已禁用：请使用后端 API /api/public/articles/{id}
 */
export async function getSpecialArticle(slug: string, locale: Locale = defaultLocale): Promise<Article | null> {
  return null
}

/**
 * 获取特价游戏分类列表
 * ⚠️ 已禁用：请使用后端 API /api/public/categories
 */
export async function getSpecialCategories(locale: Locale = defaultLocale): Promise<{ name: string; count: number; icon: string }[]> {
  return []
}

/**
 * 获取分类下的游戏列表
 * ⚠️ 已禁用：请使用后端 API /api/public/articles
 */
export async function getSpecialGamesByCategory(category: string, locale: Locale = defaultLocale): Promise<Article[]> {
  return []
}

// 向后兼容：提供旧的函数名作为别名
export const getPojieArticles = getSpecialArticles
export const getPojieArticle = getSpecialArticle
export const getPojieCategories = getSpecialCategories
export const getPojieGamesByCategory = getSpecialGamesByCategory
