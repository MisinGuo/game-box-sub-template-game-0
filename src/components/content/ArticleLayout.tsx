'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, Clock, BookOpen, PanelRightClose, PanelRightOpen, List, Pin, PinOff, GripHorizontal } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { defaultLocale } from '@/config/site/locales'
import { articleLayoutTranslations, getT } from '@/i18n/page-translations'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import MarkdownRenderer from './MarkdownRenderer'
import { DownloadBox, BackToListButton } from './DownloadBox'
import type { ModuleConfig } from '@/config'
import type { Locale } from '@/config/types'

interface ArticleFrontmatter {
  title: string
  date?: string
  category?: string
  tags?: string[]
  [key: string]: any
}

interface ArticleLayoutProps {
  config: ModuleConfig
  frontmatter: ArticleFrontmatter
  content: string
  readingTime: number
  toc?: { level: number; text: string; id: string }[]
  gameName?: string
  availableLocales?: Locale[]
  breadcrumbCategoryHref?: string
}

/**
 * 通用文章布局组件
 * 根据模块配置动态渲染不同的布局和组件
 */
export function ArticleLayout({
  config,
  frontmatter,
  content,
  readingTime,
  toc = [],
  gameName,
  availableLocales,
  breadcrumbCategoryHref,
}: ArticleLayoutProps) {
  const { theme, articleDetail, sidebar, downloadEntry } = config

  const { locale, setAvailableLocales } = useLocale()
  const lp = (path: string) => locale === defaultLocale ? path : `/${locale}${path}`
  const moduleTitle = locale === 'en-US'
    ? (config.type === 'news' ? 'News' : 'Content Center')
    : locale === 'zh-TW'
    ? (config.type === 'news' ? '資訊速報' : '內容中心')
    : config.title
  const moduleBadgeText = locale === 'en-US'
    ? (config.type === 'news' ? 'News' : 'Content')
    : locale === 'zh-TW'
    ? (config.type === 'news' ? '資訊' : '內容')
    : theme.badgeText
  const al18n: Record<string, Record<string, string>> = {
    'zh-CN': {
      home: '首页', readingTime: '阅读约 {n} 分钟', toc: '目录', closeToc: '关闭目录', openToc: '打开目录',
      relatedTitle: '相关', moreContent: '更多精彩内容即将上线...',
      autoClose: '自动关闭', keepOpen: '保持打开', autoCloseHint: '点击后自动关闭', keepOpenHint: '点击后保持打开',
      downloadBox: '下载游戏盒子', downloadNow: '立即下载', priceLabel: '0.1折 起下载',
    },
    'zh-TW': {
      home: '首頁', readingTime: '閱讀約 {n} 分鐘', toc: '目錄', closeToc: '關閉目錄', openToc: '打開目錄',
      relatedTitle: '相關', moreContent: '更多精彩內容即將上線...',
      autoClose: '自動關閉', keepOpen: '保持打開', autoCloseHint: '點擊後自動關閉', keepOpenHint: '點擊後保持打開',
      downloadBox: '下載遊戲盒子', downloadNow: '立即下載', priceLabel: '0.1折 起下載',
    },
    'en-US': {
      home: 'Home', readingTime: '{n} min read', toc: 'Contents', closeToc: 'Close TOC', openToc: 'Open TOC',
      relatedTitle: 'Related', moreContent: 'More content coming soon...',
      autoClose: 'Auto-close', keepOpen: 'Keep open', autoCloseHint: 'Close on click', keepOpenHint: 'Stay open on click',
      downloadBox: 'Download Game Box', downloadNow: 'Download Now', priceLabel: 'Up to 90% OFF',
    },
  }
  const at = al18n[locale] || al18n['zh-CN']

  useEffect(() => {
    // 页面挂载时：设置可用的语言列表
    setAvailableLocales(availableLocales && availableLocales.length > 0 ? availableLocales : null)
  }, [availableLocales, setAvailableLocales])

  // 清除副作用：当组件卸载(离开页面)时，恢复为全语言状态
  // 这个清理函数对于保证"非文章页"不展示限制非常重要
  // 这也是 LocaleContext 不再自动重置后所必需的逻辑补充
  useEffect(() => {
    return () => {
      setAvailableLocales(null)
    }
  }, [setAvailableLocales])

  // 侧边栏显示状态（桌面端）
  const [sidebarVisible, setSidebarVisible] = useState(true)
  // 移动端目录抽屉状态
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  // 移动端目录高度（可拖动调整）
  const [sheetHeight, setSheetHeight] = useState(50) // 百分比
  // 点击后是否自动关闭
  const [autoClose, setAutoClose] = useState(true)
  // 当前活跃的章节 ID
  const [activeId, setActiveId] = useState<string>('')
  // 拖动状态
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(50)

  // 监听滚动，更新当前活跃章节
  useEffect(() => {
    if (toc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    // 观察所有标题元素
    toc.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [toc])

  // 处理拖动开始
  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true
    startHeight.current = sheetHeight
    if ('touches' in e) {
      startY.current = e.touches[0].clientY
    } else {
      startY.current = e.clientY
    }
  }, [sheetHeight])

  // 处理拖动移动
  useEffect(() => {
    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging.current) return
      
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const deltaY = startY.current - clientY
      const deltaPercent = (deltaY / window.innerHeight) * 100
      const newHeight = Math.min(85, Math.max(25, startHeight.current + deltaPercent))
      setSheetHeight(newHeight)
    }

    const handleEnd = () => {
      isDragging.current = false
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [])

  // 清理标题
  const cleanTitle = frontmatter.title
    .replace(/[?？]/g, ' - ')
    .split(/[,，;；]/)[0]
    .trim()

  // 判断是否应该显示侧边栏
  const showSidebar = sidebar.enabled && sidebarVisible

  return (
    <div className="bg-slate-950 min-h-screen pb-20 md:pb-0">
      {/* Breadcrumbs */}
      {articleDetail.showBreadcrumb && (
        <nav className="bg-slate-900 border-b border-slate-800 py-3" aria-label="Breadcrumb">
          <div className="container mx-auto px-4 flex items-center text-sm text-slate-400 flex-wrap gap-1">
            <Link href={lp('/')} className="hover:text-white">{at.home}</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={lp(config.routePrefix)} className="hover:text-white">{moduleTitle}</Link>
            {frontmatter.category && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                {breadcrumbCategoryHref ? (
                  <Link href={breadcrumbCategoryHref} className="hover:text-white">
                    {frontmatter.category}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{frontmatter.category}</span>
                )}
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-white font-medium line-clamp-1 max-w-[200px] sm:max-w-xs" title={cleanTitle}>{cleanTitle}</span>
          </div>
        </nav>
      )}

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <article className={`transition-all duration-300 ${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex gap-2 mb-4 flex-wrap">
              <Badge variant="secondary" className={theme.badgeColor}>
                <BookOpen className="h-3 w-3 mr-1" />
                {moduleBadgeText}
              </Badge>
              {frontmatter.category && (
                <Badge variant="outline" className="text-slate-400 border-slate-700">
                  {frontmatter.category}
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {cleanTitle}
            </h1>
            
            {articleDetail.showMeta && (
              <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                {frontmatter.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {frontmatter.date}
                  </span>
                )}
                {articleDetail.showTOC && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {at.readingTime.replace('{n}', String(readingTime))}
                  </span>
                )}
              </div>
            )}
          </header>

          <Separator className="my-6 bg-slate-800" />

          {/* Download Entry - In Content */}
          {downloadEntry.enabled && (downloadEntry.position === 'all' || downloadEntry.position === 'header') && (
            <DownloadBox config={config} gameName={gameName} />
          )}

          {/* Article Body */}
          <MarkdownRenderer content={content} />

          <Separator className="my-8 bg-slate-800" />

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <BackToListButton config={config} />
            
            {downloadEntry.enabled && (
              <Link 
                href={lp(downloadEntry.buttonLink)}
                className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg transition-all text-sm"
              >
                {at.downloadBox}
              </Link>
            )}
          </div>
        </article>

        {/* Sidebar */}
        {sidebar.enabled && (
          <aside className={`hidden lg:block lg:col-span-4 transition-all duration-300 ${sidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
            <div className="sticky top-24 space-y-6">
              {/* TOC */}
              {sidebar.showTOC && toc.length > 0 && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white">{at.toc}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarVisible(false)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                        title={at.closeToc}
                      >
                        <PanelRightClose className="h-4 w-4" />
                      </Button>
                    </div>
                    <nav className="space-y-2">
                      {toc.map((item, index) => (
                        <a 
                          key={index}
                          href={`#${item.id}`}
                          className={`block text-sm transition-colors ${
                            item.level === 3 ? 'pl-4' : ''
                          } ${
                            activeId === item.id 
                              ? 'text-orange-400 font-medium border-l-2 border-orange-400 pl-2' 
                              : 'text-slate-400 hover:text-orange-400'
                          }`}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              )}

              {/* Download Box in Sidebar */}
              {sidebar.showDownload && (
                <DownloadBox config={config} gameName={gameName} />
              )}

              {/* Related Articles Placeholder */}
              {sidebar.showRelated && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-white mb-4">{at.relatedTitle} · {moduleTitle}</h3>
                    <p className="text-sm text-slate-500">{at.moreContent}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        )}

        {/* 浮动按钮 - 打开目录 */}
        {sidebar.enabled && sidebar.showTOC && toc.length > 0 && !sidebarVisible && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarVisible(true)}
            className="hidden lg:flex fixed right-6 top-28 z-50 bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 shadow-lg"
            title={at.openToc}
          >
            <PanelRightOpen className="h-4 w-4 mr-2" />
            {at.toc}
          </Button>
        )}
      </div>

      {/* Mobile TOC Button & Sheet */}
      {sidebar.enabled && sidebar.showTOC && toc.length > 0 && (
        <Sheet open={mobileTocOpen} onOpenChange={setMobileTocOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden fixed z-50 bottom-6 right-4 bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 shadow-lg"
            >
              <List className="h-4 w-4 mr-2" />
              {at.toc}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="bg-slate-900 border-slate-800 px-6 flex flex-col"
            style={{ height: `${sheetHeight}vh` }}
          >
            {/* 拖动手柄 */}
            <div 
              className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center cursor-ns-resize touch-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <GripHorizontal className="h-5 w-5 text-slate-600" />
            </div>
            
            <SheetHeader className="mt-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white text-left">{at.toc}</SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoClose(!autoClose)}
                  className={`h-8 px-2 text-xs ${autoClose ? 'text-orange-400' : 'text-slate-400'} hover:text-white hover:bg-slate-800`}
                  title={autoClose ? at.autoCloseHint : at.keepOpenHint}
                >
                  {autoClose ? <Pin className="h-3 w-3 mr-1" /> : <PinOff className="h-3 w-3 mr-1" />}
                  {autoClose ? at.autoClose : at.keepOpen}
                </Button>
              </div>
            </SheetHeader>
            <nav className="mt-4 space-y-3 overflow-y-auto flex-1 pb-4 px-2">
              {toc.map((item, index) => (
                <a 
                  key={index}
                  href={`#${item.id}`}
                  onClick={() => autoClose && setMobileTocOpen(false)}
                  className={`block text-sm transition-colors py-1 ${
                    item.level === 3 ? 'pl-4' : ''
                  } ${
                    activeId === item.id 
                      ? 'text-orange-400 font-medium border-l-2 border-orange-400 pl-2' 
                      : 'text-slate-300 hover:text-orange-400 active:text-orange-500'
                  } ${item.level === 3 && activeId !== item.id ? 'text-slate-400' : ''}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
