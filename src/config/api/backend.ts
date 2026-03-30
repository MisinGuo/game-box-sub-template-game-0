/**
 * 后端接口配置
 * 
 * 🔧 用户需要修改此文件来接入后端系统
 * 
 * 修改步骤：
 * 1. 复制 .env.example 为 .env.local
 * 2. 在 .env.local 中填入你的后端API地址和站点ID
 * 3. 如果需要API密钥，也在 .env.local 中配置
 * 
 * 环境变量说明：
 * - NEXT_PUBLIC_API_URL: 后端API基础地址（必填）
 * - NEXT_PUBLIC_SITE_ID: 站点ID，从管理后台获取（必填）
 * - NEXT_PUBLIC_API_KEY: API访问密钥（可选）
 */

export interface BackendConfig {
  /** API基础URL */
  baseURL: string
  /** API版本前缀 */
  apiPrefix: string
  /** 超时时间(ms) */
  timeout: number
  /** 是否启用认证 */
  enableAuth: boolean
  /** 站点ID (从管理后台获取) */
  siteId?: string
  /** API密钥 (可选，用于公开API访问) */
  apiKey?: string
}

/**
 * 后端API端点配置
 * 定义所有需要的接口地址
 */
export interface ApiEndpoints {
  // 文章相关
  articles: string         // 文章列表
  articleDetail: string    // 文章详情
  // 首页数据
  home: string            // 首页数据
  // 游戏相关
  games: string           // 游戏列表
  gameDetail: string      // 游戏详情
  gameCategories: string  // 游戏分类列表
  categories: string      // 分类列表
  // 游戏盒子相关
  boxes: string           // 游戏盒子列表
  boxDetail: string       // 游戏盒子详情
  // 搜索相关
  searchArticles: string  // 搜索文章
  searchGames: string     // 搜索游戏
}

/**
 * 默认后端配置
 * 
 * ⚠️ 不要直接修改这里的值！
 * 应该通过 .env.local 文件配置环境变量
 */
export const backendConfig: BackendConfig = {
  // 🔧 后端API地址（从环境变量读取）
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // API前缀（通常不需要修改）
  apiPrefix: '',
  
  // 请求超时时间（10秒）
  timeout: 10000,
  
  // 公开API不需要认证
  enableAuth: false,
  
  // 🔧 站点ID（从环境变量读取）
  siteId: process.env.NEXT_PUBLIC_SITE_ID || '1',
  
  // 🔧 API密钥（从环境变量读取，可选）
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
}

/**
 * API端点配置
 * 
 * ⚠️ 这些路径应该与后端 PublicApiController 中的路径一致
 * 通常不需要修改，除非后端接口路径发生变化
 */
export const apiEndpoints: ApiEndpoints = {
  articles: '/api/public/articles',
  articleDetail: '/api/public/articles',
  home: '/api/public/home',
  games: '/api/public/games',
  gameDetail: '/api/public/games',
  gameCategories: '/api/public/categories',
  categories: '/api/public/categories',
  boxes: '/api/public/boxes',
  boxDetail: '/api/public/boxes',
  searchArticles: '/api/public/articles/search',
  searchGames: '/api/public/games/search',
}

/**
 * 获取完整的API URL
 * @param endpoint API端点路径
 * @returns 完整的URL
 */
export function getApiUrl(endpoint: string): string {
  const { baseURL, apiPrefix } = backendConfig
  return `${baseURL}${apiPrefix}${endpoint}`
}

/**
 * 获取请求头
 * 自动添加站点ID和API密钥（如果配置了）
 * @returns HTTP请求头对象
 */
export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 添加站点ID
  if (backendConfig.siteId) {
    headers['X-Site-Id'] = backendConfig.siteId
  }

  // 添加API密钥
  if (backendConfig.apiKey) {
    headers['X-Api-Key'] = backendConfig.apiKey
  }

  return headers
}
