/**
 * Metadata 生成辅助函数
 * 统一处理所有页面的 SEO 元数据
 */

import type { Metadata } from 'next'
import type { Locale } from '@/config/types'
import { metadataTemplates } from '@/config/fallback-metadata'
import ApiClient from './api'

/**
 * 生成页面 metadata，优先使用后端网站配置，失败时使用降级配置
 * 
 * @param locale - 当前语言
 * @param fallback - 降级配置（当 API 调用失败时使用）
 * @param customFields - 自定义字段（如详情页的标题等）
 */
export async function generatePageMetadata(
  locale: Locale,
  fallback: {
    title?: string
    description?: string
    keywords?: string
  } = {},
  customFields?: {
    titleTemplate?: (siteTitle: string) => string
    descriptionTemplate?: (siteDescription: string) => string
  }
): Promise<Metadata> {
  try {
    // 尝试从后端获取网站配置
    const siteConfigResponse = await ApiClient.getSiteConfig({ locale })
    const siteConfig = siteConfigResponse.data
    
    if (siteConfig) {
      // 使用网站配置生成 metadata
      let title = siteConfig.seoTitle || siteConfig.name
      let description = siteConfig.seoDescription || siteConfig.description
      
      // 如果有自定义模板，应用模板
      if (customFields?.titleTemplate) {
        title = customFields.titleTemplate(title)
      }
      if (customFields?.descriptionTemplate) {
        description = customFields.descriptionTemplate(description)
      }
      
      return {
        title,
        description,
        keywords: siteConfig.seoKeywords,
      }
    }
  } catch (error) {
    console.error('获取网站配置失败，使用降级配置:', error)
  }
  
  // 降级到提供的配置
  return {
    title: fallback.title,
    description: fallback.description,
    keywords: fallback.keywords,
  }
}

/**
 * 为首页生成 metadata
 */
export async function generateHomeMetadata(locale: Locale, fallbackTitle: string, fallbackDescription: string): Promise<Metadata> {
  return generatePageMetadata(locale, {
    title: fallbackTitle,
    description: fallbackDescription,
  })
}

/**
 * 为列表页生成 metadata（游戏列表、盒子列表、攻略列表等）
 */
export async function generateListMetadata(
  locale: Locale,
  pageType: 'games' | 'boxes' | 'strategy' | 'article',
  fallback: { title: string; description: string; keywords?: string }
): Promise<Metadata> {
  const template = metadataTemplates[locale][pageType] || metadataTemplates[locale]['strategy']
  
  return generatePageMetadata(locale, fallback, {
    titleTemplate: (siteTitle) => `${siteTitle}${template.titleSuffix}`,
    descriptionTemplate: (siteDesc) => `${template.descPrefix}${template.featuredContent} - ${siteDesc}`,
  })
}

/**
 * 为详情页生成 metadata
 */
export async function generateDetailMetadata(
  locale: Locale,
  itemTitle: string,
  itemDescription?: string,
  fallback?: { title: string; description: string }
): Promise<Metadata> {
  return generatePageMetadata(locale, fallback || {
    title: itemTitle,
    description: itemDescription || itemTitle,
  }, {
    titleTemplate: (siteTitle) => `${itemTitle} - ${siteTitle}`,
    descriptionTemplate: () => itemDescription || itemTitle,
  })
}
