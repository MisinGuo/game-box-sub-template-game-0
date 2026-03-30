# 前端 API 接口文档

> 项目：游戏盒子推广站前端  
> 说明：本文档描述前端需要调用的后端 API 接口  
> 更新日期：2025-12-16

---

## 1. 接口概述

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| **协议** | HTTPS |
| **请求格式** | JSON |
| **响应格式** | JSON |
| **字符编码** | UTF-8 |
| **认证方式** | Token（可选，部分接口需要） |

### 1.2 环境配置

```typescript
// 开发环境
const API_URL = 'http://localhost:8080'

// 生产环境
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com'
```

### 1.3 统一响应格式

```typescript
interface ApiResponse<T> {
  code: number        // 状态码：200 成功，其他失败
  msg: string         // 提示信息
  data: T            // 响应数据
}
```

---

## 2. 游戏盒子相关接口

### 2.1 获取盒子列表

**接口地址**：`GET /api/boxes`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| category | string | 否 | 分类筛选 |
| sort | string | 否 | 排序方式：hot/new/rating |

**请求示例**：

```bash
GET /api/boxes?page=1&pageSize=20&sort=hot
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "name": "游戏盒子A",
        "description": "最新最全的游戏盒子",
        "logo": "https://cdn.example.com/logo.png",
        "rating": 4.5,
        "downloadCount": 10000,
        "features": ["折扣游戏", "BT版", "礼包"],
        "downloadUrl": "https://example.com/download"
      }
    ]
  }
}
```

### 2.2 获取盒子详情

**接口地址**：`GET /api/boxes/{id}`

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 盒子 ID |

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "游戏盒子A",
    "description": "详细描述...",
    "logo": "https://cdn.example.com/logo.png",
    "screenshots": ["url1", "url2"],
    "rating": 4.5,
    "downloadCount": 10000,
    "features": ["折扣游戏", "BT版"],
    "games": [
      {
        "id": 1,
        "name": "游戏1",
        "icon": "icon_url"
      }
    ]
  }
}
```

---

## 3. 游戏相关接口

### 3.1 获取游戏列表

**接口地址**：`GET /api/games`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| category | string | 否 | 游戏分类 |
| keyword | string | 否 | 搜索关键词 |

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 500,
    "list": [
      {
        "id": 1,
        "name": "游戏名称",
        "icon": "icon_url",
        "category": "角色扮演",
        "rating": 4.8,
        "downloadCount": 50000,
        "tags": ["热门", "新游"]
      }
    ]
  }
}
```

### 3.2 获取游戏详情

**接口地址**：`GET /api/games/{id}`

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "游戏名称",
    "icon": "icon_url",
    "description": "游戏描述",
    "screenshots": ["url1", "url2"],
    "category": "角色扮演",
    "rating": 4.8,
    "downloadCount": 50000,
    "size": "500MB",
    "version": "1.0.0",
    "availableBoxes": [
      {
        "boxId": 1,
        "boxName": "盒子A",
        "discount": 8.5,
        "downloadUrl": "url"
      }
    ]
  }
}
```

---

## 4. 文章相关接口（可选）

如果文章内容存储在后端而非本地 Markdown：

### 4.1 获取文章列表

**接口地址**：`GET /api/articles`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| category | string | 否 | 分类：pojie/strategy |
| tag | string | 否 | 标签筛选 |

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 1000,
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "slug": "article-slug",
        "summary": "文章摘要",
        "cover": "cover_url",
        "category": "pojie",
        "tags": ["标签1", "标签2"],
        "publishTime": "2025-01-01T00:00:00Z",
        "viewCount": 1000
      }
    ]
  }
}
```

### 4.2 获取文章详情

**接口地址**：`GET /api/articles/{slug}`

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "title": "文章标题",
    "slug": "article-slug",
    "content": "Markdown 内容...",
    "summary": "摘要",
    "cover": "cover_url",
    "category": "pojie",
    "tags": ["标签1"],
    "publishTime": "2025-01-01T00:00:00Z",
    "viewCount": 1000,
    "relatedArticles": []
  }
}
```

---

## 5. 搜索接口

### 5.1 全局搜索

**接口地址**：`GET /api/search`

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型：all/game/box/article |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**请求示例**：

```bash
GET /api/search?q=传奇&type=all&page=1&pageSize=10
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 50,
    "games": [],
    "boxes": [],
    "articles": []
  }
}
```

---

## 6. 统计接口

### 6.1 记录页面访问

**接口地址**：`POST /api/stats/view`

**请求参数**：

```json
{
  "type": "article",  // article/game/box
  "id": "article-slug",
  "referrer": "https://google.com"
}
```

**响应示例**：

```json
{
  "code": 200,
  "msg": "success",
  "data": null
}
```

### 6.2 记录下载点击

**接口地址**：`POST /api/stats/download`

**请求参数**：

```json
{
  "boxId": 1,
  "gameId": 1,
  "source": "article-page"
}
```

---

## 7. 前端调用示例

### 7.1 封装 API 工具函数

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`)
  }

  const json = await res.json()
  
  if (json.code !== 200) {
    throw new Error(json.msg || 'API Error')
  }

  return json.data
}

// 获取盒子列表
export async function getBoxes(params: {
  page?: number
  pageSize?: number
  sort?: string
}) {
  const query = new URLSearchParams(params as any).toString()
  return fetchAPI<BoxListResponse>(`/api/boxes?${query}`)
}

// 获取游戏详情
export async function getGame(id: number) {
  return fetchAPI<Game>(`/api/games/${id}`)
}
```

### 7.2 在页面中使用

```typescript
// app/boxes/page.tsx
import { getBoxes } from '@/lib/api'

export default async function BoxesPage() {
  const data = await getBoxes({ 
    page: 1, 
    pageSize: 20,
    sort: 'hot' 
  })

  return (
    <div>
      {data.list.map(box => (
        <BoxCard key={box.id} box={box} />
      ))}
    </div>
  )
}
```

### 7.3 客户端调用示例

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getBoxes } from '@/lib/api'

export default function BoxesClient() {
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBoxes({ page: 1 })
      .then(data => setBoxes(data.list))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      {boxes.map(box => (
        <div key={box.id}>{box.name}</div>
      ))}
    </div>
  )
}
```

---

## 8. 错误处理

### 8.1 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 8.2 错误处理示例

```typescript
try {
  const data = await getBoxes({ page: 1 })
  // 处理数据
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message)
    // 显示错误提示
  }
}
```

---

## 9. 注意事项

### 9.1 CORS 配置

如果前后端跨域，需要后端配置 CORS：

```java
// Spring Boot 配置示例
@CrossOrigin(origins = {"https://yourdomain.com"})
```

### 9.2 API 缓存

对于不常变化的数据，建议在前端缓存：

```typescript
export const revalidate = 3600 // Next.js ISR 1小时重新验证
```

### 9.3 请求优化

- 使用 Next.js 的数据预取功能
- 合理使用 SSR/SSG 减少客户端请求
- 对于列表数据，使用分页或无限滚动

---

## 10. 开发调试

### 10.1 Mock 数据

在开发阶段，可以使用 Mock 数据：

```typescript
// lib/mock.ts
export const mockBoxes = [
  {
    id: 1,
    name: "测试盒子",
    // ...
  }
]
```

### 10.2 API 代理（开发环境）

在 `next.config.js` 中配置代理：

```javascript
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

---

## 11. 参考资料

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
