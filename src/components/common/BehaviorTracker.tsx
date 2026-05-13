'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  resolvePageMeta,
  trackPV,
  trackScrollMilestone,
  trackPageLeave,
} from '@/lib/tracker'

/**
 * 自动行为埋点组件
 *
 * - 路由变化时上报 PV
 * - 监听滚动深度里程碑（25 / 50 / 75 / 100%）
 * - 页面离开时上报停留时长（visibilitychange + pagehide）
 */
export function BehaviorTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const enterTimeRef = useRef<number>(Date.now())
  const reportedDepthsRef = useRef<Set<number>>(new Set())

  // ── PV 上报 ──────────────────────────────────────────────────
  useEffect(() => {
    const locale = pathname.match(/^\/(zh-TW|zh-CN|en-US)(\/|$)/)?.[1] ?? 'zh-CN'
    const ctx = resolvePageMeta(pathname)

    trackPV({
      ...ctx,
      locale,
      pagePath: pathname,
      viewportWidth: window.innerWidth,
      pageUrl: window.location.href,
    })

    enterTimeRef.current = Date.now()
    reportedDepthsRef.current = new Set()
  }, [pathname, searchParams])

  // ── 滚动深度 + 页面离开 ───────────────────────────────────────
  useEffect(() => {
    const locale = pathname.match(/^\/(zh-TW|zh-CN|en-US)(\/|$)/)?.[1] ?? 'zh-CN'
    const ctx = resolvePageMeta(pathname)
    const baseCtx = { pageType: ctx.pageType, contentSlug: ctx.contentSlug, locale, pagePath: pathname }

    const milestones: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100]

    function getScrollPercent(): number {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return 100
      return Math.min(100, Math.round((window.scrollY / docHeight) * 100))
    }

    function onScroll() {
      const pct = getScrollPercent()
      for (const m of milestones) {
        if (pct >= m && !reportedDepthsRef.current.has(m)) {
          reportedDepthsRef.current.add(m)
          trackScrollMilestone(m, baseCtx)
        }
      }
    }

    function reportLeave() {
      const seconds = (Date.now() - enterTimeRef.current) / 1000
      if (seconds >= 1) {
        trackPageLeave(seconds, baseCtx)
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        reportLeave()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', reportLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', reportLeave)
    }
  }, [pathname, searchParams])

  return null
}
