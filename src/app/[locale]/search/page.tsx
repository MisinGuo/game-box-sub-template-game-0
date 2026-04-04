import { Metadata } from 'next'
import SearchPageClient from './SearchClient'
import { isValidLocale, supportedLocales, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'

export async function generateStaticParams() {
  return supportedLocales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return {
      title: '搜索',
    }
  }

  const locale = localeParam as Locale

  const base = await generateListMetadata(locale, 'strategy', {
    title:
      locale === 'zh-CN'
        ? '站内搜索 - 快速查找游戏与内容'
        : locale === 'zh-TW'
        ? '站內搜尋 - 快速查找遊戲與內容'
        : 'Search - Find Games and Content Fast',
    description:
      locale === 'zh-CN'
        ? '支持按关键词搜索游戏、攻略与评测内容，快速定位你想看的信息。'
        : locale === 'zh-TW'
        ? '支援按關鍵字搜尋遊戲、攻略與評測內容，快速定位你想看的資訊。'
        : 'Search games, guides and reviews by keyword to quickly find what you need.',
    keywords:
      locale === 'zh-CN'
        ? '搜索,游戏搜索,攻略搜索,站内搜索'
        : locale === 'zh-TW'
        ? '搜尋,遊戲搜尋,攻略搜尋,站內搜尋'
        : 'search,game search,guide search,site search',
  })
  return {
    ...base,
    robots: { index: false, follow: true },
  }
}

export const dynamic = 'auto'
export const revalidate = 180

export default async function LocalizedSearchPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale: localeParam } = await params

  if (!isValidLocale(localeParam)) {
    return null
  }

  const locale = localeParam as Locale

  return <SearchPageClient locale={locale} />
}
