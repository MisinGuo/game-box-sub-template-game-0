import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Not Found',
}

const messages: Record<string, { title: string; desc: string; back: string }> = {
  'zh-TW': { title: '頁面未找到', desc: '您訪問的頁面不存在或已被移除。', back: '返回首頁' },
  'en-US': { title: 'Page Not Found', desc: 'The page you are looking for does not exist or has been removed.', back: 'Return Home' },
  'zh-CN': { title: '页面未找到', desc: '您访问的页面不存在或已被移除。', back: '返回首页' },
}

export default async function LocaleNotFound() {
  const headersList = await headers()
  const locale = headersList.get('x-locale') || 'zh-CN'
  const { title, desc, back } = messages[locale] || messages['zh-CN']
  const homeUrl = locale === 'zh-CN' ? '/' : `/${locale}`

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-slate-300 mb-4">{title}</p>
        <p className="text-slate-400 mb-8">{desc}</p>
        <Link href={homeUrl} className="text-blue-400 hover:text-blue-300 transition-colors">
          {back}
        </Link>
      </div>
    </div>
  )
}
