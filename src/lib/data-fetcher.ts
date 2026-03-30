/**
 * 数据获取引擎
 * 根据页面数据定义自动获取和组装数据
 */

import type {
  PageDataSchema,
  DataSource,
  ApiDataSource,
  StaticDataSource,
  ComputedDataSource,
  AggregateDataSource,
  DataContext,
  FieldConfig,
} from './data-fetcher/types'
import { backendConfig } from '@/config/api/backend'

/** 数据获取选项 */
export interface FetchOptions {
  /** 上下文（locale, siteId等） */
  context: DataContext
  /** 路径参数（如 {id: '123'}） */
  params?: Record<string, any>
  /** 查询参数 */
  query?: Record<string, any>
}

/** 数据获取结果 */
export interface FetchResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  timestamp: number
}

// ==================== 数据源获取器 ====================

/** API数据源获取器 */
async function fetchApiData(
  source: ApiDataSource,
  options: FetchOptions
): Promise<any> {
  const { context, params = {}, query = {} } = options

  // 检查是否在构建时跳过
  if (source.skipOnBuild && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log(`跳过构建时数据源: ${source.endpoint}`)
    return null
  }

  try {
    // 替换URL中的路径参数
    let url = source.endpoint
  Object.keys(params).forEach((key) => {
    url = url.replace(`{{${key}}}`, String(params[key]))
  })

  // 构建查询参数 - 只使用 source.params，不直接混入 query
  const queryParams: Record<string, any> = { ...source.params }

  // 替换查询参数中的模板变量（从 params 或 query 中取值）
  Object.keys(queryParams).forEach((key) => {
    const value = queryParams[key]
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const paramKey = value.slice(2, -2)
      // 先从 params 查找，再从 query 查找，最后保持原值
      queryParams[key] = params[paramKey] || query[paramKey] || value
    }
  })

  // 自动注入locale和siteId
  if (source.autoInject !== false) {
    if (context.locale && !queryParams.locale) {
      queryParams.locale = context.locale
    }
    if (context.siteId && !queryParams.siteId) {
      queryParams.siteId = context.siteId
    }
  }

  // 构建完整URL
  const queryString = new URLSearchParams(
    Object.entries(queryParams).map(([k, v]) => [k, String(v)])
  ).toString()
  const fullUrl = `${backendConfig.baseURL}${url}${queryString ? `?${queryString}` : ''}`

  console.log(`[API请求] ${fullUrl}`)

  // 发送请求
  const response = await fetch(fullUrl, {
    method: source.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Id': String(context.siteId),
    },
  })

  if (!response.ok) {
    console.error(`[API错误] ${fullUrl} - ${response.status} ${response.statusText}`)
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  
  // 智能判断数据长度
  let dataLength = 'N/A'
  if (Array.isArray(result?.rows)) {
    dataLength = String(result.rows.length)
  } else if (Array.isArray(result?.data)) {
    dataLength = String(result.data.length)
  } else if (result?.total !== undefined) {
    dataLength = `total: ${result.total}`
  } else if (result?.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
    // 统计数据特殊处理：显示关键统计值
    if (url.includes('/statistics')) {
      const stats = result.data
      const summary = [
        stats.gameCount !== undefined ? `游戏:${stats.gameCount}` : null,
        stats.articleCount !== undefined ? `文章:${stats.articleCount}` : null,
        stats.boxCount !== undefined ? `盒子:${stats.boxCount}` : null,
      ].filter(Boolean).join(', ')
      dataLength = summary || `${Object.keys(stats).length} fields`
    } else {
      const keys = Object.keys(result.data)
      dataLength = `${keys.length} fields`
    }
  } else if (typeof result === 'object' && result !== null) {
    const keys = Object.keys(result)
    dataLength = `${keys.length} fields`
  } else if (Array.isArray(result)) {
    dataLength = String(result.length)
  }
  
  console.log(`[API响应] ${url} - 数据长度: ${dataLength}`)

  // 提取数据
  let data = result
  if (source.dataPath) {
    const paths = source.dataPath.split('.')
    for (const path of paths) {
      data = data?.[path]
    }
  }

  // 数据转换
  if (source.transform) {
    data = source.transform(data, context)
  }

  return data
  } catch (error) {
    console.error(`[API异常] ${source.endpoint}:`, error)
    throw error
  }
}

/** 静态数据源获取器 */
async function fetchStaticData(
  source: StaticDataSource,
  options: FetchOptions
): Promise<any> {
  let data = source.data

  // 数据转换
  if (source.transform) {
    data = source.transform(data, options.context)
  }

  return data
}

/** 计算数据源获取器 */
async function fetchComputedData(
  source: ComputedDataSource,
  options: FetchOptions,
  schema: PageDataSchema,
  fetchedData: Record<string, any>
): Promise<any> {
  // 收集依赖数据
  const deps: Record<string, any> = {}
  for (const dep of source.dependencies) {
    if (fetchedData[dep] === undefined) {
      throw new Error(`计算字段依赖的数据源 "${dep}" 未找到`)
    }
    deps[dep] = fetchedData[dep]
  }

  // 执行计算
  return source.compute(deps, options.context)
}

/** 聚合数据源获取器 */
async function fetchAggregateData(
  source: AggregateDataSource,
  options: FetchOptions,
  schema: PageDataSchema
): Promise<any> {
  // 并行获取所有数据源
  const results: Record<string, any> = {}
  await Promise.all(
    Object.entries(source.sources).map(async ([key, dataSource]) => {
      results[key] = await fetchDataSource(dataSource, options, schema, {})
    })
  )

  // 执行聚合
  if (source.aggregate) {
    return source.aggregate(results, options.context)
  }

  // 默认聚合策略
  switch (source.strategy) {
    case 'concat':
      return Object.values(results).flat()
    case 'merge':
    default:
      return Object.assign({}, ...Object.values(results))
  }
}

/** 通用数据源获取器 */
async function fetchDataSource(
  source: DataSource,
  options: FetchOptions,
  schema: PageDataSchema,
  fetchedData: Record<string, any>
): Promise<any> {
  switch (source.type) {
    case 'api':
      return fetchApiData(source, options)
    case 'static':
      return fetchStaticData(source, options)
    case 'computed':
      return fetchComputedData(source, options, schema, fetchedData)
    case 'aggregate':
      return fetchAggregateData(source, options, schema)
    default:
      throw new Error(`未知的数据源类型: ${(source as any).type}`)
  }
}

// ==================== 主要API ====================

/**
 * 根据页面数据定义获取数据
 */
export async function fetchPageData<T = any>(
  schema: PageDataSchema,
  options: FetchOptions
): Promise<FetchResult<T>> {
  const startTime = Date.now()

  try {
    const fetchedData: Record<string, any> = {}

    // 第一阶段：获取所有非计算字段的数据
    const nonComputedFields = schema.fields.filter((field) => {
      if (typeof field.source === 'string') {
        const dataSource = schema.dataSources[field.source]
        return dataSource?.type !== 'computed'
      }
      return (field.source as DataSource).type !== 'computed'
    })

    await Promise.all(
      nonComputedFields.map(async (field) => {
        try {
          let source: DataSource
          if (typeof field.source === 'string') {
            source = schema.dataSources[field.source]
            if (!source) {
              throw new Error(`数据源 "${field.source}" 未定义`)
            }
          } else {
            source = field.source
          }

          let data = await fetchDataSource(source, options, schema, fetchedData)

          // 字段格式化
          if (field.format) {
            data = field.format(data, options.context)
          }

          // 字段验证
          if (field.validate && !field.validate(data)) {
            console.warn(`字段 "${field.name}" 验证失败，使用默认值`)
            data = field.defaultValue
          }

          fetchedData[field.name] = data ?? field.defaultValue
        } catch (error) {
          console.error(`获取字段 "${field.name}" 失败:`, error)
          fetchedData[field.name] = field.defaultValue
        }
      })
    )

    // 第二阶段：获取所有计算字段的数据
    const computedFields = schema.fields.filter((field) => {
      if (typeof field.source === 'string') {
        const dataSource = schema.dataSources[field.source]
        return dataSource?.type === 'computed'
      }
      return (field.source as DataSource).type === 'computed'
    })

    for (const field of computedFields) {
      try {
        let source: DataSource
        if (typeof field.source === 'string') {
          source = schema.dataSources[field.source]
        } else {
          source = field.source
        }

        let data = await fetchDataSource(source, options, schema, fetchedData)

        if (field.format) {
          data = field.format(data, options.context)
        }

        fetchedData[field.name] = data ?? field.defaultValue
      } catch (error) {
        console.error(`获取计算字段 "${field.name}" 失败:`, error)
        fetchedData[field.name] = field.defaultValue
      }
    }

    // 页面级别转换
    let result = fetchedData as T
    if (schema.transform) {
      result = schema.transform(fetchedData, options.context)
    }

    return {
      success: true,
      data: result,
      timestamp: Date.now() - startTime,
    }
  } catch (error) {
    // 错误处理
    if (schema.errorHandler) {
      const fallbackData = schema.errorHandler(error as Error)
      return {
        success: false,
        data: fallbackData,
        error: error as Error,
        timestamp: Date.now() - startTime,
      }
    }

    return {
      success: false,
      error: error as Error,
      timestamp: Date.now() - startTime,
    }
  }
}

/**
 * 创建页面数据Hook
 */
export function createPageDataHook(schema: PageDataSchema) {
  return function usePageData(options: Partial<FetchOptions> = {}) {
    // 这里可以集成到 React/Vue 的状态管理中
    // 示例实现：
    return {
      async fetch(additionalOptions: Partial<FetchOptions> = {}) {
        const mergedOptions: FetchOptions = {
          context: {
            locale: 'zh-CN',
            siteId: 1,
            ...options.context,
            ...additionalOptions.context,
          },
          params: {
            ...options.params,
            ...additionalOptions.params,
          },
          query: {
            ...options.query,
            ...additionalOptions.query,
          },
        }
        return fetchPageData(schema, mergedOptions)
      },
    }
  }
}
