import { siteConfig } from '@/config'

/**
 * JSON-LD 结构化数据生成工具
 * 用于 Google Rich Snippets / 富摘要展示
 */

/** WebSite schema - 用于首页，支持站内搜索 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.hostname,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.hostname}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Organization schema - 用于首页 */
export function generateOrganizationJsonLd() {
  const sameAs = [
    siteConfig.social?.github,
    siteConfig.social?.twitter,
    siteConfig.social?.discord,
    siteConfig.social?.telegram,
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.hostname,
    logo: `${siteConfig.hostname}${siteConfig.logo}`,
    description: siteConfig.description,
    ...(sameAs.length > 0 && { sameAs }),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: siteConfig.hostname,
    },
  }
}

/** SoftwareApplication schema - 用于游戏详情页 */
export function generateGameJsonLd(game: {
  name: string
  description: string
  iconUrl: string
  rating?: number | null
  downloadCount?: number
  categoryName?: string | null
  id: number
  launchTime?: string | null
  developer?: string | null
  tags?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: game.name,
    description: game.description,
    image: game.iconUrl,
    url: `${siteConfig.hostname}/games/${game.id}`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Android, iOS',
    ...(game.categoryName && { genre: game.categoryName }),
    ...(game.launchTime && { datePublished: game.launchTime }),
    ...(game.developer && {
      author: {
        '@type': 'Organization',
        name: game.developer,
      },
    }),
    ...(game.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: game.rating,
        bestRating: 5,
        ratingCount: game.downloadCount || 1,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
  }
}

/** Article schema - 用于资讯/攻略/评测/专题详情页 */
export function generateArticleJsonLd(article: {
  title: string
  description?: string
  coverImage?: string
  author?: string
  createTime: string
  updateTime?: string
  url: string
  tags?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || article.title,
    image: article.coverImage
      ? article.coverImage
      : `${siteConfig.hostname}${siteConfig.ogImage}`,
    url: `${siteConfig.hostname}${article.url}`,
    datePublished: article.createTime,
    ...(article.updateTime && { dateModified: article.updateTime }),
    author: {
      '@type': 'Organization',
      name: article.author || siteConfig.name,
      url: siteConfig.hostname,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.hostname}${siteConfig.logo}`,
      },
    },
    ...(article.tags &&
      article.tags.length > 0 && { keywords: article.tags.join(', ') }),
  }
}

/** CollectionPage + ItemList schema - 用于列表页 */
export function generateCollectionPageJsonLd(opts: {
  name: string
  description: string
  url: string
  items: { name: string; url: string; image?: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${siteConfig.hostname}${opts.url}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.slice(0, 30).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${siteConfig.hostname}${item.url}`,
        ...(item.image && { image: item.image }),
      })),
    },
  }
}

/** BreadcrumbList schema - 用于面包屑 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.hostname}${item.url}`,
    })),
  }
}

/** SoftwareApplication schema - 用于盒子详情页 */
export function generateBoxJsonLd(box: {
  name: string
  description?: string
  logoUrl?: string
  id: number
  gameCount?: number
  discountRate?: number
  websiteUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: box.name,
    description: box.description || box.name,
    image: box.logoUrl || `${siteConfig.hostname}${siteConfig.ogImage}`,
    url: `${siteConfig.hostname}/boxes/${box.id}`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Android, iOS',
    ...(box.gameCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.5,
        bestRating: 5,
        ratingCount: box.gameCount,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
  }
}
