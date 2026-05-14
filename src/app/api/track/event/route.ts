import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import siteConfig from '@/config/customize/site'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_ID = siteConfig.site.siteId

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const cookieStore = cookies()
    const sessionId = cookieStore.get('_sb_sid')?.value || null
    // 前端 IP：CF Workers 直连来源 IP（X-Real-IP = $remote_addr，有 CF 时是 CF 节点 IP）
    // 后端 IP：VPS nginx 在 X-Real-Visitor-IP 中写入的真实用户 IP（可靠），无则降级用前端 IP
    const ipFrontend = resolveFrontendIp(req)
    const ipBackend = resolveBackendIp(req, ipFrontend)

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
      ipAddressFrontend: ipFrontend,
      ipAddressBackend: ipBackend,
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
