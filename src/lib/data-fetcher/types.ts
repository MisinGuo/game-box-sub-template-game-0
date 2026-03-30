/**
 * 数据获取引擎类型定义
 */

/** 数据上下文 */
export interface DataContext {
  /** 语言 */
  locale: string
  /** 站点ID */
  siteId: number
  /** 其他上下文数据 */
  [key: string]: any
}

/** 基础数据源 */
export interface BaseDataSource {
  /** 数据源类型 */
  type: 'api' | 'static' | 'computed' | 'aggregate'
  /** 数据转换函数 */
  transform?: (data: any, context: DataContext) => any
}

/** API数据源 */
export interface ApiDataSource extends BaseDataSource {
  type: 'api'
  /** API端点 */
  endpoint: string
  /** HTTP方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** 查询参数 */
  params?: Record<string, any>
  /** 数据路径（从响应中提取数据的路径） */
  dataPath?: string
  /** 是否自动注入locale和siteId */
  autoInject?: boolean
  /** 构建时跳过 */
  skipOnBuild?: boolean
}

/** 静态数据源 */
export interface StaticDataSource extends BaseDataSource {
  type: 'static'
  /** 静态数据 */
  data: any
}

/** 计算数据源 */
export interface ComputedDataSource extends BaseDataSource {
  type: 'computed'
  /** 依赖的数据源字段名 */
  dependencies: string[]
  /** 计算函数 */
  compute: (deps: Record<string, any>, context: DataContext) => any
}

/** 聚合数据源 */
export interface AggregateDataSource extends BaseDataSource {
  type: 'aggregate'
  /** 要聚合的数据源 */
  sources: Record<string, DataSource>
  /** 聚合策略 */
  strategy?: 'merge' | 'concat'
  /** 自定义聚合函数 */
  aggregate?: (results: Record<string, any>, context: DataContext) => any
}

/** 数据源联合类型 */
export type DataSource = 
  | ApiDataSource 
  | StaticDataSource 
  | ComputedDataSource 
  | AggregateDataSource

/** 字段配置 */
export interface FieldConfig {
  /** 字段名 */
  name: string
  /** 数据源（可以是数据源名称或内联数据源） */
  source: string | DataSource
  /** 默认值 */
  defaultValue?: any
  /** 格式化函数 */
  format?: (data: any, context: DataContext) => any
  /** 验证函数 */
  validate?: (data: any) => boolean
  /** 是否必需 */
  required?: boolean
}

/** 页面数据定义 */
export interface PageDataSchema {
  /** 页面ID */
  pageId: string
  /** 页面名称 */
  pageName: string
  /** 数据源定义 */
  dataSources: Record<string, DataSource>
  /** 字段列表 */
  fields: FieldConfig[]
  /** 页面级别数据转换 */
  transform?: (data: Record<string, any>, context: DataContext) => any
  /** 错误处理 */
  errorHandler?: (error: Error) => any
}
