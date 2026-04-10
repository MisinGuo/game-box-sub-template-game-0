import type { SiteConfig } from '../types'
import { siteConfigFile } from '@/lib/site-config'

const { branding, site, features, verification } = siteConfigFile

export const siteConfig: SiteConfig = {
  name: branding.siteName,
  description: branding.description,
  hostname: process.env.NEXT_PUBLIC_SITE_HOSTNAME || site.hostname,
  jumpDomain: process.env.NEXT_PUBLIC_JUMP_DOMAIN || site.jumpDomain,
  logo: branding.logo,
  favicon: branding.favicon,
  ogImage: branding.ogImage,
  keywords: branding.keywords,
  verification,
  defaultLocale: site.defaultLocale,
  supportedLocales: site.supportedLocales,
  copyright: branding.copyright,
  author: branding.author,
  social: branding.social,
  features,
  nav: siteConfigFile.navigation.header
    .filter((item) => item.enabled)
    .map((item) => ({
      text: item.label,
      link: item.path,
    })),
}
