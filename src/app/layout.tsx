import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Noto_Sans_SC } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/sonner'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { NavigationTracker } from '@/components/common/NavigationTracker'
import { WebVitals } from '@/components/common/WebVitals'
import { siteConfig } from '@/config'
import { backendConfig } from '@/config/api/backend'
import ApiClient from '@/lib/api'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans-sc',
})

const ogLocaleMap: Record<string, string> = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  'en-US': 'en_US',
}

const supportedLocales = ['zh-CN', 'zh-TW', 'en-US']

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const locale = headersList.get('x-locale') || 'zh-CN'

  const alternateLocales = supportedLocales
    .filter(l => l !== locale)
    .map(l => ogLocaleMap[l])

  // 从后端 site-config 接口获取站点信息，失败时降级到静态配置
  let siteName = siteConfig.name
  let siteDescription = siteConfig.description
  let siteKeywords = siteConfig.keywords

  try {
    const res = await ApiClient.getSiteConfig({ locale })
    const data = res?.data
    if (data) {
      siteName = data.seoTitle || data.name || siteName
      siteDescription = data.seoDescription || data.description || siteDescription
      if (data.seoKeywords) {
        siteKeywords = data.seoKeywords.split(',').map((k: string) => k.trim())
      }
    }
  } catch {
    // 降级到静态配置，无需处理错误
  }

  return {
    metadataBase: new URL(siteConfig.hostname),
    title: {
      default: siteName,
      template: `%s | ${siteName}`
    },
    description: siteDescription,
    keywords: siteKeywords,
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] || 'zh_CN',
      alternateLocale: alternateLocales,
      siteName: siteName,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const locale = headersList.get('x-locale') || 'zh-CN'
  const apiOrigin = new URL(backendConfig.baseURL).origin

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href={apiOrigin} />
        <link rel="dns-prefetch" href={apiOrigin} />
        <link rel="alternate" type="application/rss+xml" title={siteConfig.name} href="/feed.xml" />
      </head>
      <body className={`${notoSansSC.variable} min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans`}>
        <LocaleProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
          <Suspense fallback={null}>
            <NavigationTracker />
          </Suspense>
          <WebVitals />
        </LocaleProvider>
      </body>
    </html>
  )
}
