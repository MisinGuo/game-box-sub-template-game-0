import { siteConfig } from '@/config'
import { sitemapConfig } from '@/config/sitemap/config'
import { cookies } from 'next/headers'
import { PUBLIC_HOST_KEY } from '@/lib/constants'

/**
 * 验证请求的 hostname 是否在白名单中
 * 防止内容被盗用（恶意域名解析到我们的服务器）
 */
export function validateHostname(requestUrl: string, forwardedHost?: string | null): string {
  const url = new URL(requestUrl)
  // 优先使用 X-Forwarded-Host（反向代理会将真实公开域名写入此头）
  // 否则回退到 request.url 中的 host（如 star-origin.5awyx.com 等内部域名）
  const host = forwardedHost || url.host

  // 检查是否在白名单中
  const isAllowed = sitemapConfig.allowedHosts.some(allowedHost => {
    // 精确匹配
    if (host === allowedHost) return true

    // 支持通配符子域名（例如 *.example.com）
    if (allowedHost.startsWith('*.')) {
      const domain = allowedHost.slice(2)
      return host.endsWith(domain)
    }

    return false
  })

  if (!isAllowed) {
    console.warn(`[Security] 未授权的域名访问: ${host}，使用默认域名`)
    return siteConfig.hostname
  }

  // 返回完整的协议+主机名
  // 如果有 X-Forwarded-Host，用请求原始协议（https）拼接真实公开域名
  if (forwardedHost) {
    return `${url.protocol}//${forwardedHost}`
  }
  return `${url.protocol}//${url.host}`
}

/**
 * 验证并获取安全的 hostname
 * 这是一个便捷方法，直接从 Request 对象中提取和验证
 */
export function getSecureHostname(request: Request): string {
  const forwardedHost = (request.headers as Headers).get('x-forwarded-host')
  return validateHostname(request.url, forwardedHost)
}

/**
 * 从请求头/Cookie 中获取公开 origin（协议+域名），用于 metadataBase / canonical / og:url 等 SEO 场景
 *
 * 优先级：
 * 1. x-public-host 请求头（middleware 通过 NextResponse.next 设置，最可靠）
 * 2. x-public-host Cookie（middleware 通过 NextResponse.rewrite 设置，rewrite 不支持 request.headers）
 * 3. X-Forwarded-Host（反向代理设置，记录用户实际访问的公开域名）
 * 4. Host 头（直连场景，直接读取请求域名）
 * 5. 静态配置 siteConfig.hostname（兜底）
 *
 * 使用场景：
 * - layout.tsx 的 generateMetadata() 中设置 metadataBase
 * - 各页面 generateMetadata() 中构建绝对 URL
 */
export function getPublicOrigin(requestHeaders?: Headers): string {
  // 1. x-public-host 请求头（middleware 通过 NextResponse.next 设置，最可靠）
  const publicHost = requestHeaders?.get(PUBLIC_HOST_KEY)
  if (publicHost) {
    return `https://${publicHost}`
  }
  // 2. x-public-host Cookie（rewrite 路径和客户端导航使用）
  try {
    const cookieHost = cookies().get(PUBLIC_HOST_KEY)?.value
    if (cookieHost) {
      return `https://${cookieHost}`
    }
  } catch {
    // cookies() 在非 Server Component 上下文中不可用
  }
  // 3. X-Forwarded-Host（反向代理设置，但 OpenNext 可能用 host 覆盖，需排除）
  const forwardedHost = requestHeaders?.get('x-forwarded-host')
  const host = requestHeaders?.get('host')
  if (forwardedHost && forwardedHost !== host) {
    return `https://${forwardedHost}`
  }
  // 4. Host 头（直连场景）
  if (host) {
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
  }
  // 5. 兜底
  return siteConfig.hostname
}

/**
 * 安全版 getPublicOrigin：确保返回值始终是合法 URL 字符串。
 * 用于 metadataBase 等必须传入合法 URL 的场景。
 */
export function getSafePublicOrigin(requestHeaders?: Headers): string {
  const origin = getPublicOrigin(requestHeaders)
  try {
    new URL(origin)
    return origin
  } catch {
    // getPublicOrigin 返回了无法解析的值，回退到静态配置
    console.warn(`[getSafePublicOrigin] Invalid origin "${origin}", falling back to siteConfig.hostname`)
    return siteConfig.hostname
  }
}