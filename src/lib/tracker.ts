/**
 * 客户端行为埋点工具
 *
 * 所有数据经 /api/track/* Next.js API 层中转，
 * 服务端负责拼接敏感信息（UA、IP、Referer、Cookie）后再转发后端。
 *
 * 设置 NEXT_PUBLIC_TRACK_DISABLED=true 可禁用所有埋点（开发环境用）。
 */

const trackDisabled = typeof window !== 'undefined'
  && process.env.NEXT_PUBLIC_TRACK_DISABLED === 'true'

export interface TrackContext {
  pageType: string
  contentSlug?: string | null
  locale?: string
  pagePath?: string
  viewportWidth?: number
  pageUrl?: string
}

/** 从 User-Agent 判断设备类型 */
export function parseUaCategory(ua: string | null): string {
  if (!ua) return 'unknown'
  const lower = ua.toLowerCase()
  if (/tablet|ipad/.test(lower)) return 'tablet'
  if (/mobile|android|iphone|ipod/.test(lower)) return 'mobile'
  return 'desktop'
}

/** 从 Referer URL 解析流量来源信息 */
export function parseReferrer(referrer: string | null, siteHost?: string | null): {
  referrerType: string
  referrerEngine: string | null
  searchKeyword: string | null
} {
  if (!referrer) {
    return { referrerType: 'direct', referrerEngine: null, searchKeyword: null }
  }

  let url: URL
  try {
    url = new URL(referrer)
  } catch {
    return { referrerType: 'referral', referrerEngine: null, searchKeyword: null }
  }

  const hostname = url.hostname.toLowerCase()

  const engines: { pattern: RegExp; name: string; kwParam: string }[] = [
    { pattern: /google\./, name: 'google', kwParam: 'q' },
    { pattern: /baidu\.com/, name: 'baidu', kwParam: 'wd' },
    { pattern: /bing\.com/, name: 'bing', kwParam: 'q' },
    { pattern: /so\.com|360\.cn/, name: '360', kwParam: 'q' },
    { pattern: /sogou\.com/, name: 'sogou', kwParam: 'query' },
  ]

  for (const engine of engines) {
    if (engine.pattern.test(hostname)) {
      const keyword = url.searchParams.get(engine.kwParam) || null
      return {
        referrerType: 'organic',
        referrerEngine: engine.name,
        searchKeyword: keyword ? keyword.slice(0, 200) : null,
      }
    }
  }

  /** 判断是否为站内跳转（同域名或子域名） */
  if (siteHost) {
    const host = siteHost.replace(/:\d+$/, '').toLowerCase()
    if (hostname === host || hostname.endsWith('.' + host)) {
      return { referrerType: 'internal', referrerEngine: null, searchKeyword: null }
    }
  }

  return { referrerType: 'referral', referrerEngine: null, searchKeyword: null }
}

/** 从 pageUrl 解析 UTM 参数 */
export function parseUtm(pageUrl: string | null | undefined): {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
} {
  if (!pageUrl) return { utmSource: null, utmMedium: null, utmCampaign: null }
  try {
    const url = new URL(pageUrl)
    return {
      utmSource: url.searchParams.get('utm_source'),
      utmMedium: url.searchParams.get('utm_medium'),
      utmCampaign: url.searchParams.get('utm_campaign'),
    }
  } catch {
    return { utmSource: null, utmMedium: null, utmCampaign: null }
  }
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
  if (trackDisabled) return
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
  if (trackDisabled) return
  try {
    const uaCategory = parseUaCategory(typeof navigator !== 'undefined' ? navigator.userAgent : null)
    sendBeaconPost('/api/track/event', {
      eventType: 'outbound_click',
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? null,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      targetUrl,
      uaCategory,
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
  if (trackDisabled) return
  try {
    const uaCategory = parseUaCategory(typeof navigator !== 'undefined' ? navigator.userAgent : null)
    sendBeaconPost('/api/track/event', {
      eventType: 'scroll_milestone',
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? null,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      scrollDepth: depth,
      uaCategory,
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
  if (trackDisabled) return
  try {
    const uaCategory = parseUaCategory(typeof navigator !== 'undefined' ? navigator.userAgent : null)
    sendBeaconPost('/api/track/event', {
      eventType: 'page_leave',
      pageType: ctx.pageType,
      pagePath: ctx.pagePath ?? null,
      contentSlug: ctx.contentSlug ?? null,
      locale: ctx.locale ?? null,
      timeOnPage: Math.min(Math.round(seconds), 3599),
      uaCategory,
    })
  } catch {
    // 静默失败
  }
}
