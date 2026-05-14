import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import siteConfig from '@/config/customize/site'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_ID = siteConfig.site.siteId

/** 解析前端 IP（由 Next.js 层从请求头提取，仅供参考；后端 IP 由 Java controller 独立解析更可靠） */
function resolveClientIp(req: NextRequest): string | null {
  const candidate =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-real-visitor-ip') ||
    req.headers.get('cf-connecting-ip') ||
    null
  if (!candidate) return null
  return candidate.split(',')[0].trim() || null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const cookieStore = cookies()
    const sessionId = cookieStore.get('_sb_sid')?.value || null
    // 前端 IP：由 Next.js 层从请求头提取，可能被伪造，仅供参考；
    // 后端 IP：由 Java controller 独立解析，经过代理层（nginx/CF）过滤透传，更可靠
    const ipAddress = resolveClientIp(req)

    const payload = {
      siteId: SITE_ID,
      sessionId,
      eventType: body.eventType,
      pageType: body.pageType || null,
      pagePath: body.pagePath || null,
      contentSlug: body.contentSlug || null,
      locale: body.locale || null,
      targetUrl: body.targetUrl || null,
      scrollDepth: body.scrollDepth != null ? Number(body.scrollDepth) : null,
      timeOnPage: body.timeOnPage != null ? Number(body.timeOnPage) : null,
      ipAddressFrontend: ipAddress,
    }

    if (!payload.siteId || !payload.eventType) {
      return new NextResponse(null, { status: 204 })
    }

    await fetch(`${BACKEND_URL}/track/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {
      // 静默失败
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
