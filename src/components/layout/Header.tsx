'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocale } from '@/contexts/LocaleContext'
import { defaultLocale } from '@/config/site/locales'

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslation()
  const { locale } = useLocale()

  // 根据当前语言生成URL
  const getLocalizedUrl = (path: string) => {
    if (locale === defaultLocale) {
      return path
    }
    return `/${locale}${path}`
  }

  // 使用多语言配置的导航项
  const navItems = [
    { id: '/games', label: t('games') },
    { id: '/boxes', label: t('boxes') },
    { id: '/content', label: t('content') },
    { id: '/news', label: t('news') },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const searchUrl = getLocalizedUrl(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      router.push(searchUrl)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  const isActive = (path: string) => {
    // 移除语言前缀来比较路径
    let cleanPathname = pathname
    if (pathname.startsWith('/zh-TW/')) {
      cleanPathname = pathname.slice(6)
    } else if (pathname.startsWith('/en-US/')) {
      cleanPathname = pathname.slice(7)
    }
    
    if (path === '/') return cleanPathname === '/' || cleanPathname === ''
    return cleanPathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link 
          href={getLocalizedUrl('/')}
          className="mr-8 flex items-center gap-2 font-bold text-xl text-white"
        >
          <Image src="/logo.png" alt={t('siteName')} width={32} height={32} className="rounded" />
          <span>{t('siteName')}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={getLocalizedUrl(item.id)}
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                color: isActive(item.id) ? '#60a5fa' : '#94a3b8',
                background: isActive(item.id) ? 'rgba(96,165,250,0.12)' : 'transparent',
                fontWeight: isActive(item.id) ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder={t('search') + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 bg-slate-900 border-slate-800 text-slate-100 focus-visible:ring-blue-500"
            />
          </form>

          {/* Search - Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950 border-slate-800 text-slate-100">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={getLocalizedUrl(item.id)}
                    className="text-lg font-medium text-left px-4 py-3 rounded-lg transition-all duration-200"
                    style={{
                      color: isActive(item.id) ? '#60a5fa' : '#94a3b8',
                      background: isActive(item.id) ? 'rgba(96,165,250,0.12)' : 'transparent',
                      fontWeight: isActive(item.id) ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-slate-800 p-4 bg-slate-950">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder={t('search') + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  )
}