# API配置目录

## 📁 目录结构

```
config/api/
├── index.ts      # 统一导出
└── backend.ts    # 后端API配置
```

## 📝 文件说明

### backend.ts - 后端API配置

**包含内容：**
- API Base URL
- 接口端点列表
- 请求头配置
- 超时设置
- 错误处理

**使用示例：**
```typescript
import { backendConfig, getApiUrl } from '@/config/api'

// 获取完整的API URL
const articlesUrl = getApiUrl('articles')
console.log(articlesUrl)  // 'http://localhost:8080/api/articles'

// 获取请求头
const headers = getHeaders()
```

## 🚀 使用指南

### 修改API地址

```typescript
// config/api/backend.ts
export const backendConfig: BackendConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
}
```

**或者通过环境变量：**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 添加新的API端点

```typescript
// config/api/backend.ts
export const apiEndpoints: ApiEndpoints = {
  // ...现有端点
  newEndpoint: '/api/new-endpoint',
}
```

### 自定义请求头

```typescript
// config/api/backend.ts
export function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value',
  }
}
```

## 📚 相关文档

- [配置系统总览](../README.md)
- [快速入门指南](../QUICKSTART.md)
