/** middleware 与 server 端共享的 key */

/** x-public-host 请求头 / Cookie：传递公开域名 */
export const PUBLIC_HOST_KEY = 'x-public-host'

/** 来源站 Cookie：middleware 写入，/api/track/pv 读取 */
export const REFERRER_COOKIE_KEY = '_sb_ref'

/** 匿名 session Cookie：/api/track/pv 创建 */
export const SESSION_COOKIE_KEY = '_sb_sid'
