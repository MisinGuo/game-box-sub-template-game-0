import { MetadataRoute } from 'next'
import { sitemapConfig } from '@/config/sitemap/config'

/**
 * 生成 robots.txt
 * 文档: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const hostname = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : sitemapConfig.defaultHostname

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/', '/_next/image/', '/fonts/'],
        disallow: ['/api/', '/admin/', '/_next/webpack-hmr'],
      },
    ],
    sitemap: `${hostname}/sitemap.xml`,
  }
}
