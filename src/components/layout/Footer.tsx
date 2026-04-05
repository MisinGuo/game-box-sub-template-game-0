'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocale } from '@/contexts/LocaleContext'

export function Footer() {
  const t = useTranslation()
  const { locale } = useLocale()
  
  // 根据当前语言生成正确的链接
  const getLocalePath = (path: string) => {
    if (locale === 'zh-CN') {
      return path
    }
    return `/${locale}${path}`
  }
  
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href={getLocalePath('/')} className="flex items-center gap-2 font-bold text-xl text-white mb-4">
            <Image src="/logo.png" alt={t('siteName')} width={32} height={32} className="rounded" />
            <span>{t('siteName')}</span>
          </Link>
          <p className="text-sm leading-relaxed">
            {t('footerDescription')}
            <br />
            {t('footerDescription2')}
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-white mb-4">{t('platformNavigation')}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href={getLocalePath('/boxes')} className="hover:text-blue-400">{t('boxes')}</Link></li>
            <li><Link href={getLocalePath('/games')} className="hover:text-blue-400">{t('games')}</Link></li>
            <li><Link href={getLocalePath('/articles')} className="hover:text-blue-400">{t('articles')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">{t('aboutUs')}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href={getLocalePath('/contact')} className="hover:text-blue-400">{t('contactUs')}</Link></li>
            <li><Link href={getLocalePath('/disclaimer')} className="hover:text-blue-400">{t('disclaimer')}</Link></li>
            <li><Link href={getLocalePath('/privacy')} className="hover:text-blue-400">{t('privacyPolicy')}</Link></li>
            <li><Link href={getLocalePath('/join')} className="hover:text-blue-400">{t('joinUs')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">{t('followUs')}</h3>
          <p className="text-sm mb-4">{t('subscribeNewsletter')}</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder={t('yourEmail')} 
              className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              {t('subscribe')}
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2025 {t('siteName')} {t('allRightsReserved')}
      </div>
    </footer>
  )
}
