import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, randomUUID } from 'crypto'
import siteConfig from '@/config/customize/site'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_ID = siteConfig.site.siteId

/** 从 Referer header 解析流量来源信息 */
function parseReferrer(referer: string | null): {
  referrerType: string
  referrerEngine: string | null
  searchKeyword: string | null
} {
  if (!referer) {
    return { referrerType: 'direct', referrerEngine: null, searchKeyword: null }
  }

  let url: URL
  try {
    url = new URL(referer)
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

  return { referrerType: 'referral', referrerEngine: null, searchKeyword: null }
}

/** 从 User-Agent 判断设备类型 */
function parseUaCategory(ua: string | null): string {
  if (!ua) return 'unknown'
  const lower = ua.toLowerCase()
  if (/tablet|ipad/.test(lower)) return 'tablet'
  if (/mobile|android|iphone|ipod/.test(lower)) return 'mobile'
  return 'desktop'
}

/** 解析前端 IP：CF Workers 直连来源 IP（nginx 设置的 X-Real-IP = $remote_addr）
 *  - 有 CF 橙云时：CF 节点 IP（非用户 IP）
 *  - 无 CF 时：用户真实 IP（与后端 IP 相同）
 *  仅用于调试，不可用于地理定位
 */
function resolveFrontendIp(req: NextRequest): string | null {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim() || null
  return null
}

/** 解析后端 IP：VPS nginx 在 X-Real-Visitor-IP 中写入的真实用户 IP（可靠），无则降级用前端 IP */
function resolveBackendIp(req: NextRequest, frontendIp: string | null): string | null {
  const realVisitorIp = req.headers.get('x-real-visitor-ip')
  if (realVisitorIp) return realVisitorIp.split(',')[0].trim() || null
  return frontendIp
}

/** 获取或创建匿名 session_id（SHA-256 散列后存 Cookie） */
async function getSessionId(req: NextRequest): Promise<{ sessionId: string; isNew: boolean }> {
  const cookieStore = cookies()
  const existing = cookieStore.get('_sb_sid')?.value
  if (existing) return { sessionId: existing, isNew: false }

  const raw = randomUUID()
  const hashed = createHash('sha256').update(raw).digest('hex')
  return { sessionId: hashed, isNew: true }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, isNew } = await getSessionId(req)

    const referer = req.headers.get('referer')
    const ua = req.headers.get('user-agent')
    const countryCode = req.headers.get('cf-ipcountry') || null
    // 前端 IP：CF Workers 直连来源 IP（X-Real-IP = $remote_addr，有 CF 时是 CF 节点 IP）
    // 后端 IP：VPS nginx 在 X-Real-Visitor-IP 中写入的真实用户 IP（可靠），无则降级用前端 IP
    const ipFrontend = resolveFrontendIp(req)
    const ipBackend = resolveBackendIp(req, ipFrontend)

    const { referrerType, referrerEngine, searchKeyword } = parseReferrer(referer)
    const uaCategory = parseUaCategory(ua)

    let utmSource: string | null = null
    let utmMedium: string | null = null
    let utmCampaign: string | null = null
    if (body.pageUrl) {
      try {
        const pageUrl = new URL(body.pageUrl)
        utmSource = pageUrl.searchParams.get('utm_source')
        utmMedium = pageUrl.searchParams.get('utm_medium')
        utmCampaign = pageUrl.searchParams.get('utm_campaign')
      } catch {
        // 忽略无效 URL
      }
    }

    const payload = {
      siteId: SITE_ID,
      sessionId,
      pageType: body.pageType || null,
      pagePath: body.pagePath || null,
      contentSlug: body.contentSlug || null,
      locale: body.locale || null,
      referrerType,
      referrerEngine,
      searchKeyword,
      utmSource,
      utmMedium,
      utmCampaign,
      uaCategory,
      countryCode,
      ipAddressFrontend: ipFrontend,
      ipAddressBackend: ipBackend,
      viewportWidth: body.viewportWidth || null,
    }

    if (!payload.siteId) {
      return new NextResponse(null, { status: 204 })
    }

    const backendRes = await fetch(`${BACKEND_URL}/track/pv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 转发代理头，让 Java 后端能读到 nginx 写入的真实用户 IP
        ...(req.headers.get('x-real-visitor-ip') && { 'x-real-visitor-ip': req.headers.get('x-real-visitor-ip')! }),
        ...(req.headers.get('cf-connecting-ip') && { 'cf-connecting-ip': req.headers.get('cf-connecting-ip')! }),
        ...(req.headers.get('x-real-ip') && { 'x-real-ip': req.headers.get('x-real-ip')! }),
        ...(req.headers.get('x-forwarded-for') && { 'x-forwarded-for': req.headers.get('x-forwarded-for')! }),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    })

    if (!backendRes.ok) {
      console.warn('[track/pv] backend returned', backendRes.status)
    }

    const response = new NextResponse(null, { status: 204 })

    if (isNew) {
      response.cookies.set('_sb_sid', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
    }

    return response
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
