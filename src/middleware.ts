import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 直接内联常量，避免 import 大体积 locales.ts 导致 Edge Runtime bundle 超限
const defaultLocale = 'zh-CN'
const supportedLocales = ['zh-CN', 'zh-TW', 'en-US']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
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
    return NextResponse.rewrite(newUrl)
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
    return NextResponse.next()
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
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', currentLocale)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // 没有语言前缀，使用 rewrite 到默认语言（URL 不变，SEO 友好）
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', defaultLocale)
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
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
