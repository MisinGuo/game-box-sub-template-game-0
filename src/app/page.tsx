/**
 * 根路径页面 - 默认语言（zh-CN）首页
 *
 * 当用户访问 /pdd（basePath 根路径）时，由此页面处理。
 * 复用 [locale]/page.tsx 的完整逻辑，固定使用默认语言 zh-CN。
 *
 * URL 结构：
 *   /pdd         → 此文件渲染（默认语言 zh-CN）
 *   /pdd/zh-TW   → [locale]/page.tsx 渲染
 *   /pdd/en-US   → [locale]/page.tsx 渲染
 */
import LocaleHomePage, { generateMetadata as generateLocaleMetadata } from './[locale]/page'
import { defaultLocale } from '@/config/site/locales'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata({ params: Promise.resolve({ locale: defaultLocale }) })
}

export default function RootPage() {
  return <LocaleHomePage params={Promise.resolve({ locale: defaultLocale })} />
}
