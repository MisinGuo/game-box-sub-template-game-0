import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import siteConfig from '@/config/customize/site'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const SITE_ID = siteConfig.site.siteId

/** 解析前端 IP：用户的真实 IP
 *  VPS nginx 反代场景：cf-connecting-ip 为 VPS 出口 IP（不可靠），
 *  但 x-forwarded-for 的第一个条目是 nginx 透传的原始客户端 IP（用户真实 IP）
 *  用户直连 CF Workers 场景：cf-connecting-ip 为用户真实 IP
 *  注意：x-real-ip 是 CF 边缘节点 IP（代理IP），不应作为用户真实 IP
 */
function resolveFrontendIp(req: NextRequest): string | null {
  // 优先 x-forwarded-for：VPS 反代场景下第一个条目是用户真实 IP
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0].trim()
    if (first) return first
  }
  // 直连 CF Workers 场景：cf-connecting-ip 为用户真实 IP
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim() || null
  return null
}

/** 解析后端 IP：fetch 请求到达 VPS nginx 时，nginx 在 X-Real-Visitor-IP 中写入的真实用户 IP
 *  用户请求到达 CF Workers 时此 header 不存在，返回 null 让 Java 后端自行从请求头解析
 */
function resolveBackendIp(req: NextRequest): string | null {
  const realVisitorIp = req.headers.get('x-real-visitor-ip')
  if (realVisitorIp) return realVisitorIp.split(',')[0].trim() || null
  return null
}

/** 解析代理 IP：VPS nginx 反代到 CF Workers 时设置 X-Real-IP = $remote_addr（即 CF Workers 出口 IP）
 *  用于识别请求打到了哪台 VPS；用户直连 CF Workers 时此 header 不存在，返回 null
 */
function resolveProxyIp(req: NextRequest): string | null {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim() || null
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const cookieStore = cookies()
    const sessionId = cookieStore.get('_sb_sid')?.value || null
    // 前端 IP：请求打到 VPS 时使用的 IP（x-real-ip = CF 边缘节点 IP）
    // 后端 IP：nginx 在 X-Real-Visitor-IP 中写入的用户真实 IP（用户请求到达 CF Workers 时不存在，为 null）
    // 代理 IP：VPS nginx X-Real-IP = $remote_addr（CF Workers 出口 IP），用户直连时为 null
    const ipFrontend = resolveFrontendIp(req)
    const ipBackend = resolveBackendIp(req)
    const ipProxy = resolveProxyIp(req)

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
      ipAddressProxy: ipProxy,
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
