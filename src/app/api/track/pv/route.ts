import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, randomUUID } from 'crypto'
import siteConfig from '@/config/customize/site'
import { parseReferrer, parseUaCategory, parseUtm } from '@/lib/tracker'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_ID = siteConfig.site.siteId

/** 采集完整的请求头并序列化为 JSON */
function collectNextjsHeaders(req: NextRequest): string {
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })
  return JSON.stringify(headers)
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

    // 从 cookie 读取来源站 referer（由 middleware 在页面请求时写入）
    // 同一 session 内始终保留，只有新的外部来源才会覆盖
    // 如果 cookie 不存在（新 session 直接访问），则为 null
    const cookieStore = cookies()
    const referrerUrl = cookieStore.get('_sb_ref')?.value || null
    const ua = req.headers.get('user-agent')
    const countryCode = req.headers.get('cf-ipcountry') || null

    const { referrerType, referrerEngine, searchKeyword } = parseReferrer(referrerUrl)
    const uaCategory = parseUaCategory(ua)

    const { utmSource, utmMedium, utmCampaign } = parseUtm(body.pageUrl)

    // 采集客户端发送到 Next.js 的完整请求头
    const nextjsIpHeaders = collectNextjsHeaders(req)

    const payload = {
      siteId: SITE_ID,
      sessionId,
      pageType: body.pageType || null,
      pagePath: body.pagePath || null,
      contentSlug: body.contentSlug || null,
      locale: body.locale || null,
      referrerUrl: referrerUrl,
      referrerType,
      referrerEngine,
      searchKeyword,
      utmSource,
      utmMedium,
      utmCampaign,
      uaCategory,
      countryCode,
      viewportWidth: body.viewportWidth || null,
      nextjsIpHeaders, // 前端采集的完整请求头
    }

    if (!payload.siteId) {
      return new NextResponse(null, { status: 204 })
    }

    const backendRes = await fetch(`${BACKEND_URL}/track/pv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 转发代理头，由 Java 后端统一解析并落库
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
