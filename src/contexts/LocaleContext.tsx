'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Locale, LocaleConfig } from '@/config/types'
import { locales, defaultLocale, getLocaleFromPath } from '@/config/site/locales'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  localeConfig: LocaleConfig
  availableLocales: Locale[] | null
  setAvailableLocales: (locales: Locale[] | null) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  // 从URL路径获取当前语言
  const [locale, setLocaleState] = useState<Locale>(() => getLocaleFromPath(pathname))
  const [availableLocales, setAvailableLocales] = useState<Locale[] | null>(null)
  const prevPathname = useRef(pathname)

  // 监听路由变化，更新语言
  useEffect(() => {
    // 只有当路径真正发生变化时才更新语言状态
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      
      const newLocale = getLocaleFromPath(pathname)
      setLocaleState(newLocale)
      // 注意：不再此处自动重置 availableLocales (setAvailableLocales(null))
      // 因为父组件的 Effect 会在子组件 Effect 之后执行，会导致子组件刚刚设置的语言限制被重置为空
      // 正确的做法是由具体页面组件（如 ArticleLayout）在卸载时负责恢复状态
      document.documentElement.lang = newLocale
    }
  }, [pathname])

  const setLocale = (newLocale: Locale) => {
    if (availableLocales && !availableLocales.includes(newLocale)) {
      return
    }

    // 获取当前路径（去除语言前缀）
    let cleanPath = pathname
    
    // 移除旧的语言前缀
    if (pathname.startsWith('/zh-TW/') || pathname === '/zh-TW') {
      cleanPath = pathname.slice(6) || '/'  // 去除 '/zh-TW'
    } else if (pathname.startsWith('/en-US/') || pathname === '/en-US') {
      cleanPath = pathname.slice(6) || '/'   // 去除 '/en-US'
    }
    
    // 确保路径以 / 开头
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath
    }
    
    // 如果切换到默认语言（zh-CN）
    if (newLocale === defaultLocale) {
      // 如果当前已经是默认语言，不做任何操作
      if (locale === defaultLocale) return
      router.push(cleanPath)
      return
    }
    
    // 如果切换到其他语言
    const newPath = `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`
    
    // 导航到新URL
    router.push(newPath)
  }

  const t = (key: string): string => {
    const localeConfig = locales[locale]
    return localeConfig.translations[key] || key
  }

  const value: LocaleContextType = {
    locale,
    setLocale,
    t,
    localeConfig: locales[locale],
    availableLocales,
    setAvailableLocales,
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
