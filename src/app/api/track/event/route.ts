import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import siteConfig from '@/config/customize/site'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_ID = siteConfig.site.siteId

/** 提取 IP 相关 header，不做优先级判断，原样传给后端由后端决定存储 */
function extractIpHeaders(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for')
  const cfIp = req.headers.get('cf-connecting-ip')
  const realIp = req.headers.get('x-real-ip')
  const realVisitorIp = req.headers.get('x-real-visitor-ip')
  return {
    ipAddressFrontend: xff ? xff.split(',')[0].trim() : null,  // x-forwarded-for[0]
    ipAddressBackend:  realVisitorIp ? realVisitorIp.split(',')[0].trim() : null, // x-real-visitor-ip
    ipAddressProxy:    realIp ? realIp.trim() : null,  // x-real-ip
    ipHeaders: JSON.stringify({
      'x-forwarded-for':    xff || null,
      'cf-connecting-ip':   cfIp || null,
      'x-real-ip':          realIp || null,
      'x-real-visitor-ip':  realVisitorIp || null,
    }),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const cookieStore = cookies()
    const sessionId = cookieStore.get('_sb_sid')?.value || null
    const ipInfo = extractIpHeaders(req)

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
      ipAddressFrontend: ipInfo.ipAddressFrontend,
      ipAddressBackend: ipInfo.ipAddressBackend,
      ipAddressProxy: ipInfo.ipAddressProxy,
      ipHeaders: ipInfo.ipHeaders,
    }

    if (!payload.siteId || !payload.eventType) {
      return new NextResponse(null, { status: 204 })
    }

    await fetch(`${BACKEND_URL}/track/event`, {
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
    }).catch(() => {
      // 静默失败
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
