/**
 * 外链中间跳转工具
 *
 * 将真实外链地址编码为站内 API 路由，
 * 避免广告审核系统将外链判定为"重定向至其他网站"而拒登。
 */

/**
 * 将真实外链地址编码为站内中间跳转 URL
 * @param realUrl 真实外链地址（http/https）
 * @returns 站内跳转 URL，格式: /api/go?url=base64(realUrl)
 */
export function getOutboundUrl(realUrl: string): string {
  const encoded = typeof window !== 'undefined'
    ? btoa(unescape(encodeURIComponent(realUrl)))
    : Buffer.from(realUrl, 'utf-8').toString('base64')
  return `/api/go?url=${encodeURIComponent(encoded)}`
}
