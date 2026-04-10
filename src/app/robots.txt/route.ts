import { NextResponse } from 'next/server'
import { getSecureHostname } from '@/lib/sitemap/security'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * 动态生成 robots.txt，确保不同域名环境都指向当前域名的 sitemap.xml
 */
export async function GET(request: Request) {
  const hostname = getSecureHostname(request)

  const content = [
    'User-agent: *',
    'Allow: /',
    'Allow: /_next/static/',
    'Allow: /_next/image/',
    'Allow: /fonts/',
    'Disallow: /api/',
    'Disallow: /admin/',
    'Disallow: /_next/webpack-hmr',
    '',
    `Sitemap: ${hostname}/sitemap.xml`,
    '',
  ].join('\n')

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': process.env.NODE_ENV === 'development'
        ? 'no-store, max-age=0'
        : 'public, max-age=3600, s-maxage=3600',
    },
  })
}