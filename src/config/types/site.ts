export interface SiteConfigBranding {
  siteName: string
  siteNameI18n?: Record<string, string>
  tagline: string
  description: string
  copyright: string
  logo: string
  favicon: string
  ogImage: string
  author: {
    name: string
    url: string
    email?: string
  }
  social?: Record<string, string>
  keywords?: string[]
  footerDescription?: string
  footerDescription2?: string
  footerDescriptionI18n?: Record<string, { footerDescription?: string; footerDescription2?: string }>
}

export interface SiteConfigSite {
  /** 对应后台 gb_sites.id，用于行为数据上报 */
  siteId: number
  hostname: string
  mainSiteUrl?: string
  jumpDomain: string
  defaultLocale: string
  supportedLocales: string[]
}

export interface SiteConfigTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  colorScheme: 'purple' | 'blue' | 'green' | 'orange' | 'custom'
  darkMode: boolean
  borderRadius: string
}

export interface SiteConfigNavItem {
  path: string
  i18nKey: string
  label: string
  enabled: boolean
  inSitemap: boolean
}

export interface SiteConfigNavigation {
  header: SiteConfigNavItem[]
}

export interface SiteConfigFeatures {
  search?: boolean
  darkMode?: boolean
  comments?: boolean
  analytics?: boolean
  i18n?: boolean
  rss?: boolean
  [key: string]: boolean | undefined
}

export interface SiteConfigIntegrations {
  googleAnalyticsId?: string
  clarityId?: string
  customHeadScript?: string
  customBodyScript?: string
}

export interface SiteVerificationConfig {
  google?: string
  yandex?: string
  yahoo?: string
  other?: Record<string, string>
}

export interface SiteConfigFile {
  branding: SiteConfigBranding
  site: SiteConfigSite
  theme: SiteConfigTheme
  navigation: SiteConfigNavigation
  features: SiteConfigFeatures
  integrations: SiteConfigIntegrations
  verification?: SiteVerificationConfig
}