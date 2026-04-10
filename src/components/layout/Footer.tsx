'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocale } from '@/contexts/LocaleContext'
import { siteConfig } from '@/config'
import { getLocalizedFooterCopy, getLocalizedSiteName, siteConfigFile } from '@/lib/site-config'

export function Footer() {
  const t = useTranslation()
  const { locale } = useLocale()
  const siteName = getLocalizedSiteName(locale)
  const footerCopy = getLocalizedFooterCopy(locale)
  const navItems = siteConfigFile.navigation.header
    .filter((item) => item.enabled)
    .map((item) => ({
      id: item.path,
      label: t(item.i18nKey) || item.label,
    }))
  const socialLinks = Object.entries(siteConfigFile.branding.social ?? {})
  const primaryNavItem = navItems.find((item) => item.id !== '/') || navItems[0]
  
  const getLocalePath = (path: string) => {
    if (locale === 'zh-CN') {
      return path
    }
    return `/${locale}${path}`
  }
  
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="border-b border-slate-900 bg-slate-950/80">
        <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 py-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">{t('platformNavigation')}</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{siteName}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {footerCopy.footerDescription}
              {footerCopy.footerDescription2 ? <><br />{footerCopy.footerDescription2}</> : null}
            </p>
          </div>

          {primaryNavItem ? (
            <Link
              href={getLocalePath(primaryNavItem.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
            >
              {primaryNavItem.label}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        <div>
          <Link href={getLocalePath('/')} className="flex items-center gap-3 text-white">
            <Image src={siteConfig.logo} alt={siteName} width={40} height={40} className="rounded" />
            <span className="text-lg font-semibold">{siteName}</span>
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{siteConfigFile.branding.tagline}</p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">{t('platformNavigation')}</h3>
          <ul className="space-y-3 text-sm">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link href={getLocalePath(item.id)} className="transition-colors hover:text-sky-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">{t('followUs')}</h3>
          <div className="space-y-3 text-sm">
            {socialLinks.length > 0 ? socialLinks.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition-colors hover:border-sky-500/40 hover:text-sky-400"
              >
                <span className="capitalize">{platform}</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            )) : (
              <p className="text-sm leading-7 text-slate-500">{t('subscribeNewsletter')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>{siteConfigFile.branding.copyright}</p>
          <p>{t('subscribeNewsletter')}</p>
        </div>
      </div>
    </footer>
  )
}
