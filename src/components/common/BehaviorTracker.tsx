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
 * - 路由变化时：先上报旧页面离开，再上报新页面 PV
 * - 监听滚动深度里程碑（25 / 50 / 75 / 100%）
 * - 切走 tab 时上报停留时长，切回 tab 时视为新浏览（重置计时 + 新 PV）
 * - 关闭页面时上报停留时长（pagehide）
 */
export function BehaviorTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const enterTimeRef = useRef<number>(Date.now())
  const reportedDepthsRef = useRef<Set<number>>(new Set())
  const hasReportedLeaveRef = useRef(false)

  // 保存当前页面的上下文，供 cleanup 时上报旧页面离开使用
  const currentCtxRef = useRef<{
    pageType: string
    contentSlug: string | null
    locale: string
    pagePath: string
  } | null>(null)

  // ── 路由变化：先报旧页面离开，再报新页面 PV ──────────────────
  useEffect(() => {
    const locale = pathname.match(/^\/(zh-TW|zh-CN|en-US)(\/|$)/)?.[1] ?? 'zh-CN'
    const ctx = resolvePageMeta(pathname)
    const baseCtx = { pageType: ctx.pageType, contentSlug: ctx.contentSlug ?? null, locale, pagePath: pathname }

    // cleanup：路由即将切换，上报旧页面的离开事件
    return () => {
      if (!hasReportedLeaveRef.current) {
        const seconds = (Date.now() - enterTimeRef.current) / 1000
        if (seconds >= 1) {
          trackPageLeave(seconds, currentCtxRef.current || baseCtx)
        }
      }
    }
  }, [pathname, searchParams])

  // ── PV 上报 ──────────────────────────────────────────────────
  useEffect(() => {
    const locale = pathname.match(/^\/(zh-TW|zh-CN|en-US)(\/|$)/)?.[1] ?? 'zh-CN'
    const ctx = resolvePageMeta(pathname)
    const baseCtx = { pageType: ctx.pageType, contentSlug: ctx.contentSlug ?? null, locale, pagePath: pathname }

    trackPV({
      ...ctx,
      locale,
      pagePath: pathname,
      viewportWidth: window.innerWidth,
      pageUrl: window.location.href,
    })

    // 重置状态
    enterTimeRef.current = Date.now()
    reportedDepthsRef.current = new Set()
    hasReportedLeaveRef.current = false
    currentCtxRef.current = baseCtx
  }, [pathname, searchParams])

  // ── 滚动深度 + tab 切换离开 ───────────────────────────────────────
  useEffect(() => {
    const locale = pathname.match(/^\/(zh-TW|zh-CN|en-US)(\/|$)/)?.[1] ?? 'zh-CN'
    const ctx = resolvePageMeta(pathname)
    const baseCtx = { pageType: ctx.pageType, contentSlug: ctx.contentSlug ?? null, locale, pagePath: pathname }

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
      if (hasReportedLeaveRef.current) return
      const seconds = (Date.now() - enterTimeRef.current) / 1000
      if (seconds >= 1) {
        hasReportedLeaveRef.current = true
        trackPageLeave(seconds, currentCtxRef.current || baseCtx)
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        reportLeave()
      } else if (document.visibilityState === 'visible') {
        // 用户切回页面，视为新的浏览：重置计时器、上报新 PV、允许再次离开上报
        enterTimeRef.current = Date.now()
        hasReportedLeaveRef.current = false
        reportedDepthsRef.current = new Set()
        trackPV({ ...baseCtx, viewportWidth: window.innerWidth, pageUrl: window.location.href })
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