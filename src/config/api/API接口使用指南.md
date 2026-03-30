# API接口使用指南

> 版本：v1.0.0  
> 日期：2025-12-24  
> 适用范围：Next-web前端项目

---

## 📑 目录

- [1. 快速开始](#1-快速开始)
- [2. 基础配置](#2-基础配置)
- [3. API调用示例](#3-api调用示例)
- [4. 错误处理](#4-错误处理)
- [5. 类型定义](#5-类型定义)
- [6. 常见问题](#6-常见问题)

---

## 1. 快速开始

### 1.1 导入API工具

```typescript
import { backendConfig, apiEndpoints, getApiUrl, getHeaders } from '@/config'
```

### 1.2 发起API请求

```typescript
// 方式1: 使用预定义的端点
const response = await fetch(getApiUrl('articles'), {
  headers: getHeaders()
})

// 方式2: 直接使用baseURL
const response = await fetch(`${backendConfig.baseURL}/api/articles`, {
  headers: getHeaders()
})
```

---

## 2. 基础配置

### 2.1 API地址配置

**方式1：环境变量（推荐）**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**方式2：直接修改配置文件**

```typescript
// config/api/backend.ts
export const backendConfig: BackendConfig = {
  baseURL: 'http://localhost:8080',
  timeout: 10000,
}
```

### 2.2 API端点定义

```typescript
// config/api/backend.ts
export const apiEndpoints: ApiEndpoints = {
  // 文章相关
  articles: '/api/articles',
  articleDetail: '/api/articles/{id}',
  
  // 游戏相关
  games: '/api/games',
  gameDetail: '/api/games/{id}',
  
  // 盒子相关
  boxes: '/api/boxes',
  boxDetail: '/api/boxes/{id}',
  
  // 策略相关
  strategies: '/api/strategies',
  strategyDetail: '/api/strategies/{id}',
  
  // 搜索
  search: '/api/search',
  
  // 首页配置
  homeConfig: '/api/config/home',
}
```

### 2.3 请求头配置

```typescript
// 默认请求头
export function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  }
}

// 带认证的请求头
export function getAuthHeaders(token: string): HeadersInit {
  return {
    ...getHeaders(),
    'Authorization': `Bearer ${token}`,
  }
}
```

---

## 3. API调用示例

### 3.1 获取列表数据

```typescript
async function getArticles(params: {
  page: number
  size: number
  categoryType?: string
}) {
  const url = new URL(getApiUrl('articles'))
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })
  
  const response = await fetch(url.toString(), {
    headers: getHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch articles')
  }
  
  return response.json()
}
```

### 3.2 获取详情数据

```typescript
async function getArticleDetail(id: string) {
  const url = getApiUrl('articleDetail').replace('{id}', id)
  
  const response = await fetch(url, {
    headers: getHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch article detail')
  }
  
  return response.json()
}
```

### 3.3 提交表单数据

```typescript
async function createArticle(data: ArticleInput) {
  const response = await fetch(getApiUrl('articles'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create article')
  }
  
  return response.json()
}
```

### 3.4 上传文件

```typescript
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(getApiUrl('upload'), {
    method: 'POST',
    body: formData,
    // 注意：上传文件时不要设置Content-Type，让浏览器自动设置
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload file')
  }
  
  return response.json()
}
```

---

## 4. 错误处理

### 4.1 统一错误处理

```typescript
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.msg || 'API请求失败')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}
```

### 4.2 错误类型

```typescript
interface ApiError {
  code: number
  msg: string
  timestamp: number
}

// 使用示例
try {
  const data = await apiRequest('/api/articles')
} catch (error) {
  if (error instanceof Error) {
    console.error('错误信息:', error.message)
  }
}
```

### 4.3 重试机制

```typescript
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<T> {
  try {
    return await apiRequest<T>(url, options)
  } catch (error) {
    if (retries > 0) {
      console.log(`重试请求，剩余次数: ${retries}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}
```

---

## 5. 类型定义

### 5.1 配置类型

```typescript
export interface BackendConfig {
  baseURL: string
  timeout: number
}

export interface ApiEndpoints {
  articles: string
  articleDetail: string
  games: string
  gameDetail: string
  boxes: string
  boxDetail: string
  strategies: string
  strategyDetail: string
  search: string
  homeConfig: string
  [key: string]: string
}
```

### 5.2 响应类型

```typescript
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  timestamp: number
}

export interface PageResult<T> {
  total: number
  rows: T[]
}
```

### 5.3 实体类型示例

```typescript
export interface Article {
  id: string
  title: string
  content: string
  categoryType: string
  createTime: string
  updateTime: string
}

export interface Game {
  id: string
  name: string
  iconUrl: string
  categoryType: string
  downloadCount: number
}
```

---

## 6. 常见问题

### 6.1 CORS跨域问题

**问题：** 浏览器报 CORS 错误

**解决方案：**

1. **开发环境：** 使用 Next.js 的 rewrites 功能代理请求

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
}
```

2. **生产环境：** 让后端添加 CORS 头

```java
// Spring Boot
@CrossOrigin(origins = "https://yourdomain.com")
```

### 6.2 环境变量不生效

**问题：** 修改了 `.env.local` 但是没有生效

**解决方案：**

1. 重启开发服务器
2. 确保环境变量以 `NEXT_PUBLIC_` 开头（客户端可访问）
3. 清除 `.next` 缓存目录

### 6.3 API超时

**问题：** 请求经常超时

**解决方案：**

```typescript
// 增加超时时间
export const backendConfig: BackendConfig = {
  baseURL: 'http://localhost:8080',
  timeout: 30000, // 30秒
}

// 使用AbortController实现超时
async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: getHeaders(),
    })
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}
```

### 6.4 认证问题

**问题：** 需要添加认证信息

**解决方案：**

```typescript
// 1. 扩展getHeaders函数
export function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// 2. 使用示例
const token = localStorage.getItem('token')
const response = await fetch(getApiUrl('articles'), {
  headers: getAuthHeaders(token),
})
```

### 6.5 缓存问题

**问题：** 数据没有实时更新

**解决方案：**

```typescript
// Next.js App Router 中使用 revalidate
export const revalidate = 30 // 30秒重新验证

// 或者使用 no-store 禁用缓存
const response = await fetch(url, {
  cache: 'no-store',
  headers: getHeaders(),
})

// 或者使用 next.revalidate 选项
const response = await fetch(url, {
  next: { revalidate: 60 },
  headers: getHeaders(),
})
```

---

## 📚 相关文档

- [完整API接口文档](../../docs/API/API接口文档.md) - 后端API详细规范
- [接口变更记录](../../docs/API/接口变更记录.md) - API版本变更历史
- [API配置说明](./README.md) - 配置文件结构说明
- [配置系统总览](../README.md) - 整体配置系统架构

---

## 💡 最佳实践

### 1. 使用TypeScript类型

始终为API请求和响应定义类型，提高代码可维护性。

### 2. 统一错误处理

在全局层面处理API错误，避免在每个组件中重复错误处理逻辑。

### 3. 使用环境变量

不要在代码中硬编码API地址，使用环境变量管理不同环境的配置。

### 4. 合理使用缓存

根据数据更新频率合理设置缓存策略，平衡性能和数据实时性。

### 5. 接口版本管理

使用版本号管理API接口，避免破坏性变更影响现有功能。

---

**更新时间：** 2025-12-24  
**维护者：** Game Box Team
