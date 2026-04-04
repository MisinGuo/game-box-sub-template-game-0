/**
 * 统一API客户端
 * 封装所有后端请求，自动处理认证、错误、多语言等
 */

import { backendConfig, apiEndpoints, getApiUrl, getHeaders } from '@/config'
import type {
  LocaleRequestParams,
  ArticleListParams,
  ArticleDetailParams,
  SearchParams,
  CategoryListParams,
  CategoryTreeParams,
  BoxListParams,
  BoxDetailParams,
  GameListParams,
  GameDetailParams,
  SiteConfigParams,
  StatisticsParams,
} from './api-types'
import { getCurrentLocale, formatLocaleForBackend } from './api-types'

/** API响应格式 */
export interface ApiResponse<T = any> {
  rows?: any[]
  code: number
  msg: string
  data: T
  total?: number
}

/** 请求配置 */
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  timeoutMs?: number
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
  cache?: RequestCache
}

/**
 * 基础请求函数
 */
async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', params, body, headers: customHeaders, timeoutMs, next, cache } = config

  // 构建URL
  let url = getApiUrl(endpoint)
  
  // 添加查询参数
  if (params && method === 'GET') {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 打印API请求日志
  console.log(`[API请求] ${url}`)

  // 构建请求配置
  const fetchConfig: RequestInit = {
    method,
    headers: {
      ...getHeaders(),
      ...customHeaders,
    },
  }

  // 添加 Next.js 缓存配置
  if (next) {
    (fetchConfig as any).next = next
  }
  if (cache) {
    fetchConfig.cache = cache
  }

  // 添加请求体
  if (body && method !== 'GET') {
    fetchConfig.body = JSON.stringify(body)
  }

  try {
    // 创建超时控制器
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs ?? backendConfig.timeout)
    
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // 打印API响应日志 - 简化版本
    let dataInfo = 'unknown'
    if (Array.isArray(data.rows)) {
      dataInfo = `${data.rows.length} 条记录`
    } else if (Array.isArray(data.data)) {
      dataInfo = `${data.data.length} 条记录`
    } else if (data.data && typeof data.data === 'object') {
      const fieldCount = Object.keys(data.data).length
      dataInfo = `${fieldCount} fields`
    }
    console.log(`[API响应] ${endpoint} - 数据长度: ${dataInfo}`)
    
    return data
  } catch (error) {
    console.error('API请求失败:', error)
    throw error
  }
}

/**
 * 准备请求参数（自动添加siteId和格式化locale）
 */
function prepareParams<T extends LocaleRequestParams>(params: T): Record<string, any> {
  const prepared: Record<string, any> = {
    ...params,
    siteId: params.siteId || backendConfig.siteId,
  }
  
  // 格式化locale
  if (prepared.locale) {
    prepared.locale = formatLocaleForBackend(prepared.locale as any)
  }
  
  return prepared
}

/**
 * API客户端类
 * 所有方法都支持多语言参数
 */
export class ApiClient {
  /** 获取文章列表（按站点配置的 section slug 过滤） */
  static async getArticles(params: ArticleListParams = {}) {
    return request(apiEndpoints.articles, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale),
        ...params,
      }),
      next: { revalidate: 600, tags: ['articles'] },
    })
  }

  /** 获取文章详情（用于攻略详情） */
  static async getArticleDetail(id: number, locale?: string) {
    return request(`${apiEndpoints.articleDetail}/${id}`, {
      method: 'GET',
      params: prepareParams({ 
        locale: getCurrentLocale(locale as any),
      }),
      next: { revalidate: 600, tags: ['articles', `article-${id}`] },
    })
  }

  /** 获取文章所有可用的语言版本 */
  static async getArticleLocales(id: number) {
    return request(`${apiEndpoints.articleDetail}/${id}/locales`, {
      method: 'GET',
      // 设置为 0 (no-store) 以确保每次页面重新生成(ISR)时都获取最新数据
      // 页面本身已有 ISR 缓存(5分钟)，不需要双重缓存
      next: { revalidate: 0, tags: ['articles', `article-${id}-locales`] },
    })
  }

  /** 获取游戏盒子列表 */
  static async getBoxes(params: BoxListParams = {}) {
    return request(apiEndpoints.boxes, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale),
        ...params,
      }),
      next: { revalidate: 300, tags: ['boxes'] },
    })
  }

  /** 获取游戏盒子详情 */
  static async getBoxDetail(id: number, locale?: string) {
    return request(`${apiEndpoints.boxDetail}/${id}`, {
      method: 'GET',
      params: prepareParams({ 
        locale: getCurrentLocale(locale as any),
      }),
    })
  }

  /** 获取盒子下的游戏列表 */
  static async getBoxGames(
    id: number,
    params: { locale?: string; pageNum?: number; pageSize?: number } = {}
  ) {
    return request(`${apiEndpoints.boxDetail}/${id}/games`, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 15,
      }),
    })
  }

  /** 获取游戏列表 */
  static async getGames(
    params: GameListParams = {},
    requestOptions: Pick<RequestConfig, 'next' | 'cache' | 'timeoutMs'> = {}
  ) {
    return request(apiEndpoints.games, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale),
        ...params,
      }),
      ...requestOptions,
    })
  }

  /** 获取游戏详情 */
  static async getGameDetail(id: number, locale?: string) {
    return request(`${apiEndpoints.gameDetail}/${id}`, {
      method: 'GET',
      params: prepareParams({ 
        locale: getCurrentLocale(locale as any),
      }),
      next: { revalidate: 300, tags: ['games', `game-${id}`] },
    })
  }

  /** 获取分类列表 */
  static async getCategories(params: CategoryListParams = {}) {
    return request(apiEndpoints.categories, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale),
        ...params,
      }),
    })
  }

  /** 获取分类下的游戏列表 */
  static async getCategoryGames(
    categoryId: number,
    params: GameListParams = {},
    requestOptions: Pick<RequestConfig, 'next' | 'cache' | 'timeoutMs'> = {}
  ) {
    const resolvedNext = requestOptions.cache === 'no-store'
      ? undefined
      : (requestOptions.next ?? { revalidate: 300, tags: ['categories', 'games', `category-${categoryId}`] })

    return request(`${apiEndpoints.categories}/${categoryId}/games`, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale),
        ...params,
      }),
      timeoutMs: requestOptions.timeoutMs,
      next: resolvedNext,
      cache: requestOptions.cache,
    })
  }

  /** 获取品类增强详情（包含TOP游戏、礼包、攻略等） */
  static async getCategoryDetail(slug: string, params: { locale?: string; source?: string } = {}) {
    return request(`${apiEndpoints.categories}/${slug}/detail`, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
        source: params.source,
      }),
      next: { revalidate: 300, tags: ['categories', `category-${slug}`] },
    })
  }

  /** 获取游戏增强详情（包含礼包、攻略、相关游戏等） */
  static async getGameDetailEnhanced(id: number, locale?: string) {
    return request(`${apiEndpoints.gameDetail}/${id}/enhanced`, {
      method: 'GET',
      params: prepareParams({ 
        locale: getCurrentLocale(locale as any),
      }),
      next: { revalidate: 300, tags: ['games', `game-${id}`] },
    })
  }

  /** 获取游戏礼包列表 */
  static async getGameGifts(gameId: number, params: { locale?: string } = {}) {
    return request(`/api/public/games/${gameId}/gifts`, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
      }),
      next: { revalidate: 300, tags: ['gifts', `game-${gameId}`] },
    })
  }

  /** 获取游戏关联的盒子列表（含推广链接等） */
  static async getGameBoxes(gameId: number) {
    return request(`/api/public/games/${gameId}/boxes`, {
      method: 'GET',
      params: prepareParams({}),
      next: { revalidate: 300, tags: ['boxes', `game-${gameId}`] },
    })
  }

  /** 获取游戏攻略列表 */
  static async getGameGuides(gameId: number, params: { pageNum?: number; pageSize?: number; locale?: string } = {}) {
    return request(`/api/public/games/${gameId}/guides`, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
      }),
      next: { revalidate: 300, tags: ['articles', `game-${gameId}`] },
    })
  }

  /** 获取品类礼包列表 */
  static async getCategoryGifts(categoryId: number, params: { pageNum?: number; pageSize?: number; locale?: string } = {}) {
    return request(`/api/public/categories/${categoryId}/gifts`, {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 20,
      }),
      next: { revalidate: 300, tags: ['gifts', `category-${categoryId}`] },
    })
  }

  /** 搜索文章 */
  static async searchArticles(keyword: string, params: { pageNum?: number; pageSize?: number; locale?: string } = {}) {
    return request(apiEndpoints.searchArticles, {
      method: 'GET',
      params: prepareParams({
        keyword,
        locale: getCurrentLocale(params.locale as any),
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 20,
      }),
    })
  }

  /** 搜索游戏 */
  static async searchGames(keyword: string, params: { pageNum?: number; pageSize?: number; locale?: string } = {}) {
    return request(apiEndpoints.searchGames, {
      method: 'GET',
      params: prepareParams({
        keyword,
        locale: getCurrentLocale(params.locale as any),
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 20,
      }),
    })
  }

  /** 获取网站配置信息（所有页面共用，支持CDN缓存） */
  static async getSiteConfig(params: { locale?: string } = {}) {
    return request('/api/public/site-config', {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
      }),
      next: { revalidate: 300, tags: ['site-config'] },
    })
  }

  /** 获取首页数据（统一接口） */
  static async getHomeData(params: { 
    locale?: string
    strategyCount?: number
    hotGamesCount?: number
    articleCount?: number
  } = {}) {
    return request('/api/public/home', {
      method: 'GET',
      params: prepareParams({
        locale: getCurrentLocale(params.locale as any),
        strategyCount: params.strategyCount || 6,
        hotGamesCount: params.hotGamesCount || 6,
        articleCount: params.articleCount || 6,
      }),
      // 前端无缓存，每次都请求后端。后端 Redis 缓存保证性能。
      // Cloudflare Workers 通过首页的 revalidate=0 识别 Cache-Control 头，不会缓存首页。
      cache: 'no-store' as const,





      // const isDev = process.env.NODE_ENV !== 'production'
      //  ...(isDev
      //   // 这是是指在开发环境下，关闭 Next.js 的 ISR 缓存，以便每次请求都能获取最新数据，方便调试。
      //   ? { cache: 'no-store' as const }
      //   // 在生产环境下，启用 ISR 缓存，并设置合理的 revalidate 时间和标签，以便 CDN 和 Next.js 能够高效缓存和更新数据。
      //   // 但是如果是直接部署到了cfworkers上不会生效的，因为cfworkers不支持ISR，所以生产环境也设置为no-store，完全依赖cfworkers的缓存策略
      //   : { next: { revalidate: 60, tags: ['home', 'games', 'articles'] } }),
    
    })
  }
}

export default ApiClient
