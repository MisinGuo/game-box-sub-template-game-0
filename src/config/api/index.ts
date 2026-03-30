/**
 * API配置统一导出
 * 包含：后端API配置、接口端点
 */

// 导出后端配置
export {
  backendConfig,
  apiEndpoints,
  getApiUrl,
  getHeaders,
} from './backend'

export type {
  BackendConfig,
  ApiEndpoints,
} from './backend'
