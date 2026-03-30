import { sitemapConfig } from '@/config/sitemap/config'

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
    return sitemapConfig.defaultHostname
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
  // X-Forwarded-Host 头记录的是用户实际访问的公开域名（由 nginx proxy_set_header X-Forwarded-Host $host 设置）
  const forwardedHost = (request.headers as Headers).get('x-forwarded-host')
  return validateHostname(request.url, forwardedHost)
}
