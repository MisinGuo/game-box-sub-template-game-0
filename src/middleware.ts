import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 直接内联常量，避免 import 大体积 locales.ts 导致 Edge Runtime bundle 超限
const defaultLocale = 'zh-CN'
const supportedLocales = ['zh-CN', 'zh-TW', 'en-US']

// 自定义请求头：存储公开域名（仅主机名部分）
// 背景：OpenNext edge.js convertTo() 会用 host 覆盖 x-forwarded-host：
//   headers: { ...internalEvent.headers, "x-forwarded-host": internalEvent.headers.host }
// 导致 Nginx 设置的 x-forwarded-host（公开域名）被 host（源站域名）覆盖。
// 解决方案：middleware 将公开域名写入自定义头 x-public-host 和 cookie，
// getPublicOrigin() 优先读取此头，绕过 OpenNext 的覆盖行为。
//
// ⚠️ 重要：NextResponse.rewrite() 不支持 { request: { headers } } 参数！
// OpenNext Cloudflare 的 e2e 测试中，rewrite 从不传递 request.headers，
// 只有 NextResponse.next() 才支持 { request: { headers } }。
// 因此 rewrite 路径改用 cookie 传递公开域名，server component 从 cookie 中读取。
//
// Cookie 方案同时解决了客户端导航（RSC 请求）丢失 x-forwarded-host 的问题：
// 首次 SSR 时 middleware 设置 cookie，后续客户端导航自动携带 cookie。
const PUBLIC_HOST_HEADER = 'x-public-host'
const PUBLIC_HOST_COOKIE = 'x-public-host'

/**
 * 安全设置 cookie，防止重复追加
 * OpenNext/CF Workers 环境下 response.cookies.set() 可能追加而非覆盖，
 * 导致 cookie 值变成 "host1, host1" 这样的重复值。
 * 先删除旧 cookie 再设置新值来确保正确性。
 */
function setPublicHostCookie(response: NextResponse, value: string) {
  // 先删除可能存在的旧 cookie，防止追加
  response.cookies.delete(PUBLIC_HOST_COOKIE)
  response.cookies.set(PUBLIC_HOST_COOKIE, value, {
    path: '/',
    sameSite: 'lax',
    secure: true,
    httpOnly: false, // 允许客户端 JS 读取（用于调试）
  })
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 🔑 SEO: 将公开域名写入自定义请求头 x-public-host，确保客户端导航（RSC 请求）也能获取正确的公开域名
  // 优先级：X-Forwarded-Host（nginx 代理） > Host（直连）
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')
  let publicHost: string | undefined  // 仅主机名部分，用于写入 x-public-host 头

  if (forwardedHost) {
    publicHost = forwardedHost
  } else if (host) {
    publicHost = host
  }

  // 辅助函数：创建带 x-public-host 头的 Headers（仅用于 NextResponse.next）
  function withPublicHostHeaders(): Headers {
    const headers = new Headers(request.headers)
    if (publicHost) {
      headers.set(PUBLIC_HOST_HEADER, publicHost)
    }
    return headers
  }
  
  // 处理 sitemap 请求：重写到 API 路由
  // /sitemap-zh-TW.xml -> /api/sitemap/zh-TW
  // /sitemap-zh-TW-games.xml -> /api/sitemap/zh-TW/games
  if (pathname.startsWith('/sitemap-') && pathname.endsWith('.xml')) {
    const withoutXml = pathname.replace(/\.xml$/, '')
    // 移除 /sitemap- 前缀，得到 zh-TW 或 zh-TW-games
    const pathPart = withoutXml.replace('/sitemap-', '')
    
    let newPathname: string

    // 优先匹配 locale，再解析 locale 后缀为 type
    const matchedLocale = supportedLocales.find(
      (locale) => pathPart === locale || pathPart.startsWith(`${locale}-`)
    )

    if (matchedLocale) {
      const suffix = pathPart.slice(matchedLocale.length)

      if (!suffix) {
        // 只有 locale
        newPathname = `/api/sitemap/${matchedLocale}`
      } else if (suffix.startsWith('-')) {
        // locale-type 或 locale-type-chunk
        const possibleType = suffix.slice(1)
        const chunkMatch = possibleType.match(/^(.*)-(\d+)$/)

        if (chunkMatch) {
          const [, parsedType, parsedChunk] = chunkMatch
          newPathname = `/api/sitemap/${matchedLocale}/${parsedType}/${parsedChunk}`
        } else {
          newPathname = `/api/sitemap/${matchedLocale}/${possibleType}`
        }
      } else {
        // 格式异常，按原始片段透传
        newPathname = `/api/sitemap/${pathPart}`
      }
    } else {
      // 无法识别，按原始片段透传
      newPathname = `/api/sitemap/${pathPart}`
    }
    
    console.log(`[Middleware] Rewriting ${pathname} -> ${newPathname}`)
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = newPathname
    // ⚠️ NextResponse.rewrite() 不支持 { request: { headers } }，改用 cookie 传递
    const response = NextResponse.rewrite(newUrl)
    if (publicHost) {
      setPublicHostCookie(response, publicHost)
    }
    return response
  }
  
  // 跳过 API 和其他特殊路由以及静态文件
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/feed.xml' ||
    pathname.endsWith('.xsl') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    // ✅ NextResponse.next({ request: { headers } }) 是 OpenNext 验证过的安全模式
    const response = NextResponse.next({ request: { headers: withPublicHostHeaders() } })
    // 同时设置 cookie，确保 rewrite 路径和客户端导航也能获取
    if (publicHost) {
      setPublicHostCookie(response, publicHost)
    }
    return response
  }
  
  // 检查路径是否已经包含语言前缀
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // 如果包含默认语言前缀，重定向到无前缀路径（默认语言不在 URL 中体现）
  if (pathnameHasLocale) {
    const isDefaultLocale = pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`
    if (isDefaultLocale) {
      const newPathname = pathname === `/${defaultLocale}`
        ? '/'
        : pathname.slice(`/${defaultLocale}`.length)
      const url = request.nextUrl.clone()
      url.pathname = newPathname
      return NextResponse.redirect(url)
    }
    // 非默认语言：从 URL 中提取 locale 并传递给 layout
    const currentLocale = supportedLocales.find(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    ) || defaultLocale
    // ✅ NextResponse.next({ request: { headers } }) 是安全模式
    const requestHeaders = withPublicHostHeaders()
    requestHeaders.set('x-locale', currentLocale)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    if (publicHost) {
      setPublicHostCookie(response, publicHost)
    }
    return response
  }

  // 没有语言前缀，使用 rewrite 到默认语言（URL 不变，SEO 友好）
  // ⚠️ NextResponse.rewrite() 不支持 { request: { headers } }，改用 cookie 传递
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  const response = NextResponse.rewrite(url)
  if (publicHost) {
    setPublicHostCookie(response, publicHost)
  }
  return response
}

export const config = {
  // 匹配所有路径，除了以下内容：
  // - api 路由
  // - _next/static (静态文件)
  // - _next/image (图片优化)
  // - favicon.ico (网站图标)
  // - robots.txt 等 SEO 文件
  // - public 文件夹中的文件（.jpg, .png, .svg, .xsl, .css, .js 等）
  // 注意：移除了 xml 和 txt 的排除，以便 middleware 可以处理 sitemap
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|gif|webp|ico|xsl|css|js)).*)',
  ],
}
