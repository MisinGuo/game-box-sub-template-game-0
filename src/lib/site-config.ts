import rawConfig from '@/config/customize/site'
import type { SiteConfigTheme } from '@/config/types/site'

export const siteConfigFile = rawConfig

export const siteTheme: SiteConfigTheme = siteConfigFile.theme

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

export function buildThemeCSSVars(theme: SiteConfigTheme): React.CSSProperties {
  return {
    '--color-primary': theme.primaryColor,
    '--color-primary-rgb': hexToRgb(theme.primaryColor),
    '--color-secondary': theme.secondaryColor,
    '--color-secondary-rgb': hexToRgb(theme.secondaryColor),
    '--color-accent': theme.accentColor,
    '--radius': theme.borderRadius,
  } as React.CSSProperties
}

export function getLocalizedSiteName(locale: string): string {
  return siteConfigFile.branding.siteNameI18n?.[locale] || siteConfigFile.branding.siteName
}

export function getLocalizedFooterCopy(locale: string): { footerDescription: string; footerDescription2: string } {
  const localized = siteConfigFile.branding.footerDescriptionI18n?.[locale]

  return {
    footerDescription:
      localized?.footerDescription ||
      siteConfigFile.branding.footerDescription ||
      siteConfigFile.branding.description,
    footerDescription2:
      localized?.footerDescription2 ||
      siteConfigFile.branding.footerDescription2 ||
      '',
  }
}