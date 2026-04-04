import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ArrowRight, BookOpen, Star, FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { generateCollectionPageJsonLd } from '@/lib/jsonld'

export async function generateStaticParams() {
  return supportedLocales.map(locale => ({ locale }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  
  if (!isValidLocale(localeParam)) {
    return {
      title: '内容中心',
      description: '游戏攻略、资讯、评测',
    }
  }
  
  const locale = localeParam as Locale
  const listPath = '/content'
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? listPath : `/${l}${listPath}`
  })
  languages['x-default'] = listPath

  const base = await generateListMetadata(locale, 'strategy', {
    title: locale === 'zh-CN' ? '内容中心 - 盒子攻略·游戏评测·省錢专题' : locale === 'zh-TW' ? '內容中心 - 盒子攻略·遲戲評測·省錢專題' : 'Content Center - Box Guides, Reviews & Topics',
    description: locale === 'zh-CN' ? '盒子选购指南、礼包领取攻略、游戏横评、省錢专题 - AI全程维护' : locale === 'zh-TW' ? '盒子選購指南、礼包領取攻略、遲戲横評、省錢專題 - AI全程维護' : 'Box guides, gift pack tips, game reviews and saving topics',
    keywords: '游戏盒子攻略,礼包领取,游戏横评,手游省錢',
  })
  return {
    ...base,
    alternates: {
      canonical: locale === defaultLocale ? listPath : `/${locale}${listPath}`,
      languages,
    },
  }
}

export const dynamic = 'auto'
export const revalidate = 180

export default async function ContentCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  
  if (!isValidLocale(localeParam)) {
    return null
  }
  
  const locale = localeParam as Locale
  
  const t = (key: string) => {
    const translations: Record<string, Record<Locale, string>> = {
      home: { 'zh-CN': '首页', 'zh-TW': '首頁', 'en-US': 'Home' },
      content: { 'zh-CN': '内容中心', 'zh-TW': '內容中心', 'en-US': 'Content Center' },
      heroTitle: { 'zh-CN': '内容中心', 'zh-TW': '內容中心', 'en-US': 'Content Center' },
      heroDesc: { 'zh-CN': '盒子攻略 · 游戏评测 · 省钱专题 — AI 全程维护，数据实时更新', 'zh-TW': '盒子攻略 · 遊戲評測 · 省錢專題 — AI 全程維護，數據實時更新', 'en-US': 'Box Guides · Game Reviews · Saving Topics — AI-powered, data-driven' },
      guidesTitle: { 'zh-CN': '攻略', 'zh-TW': '攻略', 'en-US': 'Guides' },
      guidesDesc: { 'zh-CN': '盒子怎么选、礼包怎么领，数据说话', 'zh-TW': '盒子怎麼選、禮包怎麼領，數據說話', 'en-US': 'Which box to pick & how to claim gift packs' },
      reviewsTitle: { 'zh-CN': '评测', 'zh-TW': '評測', 'en-US': 'Reviews' },
      reviewsDesc: { 'zh-CN': '游戏横评 + 盒子折扣横评，AI 出表格你做决定', 'zh-TW': '遊戲橫評 + 盒子折扣橫評，AI 出表格你做決定', 'en-US': 'Game & platform comparisons — AI builds the table, you decide' },
      topicsTitle: { 'zh-CN': '专题', 'zh-TW': '專題', 'en-US': 'Topics' },
      topicsDesc: { 'zh-CN': '排行榜 · 省钱指南 · 礼包特辑 — 系统自动维护', 'zh-TW': '排行榜 · 省錢指南 · 禮包特輯 — 系統自動維護', 'en-US': 'Rankings · Saving Guide · Gift Specials — auto-updated' },
      viewAll: { 'zh-CN': '查看全部', 'zh-TW': '查看全部', 'en-US': 'View All' },
    }
    return translations[key]?.[locale] || key
  }

  const basePath = locale === 'zh-CN' ? '' : `/${locale}`
  const categories = [
    {
      title: t('guidesTitle'),
      description: t('guidesDesc'),
      icon: '💰',
      href: `${basePath}/content/guides`,
      bgClass: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
      border: 'hover:border-amber-500/50',
      tags: [
        { label: locale === 'zh-CN' ? '盒子选购' : locale === 'zh-TW' ? '盒子選購' : 'Box Guide', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' },
        { label: locale === 'zh-CN' ? '礼包领取' : locale === 'zh-TW' ? '禮包領取' : 'Gift Packs', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
      ],
    },
    {
      title: t('reviewsTitle'),
      description: t('reviewsDesc'),
      icon: '📊',
      href: `${basePath}/content/reviews`,
      bgClass: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
      border: 'hover:border-indigo-500/50',
      tags: [
        { label: locale === 'zh-CN' ? '游戏横评' : locale === 'zh-TW' ? '遊戲橫評' : 'Game Compare', color: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' },
        { label: locale === 'zh-CN' ? '盒子横评' : locale === 'zh-TW' ? '盒子橫評' : 'Box Compare', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300' },
      ],
    },
    {
      title: t('topicsTitle'),
      description: t('topicsDesc'),
      icon: '🏆',
      href: `${basePath}/content/topics`,
      bgClass: 'bg-gradient-to-br from-green-500/10 to-teal-500/10',
      border: 'hover:border-green-500/50',
      tags: [
        { label: locale === 'zh-CN' ? '排行榜' : locale === 'zh-TW' ? '排行榜' : 'Rankings', color: 'bg-green-500/20 text-green-700 dark:text-green-300' },
        { label: locale === 'zh-CN' ? '省钱指南' : locale === 'zh-TW' ? '省錢指南' : 'Saving', color: 'bg-teal-500/20 text-teal-700 dark:text-teal-300' },
        { label: locale === 'zh-CN' ? '礼包特辑' : locale === 'zh-TW' ? '禮包特輯' : 'Gift Special', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionPageJsonLd({
            name: t('heroTitle'),
            description: t('heroDesc'),
            url: basePath ? `${basePath}/content` : '/content',
            items: categories.map((cat) => ({
              name: cat.title,
              url: cat.href,
            })),
          })),
        }}
      />
      {/* 面包屑 */}
      <div className="container py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={locale === 'zh-CN' ? '/' : `/${locale}`} className="hover:text-foreground transition-colors">
            {t('home')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{t('content')}</span>
        </div>
      </div>

      {/* Hero区 */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-sm">
              {locale === 'zh-CN' ? 'AI 全程维护' : locale === 'zh-TW' ? 'AI 全程維護' : 'AI-powered'}
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight">{t('heroTitle')}</h1>
            <p className="text-xl text-muted-foreground">{t('heroDesc')}</p>
          </div>
        </div>
      </section>

      {/* 内容分类卡片 — 3板块 */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className="group">
              <Card className={`h-full hover:shadow-2xl transition-all duration-300 ${category.border} overflow-hidden relative`}>
                <div className={`absolute inset-0 ${category.bgClass} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="relative space-y-4 p-8">
                  <div className="flex items-start justify-between">
                    <div className={`h-16 w-16 rounded-2xl ${category.bgClass} flex items-center justify-center text-4xl border border-white/10`}>
                      {category.icon}
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-foreground group-hover:opacity-80 transition-opacity">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{category.description}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {category.tags.map((tag) => (
                      <span key={tag.label} className={`text-xs px-2 py-1 rounded-full font-medium ${tag.color}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium pt-2 text-primary group-hover:text-primary/80">
                    {t('viewAll')} →
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>


      </section>
    </div>
  )
}
