/**
 * 客户端行为埋点工具
 *
 * 所有数据经 /api/track/* Next.js API 层中转，
 * 服务端负责拼接敏感信息（UA、IP、Referer、Cookie）后再转发后端。
 */

export interface TrackContext {
  pageType: string
  contentSlug?: string | null
  locale?: string
  pagePath?: string
  viewportWidth?: number
  pageUrl?: string
}

/** 从 pathname 推断 pageType 和 contentSlug */
export function resolvePageMeta(pathname: string): TrackContext {
  // 去除 locale 前缀 /zh-TW/xxx -> /xxx
  const clean = pathname.replace(/^\/(zh-TW|zh-CN|en-US)(\/|$)/, '/')

  if (clean === '/' || clean === '') {
    return { pageType: 'home', contentSlug: null, pagePath: clean }
  }

  // /content/guides/[slug]
  const guideMatch = clean.match(/^\/content\/guides\/([^/?]+)/)
  if (guideMatch) return { pageType: 'guide', contentSlug: guideMatch[1], pagePath: clean }

  // /content/reviews/[slug]
  const reviewMatch = clean.match(/^\/content\/reviews\/([^/?]+)/)
  if (reviewMatch) return { pageType: 'review', contentSlug: reviewMatch[1], pagePath: clean }

  // /content（列表）
  if (clean.startsWith('/content')) return { pageType: 'content_list', contentSlug: null, pagePath: clean }

  // /news/[slug]
  const newsMatch = clean.match(/^\/news\/([^/?]+)/)
  if (newsMatch) return { pageType: 'news', contentSlug: newsMatch[1], pagePath: clean }

  // /games/[slug]
  const gameMatch = clean.match(/^\/games\/([^/?]+)/)
  if (gameMatch) return { pageType: 'game', contentSlug: gameMatch[1], pagePath: clean }
  if (clean.startsWith('/games')) return { pageType: 'games_list', contentSlug: null, pagePath: clean }

  // /boxes/[slug]
  const boxMatch = clean.match(/^\/boxes\/([^/?]+)/)
  if (boxMatch) return { pageType: 'box', contentSlug: boxMatch[1], pagePath: clean }
  if (clean.startsWith('/boxes')) return { pageType: 'boxes_list', contentSlug: null, pagePath: clean }

  // /topics/[slug]
  const topicMatch = clean.match(/^\/topics\/([^/?]+)/)
  if (topicMatch) return { pageType: 'topic', contentSlug: topicMatch[1], pagePath: clean }

  // /rank
  if (clean.startsWith('/rank')) return { pageType: 'rank', contentSlug: null, pagePath: clean }

  // /01zhe
  if (clean.startsWith('/01zhe')) return { pageType: 'discount', contentSlug: null, pagePath: clean }

  // /search
  if (clean.startsWith('/search')) return { pageType: 'search', contentSlug: null, pagePath: clean }

  return { pageType: 'other', contentSlug: null, pagePath: clean }
}

function sendBeaconPost(url: string, data: Record<string, unknown>): void {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, blob)
  } else {
    fetch(url, { method: 'POST', body: blob, keepalive: true }).catch(() => {})
  }
}

/** 上报 PV */
export function trackPV(ctx: TrackContext): void {
  try {
    sendBeaconPost('/api/track/pv', {
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? window.location.pathname,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      viewportWidth: ctx.viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : null),
      pageUrl: ctx.pageUrl ?? (typeof window !== 'undefined' ? window.location.href : null),
    })
  } catch {
    // 静默失败
  }
}

/** 上报外链点击 */
export function trackOutboundClick(
  targetUrl: string,
  ctx: Omit<TrackContext, 'viewportWidth' | 'pageUrl'>
): void {
  try {
    sendBeaconPost('/api/track/event', {
      eventType: 'outbound_click',
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? null,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      targetUrl,
    })
  } catch {
    // 静默失败
  }
}

/** 上报滚动里程碑 */
export function trackScrollMilestone(
  depth: 25 | 50 | 75 | 100,
  ctx: Omit<TrackContext, 'viewportWidth' | 'pageUrl'>
): void {
  try {
    sendBeaconPost('/api/track/event', {
      eventType: 'scroll_milestone',
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? null,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      scrollDepth: depth,
    })
  } catch {
    // 静默失败
  }
}

/** 上报页面离开（带停留时长） */
export function trackPageLeave(
  seconds: number,
  ctx: Omit<TrackContext, 'viewportWidth' | 'pageUrl'>
): void {
  try {
    sendBeaconPost('/api/track/event', {
      eventType: 'page_leave',
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? null,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      timeOnPage: Math.min(Math.round(seconds), 3599),
    })
  } catch {
    // 静默失败
  }
}
