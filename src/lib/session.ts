import { SESSION_COOKIE_KEY } from '@/lib/constants'
import { randomUUID, createHash } from 'crypto'
import type { NextRequest } from 'next/server'

const SESSION_QUERY_KEY = '_sb_sid'

/** 从请求中读取已有 sessionId（仅 cookie） */
export function readSessionId(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE_KEY)?.value
}

/**
 * 获取或生成 sessionId。优先级：cookie > URL 参数 > 生成新的。
 * URL 参数来自跨站跳转传递的 sessionId，仅在首次 PV（无 cookie）时复用。
 */
export function readSessionOrGenerate(request: NextRequest): { sessionId: string; isNew: boolean } {
  const existing = readSessionId(request)
  if (existing) return { sessionId: existing, isNew: false }

  const urlSession = request.nextUrl.searchParams.get(SESSION_QUERY_KEY)
  if (urlSession) return { sessionId: urlSession, isNew: false }

  const raw = randomUUID()
  const hashed = createHash('sha256').update(raw).digest('hex')
  return { sessionId: hashed, isNew: true }
}

/**
 * 将 sessionId 拼接到目标 URL 的 query 参数中。
 * 用于跨站跳转时传递 sessionId。
 *
 * @example
 * // 在 middleware 中跳转时：
 * const sessionId = readSessionId(request)
 * if (sessionId) {
 *   return NextResponse.redirect(addSessionToUrl('https://sub.example.com', sessionId))
 * }
 */
export function addSessionToUrl(targetUrl: string, sessionId: string): string {
  try {
    const url = new URL(targetUrl)
    url.searchParams.set(SESSION_QUERY_KEY, sessionId)
    return url.toString()
  } catch {
    return `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}_sb_sid=${sessionId}`
  }
}
