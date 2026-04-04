import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { isValidLocale, supportedLocales, defaultLocale, type Locale } from '@/config/site/locales'
import ApiClient from '@/lib/api'
import DownloadClient from './DownloadClient'
import type { Metadata } from 'next'
import { generateBreadcrumbJsonLd } from '@/lib/jsonld'

export const dynamic = 'auto'

interface DownloadPageProps {
  params: Promise<{ locale: string; id: string }>
}

function DownloadPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          {/* Header */}
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-20 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-800 rounded animate-pulse flex-shrink-0" />
              <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* 盒子信息 */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="h-5 w-32 bg-slate-700 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
            </div>

            {/* 下载按钮区 */}
            <div className="flex flex-col gap-4">
              <div className="h-14 bg-slate-800 rounded animate-pulse" />
              <div className="h-14 bg-slate-800 rounded animate-pulse" />
            </div>

            {/* 下载说明 */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mb-3" />
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 w-full bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: DownloadPageProps): Promise<Metadata> {
  const { id, locale } = await params
  const localeTyped = locale as Locale
  const downloadUrl = localeTyped === defaultLocale ? `/boxes/${id}/download` : `/${localeTyped}/boxes/${id}/download`
  const languages: Record<string, string> = {}
  supportedLocales.forEach(l => {
    languages[l] = l === defaultLocale ? `/boxes/${id}/download` : `/${l}/boxes/${id}/download`
  })
  languages['x-default'] = `/boxes/${id}/download`

  try {
    const response = await ApiClient.getBoxDetail(Number(id), locale)
    const box = response.data

    return {
      title: locale === 'zh-TW' ? `下載 ${box.name}` : locale === 'en-US' ? `Download ${box.name}` : `下载 ${box.name}`,
      description: locale === 'zh-TW' ? `下載${box.name}遊戲盒子` : locale === 'en-US' ? `Download the ${box.name} game box` : `下载${box.name}游戏盒子`,
      alternates: { canonical: downloadUrl, languages },
    }
  } catch {
    return {
      title: locale === 'zh-TW' ? '下載遊戲盒子' : locale === 'en-US' ? 'Download Game Box' : '下载游戏盒子',
      description: locale === 'zh-TW' ? '下載遊戲盒子' : locale === 'en-US' ? 'Download a game box' : '下载游戏盒子',
      alternates: { canonical: downloadUrl, languages },
    }
  }
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { locale: localeParam, id } = await params
  
  if (!isValidLocale(localeParam)) {
    notFound()
  }
  
  const locale = localeParam as Locale

  return (
    <Suspense fallback={<DownloadPageSkeleton />}>
      <DownloadPageContent locale={locale} id={Number(id)} />
    </Suspense>
  )
}

async function DownloadPageContent({ locale, id }: { locale: Locale; id: number }) {
  let boxData: any = null

  try {
    const response = await ApiClient.getBoxDetail(id, locale)
    if (response.code === 200 && response.data) {
      boxData = response.data
    }
  } catch (error) {
    console.error('获取盒子详情失败:', error)
    notFound()
  }

  if (!boxData) {
    notFound()
  }

  const homeLabel = locale === 'zh-TW' ? '首頁' : locale === 'en-US' ? 'Home' : '首页'
  const boxesLabel = locale === 'zh-TW' ? '盒子大全' : locale === 'en-US' ? 'Boxes' : '盒子大全'
  const downloadLabel = locale === 'zh-TW' ? '下載' : locale === 'en-US' ? 'Download' : '下载'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd([
            { name: homeLabel, url: locale === defaultLocale ? '/' : `/${locale}` },
            { name: boxesLabel, url: locale === defaultLocale ? '/boxes' : `/${locale}/boxes` },
            { name: boxData.name, url: locale === defaultLocale ? `/boxes/${id}` : `/${locale}/boxes/${id}` },
            { name: downloadLabel, url: locale === defaultLocale ? `/boxes/${id}/download` : `/${locale}/boxes/${id}/download` },
          ])),
        }}
      />
      <DownloadClient boxData={boxData} locale={locale} />
    </>
  )
}
