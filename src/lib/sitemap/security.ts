import { siteConfig } from '@/config'
import { sitemapConfig } from '@/config/sitemap/config'
import { cookies } from 'next/headers'

// 自定义请求头名称：与 middleware 中保持一致
// 用于绕过 OpenNext edge.js convertTo() 用 host 覆盖 x-forwarded-host 的问题
const PUBLIC_HOST_HEADER = 'x-public-host'
// Cookie 名称：与 middleware 中保持一致
// 用于 NextResponse.rewrite() 路径（不支持 request.headers 传递）和客户端导航
const PUBLIC_HOST_COOKIE = 'x-public-host'

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
 * 1. X-Public-Host 请求头（middleware 通过 NextResponse.next 设置，最可靠）
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
  // 1. X-Public-Host 请求头（middleware 通过 NextResponse.next({ request: { headers } }) 设置）
  //    背景：OpenNext edge.js convertTo() 会用 host 覆盖 x-forwarded-host，
  //    导致 Nginx 设置的 x-forwarded-host（公开域名）被 host（源站域名）覆盖。
  //    middleware 在检测到 x-forwarded-host 时，将公开域名同时写入 x-public-host，
  //    此头不会被 OpenNext 覆盖，因此优先级最高。
  const publicHost = requestHeaders?.get(PUBLIC_HOST_HEADER)
  if (publicHost) {
    // 防御性处理：header 值可能包含多个值（逗号分隔），取第一个
    const firstHost = publicHost.split(',')[0].trim()
    return `https://${firstHost}`
  }
  // 2. x-public-host Cookie（middleware 通过 NextResponse.rewrite 设置）
  //    背景：NextResponse.rewrite() 不支持 { request: { headers } } 参数（OpenNext Cloudflare 限制），
  //    因此 rewrite 路径改用 cookie 传递公开域名。
  //    Cookie 同时解决了客户端导航（RSC 请求）丢失 x-forwarded-host 的问题：
  //    首次 SSR 时 middleware 设置 cookie，后续客户端导航自动携带 cookie。
  try {
    const cookieStore = cookies()
    const cookieHost = cookieStore.get(PUBLIC_HOST_COOKIE)?.value
    if (cookieHost) {
      // 防御性处理：cookie 值可能被重复追加（如 "host1, host1"），取第一个值
      const firstHost = cookieHost.split(',')[0].trim()
      return `https://${firstHost}`
    }
  } catch {
    // cookies() 在非 Server Component 上下文中可能抛出异常，忽略即可
  }
  // 3. X-Forwarded-Host（反向代理场景）
  //    ⚠️ OpenNext edge.js convertTo() 会用 host 覆盖 x-forwarded-host：
  //      headers: { ...internalEvent.headers, "x-forwarded-host": internalEvent.headers.host }
  //    导致 x-forwarded-host 与 host 相同（都是源站域名），此时应跳过，回退到 siteConfig.hostname。
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
  // 5. 兜底：静态配置
  return siteConfig.hostname
}
