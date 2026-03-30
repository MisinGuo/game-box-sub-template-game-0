import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Package, Gift, Calendar, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ApiClient from '@/lib/api'
import { isValidLocale, supportedLocales, getTranslation, type Locale } from '@/config/site/locales'
import { generateListMetadata } from '@/lib/metadata'
import { SiteSectionSlugGroups } from '@/config/pages/content'
import ImageWithFallback from '../../ImageWithFallback'

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
    return { title: '游戏攻略' }
  }
  
  const locale = localeParam as Locale
  
  return generateListMetadata(locale, 'strategy', {
    title: locale === 'zh-CN' ? '盒子攻略 - 怎么选盒子·礼包怎么领' : locale === 'zh-TW' ? '盒子攻略 - 怎麼選盒子·禮包怎麼領' : 'Box & Gift Pack Guides',
    description: locale === 'zh-CN' ? '游戏盒子折扣对比攻略，礼包码领取教程，数据说话帮你省钱' : locale === 'zh-TW' ? '遊戲盒子折扣對比攻略，禮包碼領取教程，數據說話幫你省錢' : 'Game box discount guides and gift pack tutorials to save money',
    keywords: locale === 'zh-CN' ? '游戏盒子攻略,礼包领取,盒子对比,手游省钱' : 'game box guide,gift pack,box comparison',
  })
}

export const dynamic = 'auto'
export const revalidate = 180

interface GuideArticle {
  id: number
  title: string
  description?: string
  coverImage?: string
  coverUrl?: string
  categoryName?: string
  section?: string
  viewCount?: number
  createTime: string
}

async function getArticlesBySections(locale: Locale, sections: readonly string[]): Promise<GuideArticle[]> {
  const articleMap = new Map<number, GuideArticle>()

  for (const section of sections) {
    try {
      const response = await ApiClient.getArticles({
        pageNum: 1,
        pageSize: 200,
        locale,
        section,
      })

      if (response.code === 200 && response.rows) {
        for (const article of response.rows as GuideArticle[]) {
          if (article?.id) {
            articleMap.set(article.id, article)
          }
        }
      }
    } catch (error) {
      console.error(`获取攻略 section=${section} 失败:`, error)
    }
  }

  return Array.from(articleMap.values())
}

async function getGuideArticles(locale: Locale) {
  return getArticlesBySections(locale, SiteSectionSlugGroups.guides as readonly string[])
}

function formatDate(dateString: string, locale: Locale): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (locale === 'en-US') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    return dateString.substring(0, 10)
  } catch {
    return dateString.substring(0, 10)
  }
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  
  if (!isValidLocale(localeParam)) {
    return null
  }
  
  const locale = localeParam as Locale
  const articles = await getGuideArticles(locale)
  const groupedArticles = Array.from(
    articles.reduce((map, article) => {
      const groupName = article.categoryName?.trim() || (locale === 'en-US' ? 'Uncategorized' : locale === 'zh-TW' ? '未分類' : '未分类')
      if (!map.has(groupName)) {
        map.set(groupName, [])
      }
      map.get(groupName)!.push(article)
      return map
    }, new Map<string, GuideArticle[]>())
  )
  
  const t = (key: string) => getTranslation(key, locale)
  const basePath = locale === 'zh-CN' ? '' : `/${locale}`
  const ArticleCard = ({ article }: { article: GuideArticle }) => (
    <Link href={`${basePath}/content/guides/${article.id}`} className="group">
      <Card className="h-full hover:shadow-lg transition-all hover:border-amber-500/50">
        <div className={`grid ${(article.coverUrl || article.coverImage) ? 'md:grid-cols-[120px_1fr]' : ''} gap-0`}>
          {(article.coverUrl || article.coverImage) && (
            <div className="aspect-square overflow-hidden rounded-l-lg bg-slate-800">
              <ImageWithFallback
                src={article.coverUrl || article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader className="p-4">
            <CardTitle className="text-base group-hover:text-amber-500 transition-colors line-clamp-2">
              {article.title}
            </CardTitle>
            {article.description && (
              <CardDescription className="line-clamp-2 text-xs">{article.description}</CardDescription>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(article.createTime, locale)}
              </span>
              {article.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {article.viewCount}
                </span>
              )}
            </div>
          </CardHeader>
        </div>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* 面包屑 */}
      <div className="container py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={locale === 'zh-CN' ? '/' : `/${locale}`} className="hover:text-foreground transition-colors">
            {t('home')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`${basePath}/content`} className="hover:text-foreground transition-colors">
            {t('content')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">
            {locale === 'zh-CN' ? '攻略' : locale === 'zh-TW' ? '攻略' : 'Guides'}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-background relative overflow-hidden">
        <div className="container py-12 relative">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              <Package className="h-4 w-4" />
              <span className="font-semibold text-sm">
                {articles.length} {locale === 'en-US' ? 'Guides' : locale === 'zh-TW' ? '篇攻略' : '篇攻略'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {locale === 'zh-CN' ? '攻略' : locale === 'zh-TW' ? '攻略' : 'Guides'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {locale === 'zh-CN'
                ? '选对盒子省一半，礼包一分钱不花 — 数据说话，AI 整理'
                : locale === 'zh-TW'
                ? '選對盒子省一半，禮包一分錢不花 — 數據說話，AI 整理'
                : 'Pick the right box, claim every free gift — data-driven, AI-curated'}
            </p>
            {groupedArticles.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {groupedArticles.slice(0, 6).map(([groupName]) => (
                  <Badge key={groupName} variant="outline" className="text-sm px-3 py-1.5">
                    {groupName}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 攻略列表 */}
      <section className="container py-12 space-y-14">
        {groupedArticles.map(([groupName, items]) => (
          <div key={groupName} className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-2xl">📚</div>
              <div>
                <h2 className="text-2xl font-bold">{groupName}</h2>
              </div>
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 ml-auto">
                {items.length}
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        ))}

        {/* 空态 */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-2">{t('noArticles')}</h3>
            <p className="text-muted-foreground">{t('stayTuned')}</p>
          </div>
        )}
      </section>
    </div>
  )
}
