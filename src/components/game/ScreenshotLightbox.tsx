'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

interface ScreenshotLightboxProps {
  urls: string[]
  gameName: string
}

export default function ScreenshotLightbox({ urls, gameName }: ScreenshotLightboxProps) {
  const { locale } = useLocale()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const close = () => setActiveIndex(null)

  const prev = useCallback(() => {
    setActiveIndex(i => (i === null ? null : (i - 1 + urls.length) % urls.length))
  }, [urls.length])

  const next = useCallback(() => {
    setActiveIndex(i => (i === null ? null : (i + 1) % urls.length))
  }, [urls.length])

  useEffect(() => {
    if (activeIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIndex, prev, next])

  // 锁定背景滚动
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeIndex])

  return (
    <>
      {/* 缩略图横向滚动列表 */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {urls.slice(0, 10).map((url, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="flex-shrink-0 h-52 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 cursor-pointer hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label={locale === 'en-US' ? `View ${gameName} screenshot ${i + 1}` : locale === 'zh-TW' ? `查看 ${gameName} 截圖 ${i + 1}` : `查看 ${gameName} 截图 ${i + 1}`}
          >
            <img
              src={url}
              alt={locale === 'en-US' ? `${gameName} screenshot ${i + 1}` : locale === 'zh-TW' ? `${gameName} 截圖 ${i + 1}` : `${gameName} 截图 ${i + 1}`}
              className="h-full w-auto object-contain"
            />
          </button>
        ))}
      </div>

      {/* Lightbox 遮罩 */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* 图片容器，阻止冒泡避免点图片就关闭 */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={urls[activeIndex]}
              alt={locale === 'en-US' ? `${gameName} screenshot ${activeIndex + 1}` : locale === 'zh-TW' ? `${gameName} 截圖 ${activeIndex + 1}` : `${gameName} 截图 ${activeIndex + 1}`}
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            />

            {/* 计数 */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
              {activeIndex + 1} / {Math.min(urls.length, 10)}
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label={locale === 'en-US' ? 'Close' : locale === 'zh-TW' ? '關閉' : '关闭'}
          >
            <X className="h-6 w-6" />
          </button>

          {/* 左右切换（多于1张时显示） */}
          {urls.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={locale === 'en-US' ? 'Previous' : locale === 'zh-TW' ? '上一張' : '上一张'}
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={locale === 'en-US' ? 'Next' : locale === 'zh-TW' ? '下一張' : '下一张'}
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
