# Cloudflare 首页缓存方案对比

## 当前状态

**现在的配置**（最新修改）：
```typescript
// [locale]/page.tsx
export const revalidate = 0
export const dynamic = 'force-dynamic'

// lib/api.ts getHomeData()
cache: 'no-store' as const
```

**HTTP 响应头**：`Cache-Control: no-cache, no-store, must-revalidate`

**效果**：
- ✅ 完全实时更新（每次都请求后端）
- ❌ Cloudflare 不缓存任何内容
- ❌ 每次交互都是实际请求，性能较差

---

## 可行方案总览

| 方案 | 首页缓存 | 数据更新延迟 | 手动清缓存 | 实现难度 | 推荐度 |
|-----|--------|----------|---------|--------|-------|
| **方案 A** | 1小时 | 1小时 | 否 | ⭐ | ⭐⭐⭐ |
| **方案 B** | 60秒 | 60秒 | 否 | ⭐ | ⭐⭐⭐⭐ |
| **方案 C** | 否 | 实时 | 是 | ⭐⭐⭐ | ⭐⭐ |
| **方案 D** | 页面壳 | API 实时 | 否 | ⭐⭐ | ⭐⭐⭐⭐ |
| **方案 E** | Redis + CF | 60秒 | 是 | ⭐⭐⭐ | ⭐ |

---

## 方案详解

### 方案 A：长期缓存 (1小时)

**配置**：
```typescript
// [locale]/page.tsx
export const revalidate = 3600  // 1小时
export const dynamic = 'force-dynamic'

// lib/api.ts
// 改为 HTTP 头方式
return request('/api/public/home', {
  // ...
  headers: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600'
  }
})
```

**效果**：
| 指标 | 值 |
|-----|-----|
| 首页加载时间 | 50-200ms（缓存命中） |
| 数据更新延迟 | 0-3600秒 |
| Cloudflare 利用率 | 最高 |
| 用户体验 | 极快 |
| 数据新鲜度 | 低 |

**优点**：
- ✅ 最快的加载速度
- ✅ Cloudflare 流量使用最少（节省成本）
- ✅ 后端压力最小
- ✅ 简单易实现

**缺点**：
- ❌ 如果后端数据在 1 小时内更新，用户看不到最新内容
- ❌ 需要手动调用 Cloudflare API 清缓存，才能立即生效

**适用场景**：
- 非常稳定的内容（热门游戏排行、推荐等）
- 可以接受 1 小时延迟的应用

---

### 方案 B：中期缓存 (60秒) ⭐ 推荐

**配置**：
```typescript
// [locale]/page.tsx
export const revalidate = 60
export const dynamic = 'force-dynamic'

// lib/api.ts
// 使用 HTTP 头
headers: {
  'Cache-Control': 'public, max-age=60, s-maxage=60'
}
```

**效果**：
| 指标 | 值 |
|-----|-----|
| 首页加载时间 | 50-200ms（缓存命中） |
| 数据更新延迟 | 0-60秒 |
| Cloudflare 利用率 | 很高 |
| 用户体验 | 很快 |
| 数据新鲜度 | 中等 |

**优点**：
- ✅ 加载速度仍然很快（50-200ms）
- ✅ 数据更新延迟可接受（不超过 1 分钟）
- ✅ 后端 Redis 缓存配合（60s TTL） = 完美匹配
- ✅ 简单易实现，无需清缓存逻辑
- ✅ 与后端缓存策略一致

**缺点**：
- ❌ 新数据有 60 秒内的延迟

**适用场景**：
- **最推荐方案** - 游戏推广系统最适合
- 内容更新频率中等（每分钟几次）
- 用户可以接受 1 分钟内的数据延迟

---

### 方案 C：实时更新 + 手动清缓存

**配置**：
```typescript
// [locale]/page.tsx
export const revalidate = 0
export const dynamic = 'force-dynamic'

// lib/api.ts
cache: 'no-store' as const

// 后端新增接口：清理 Cloudflare 缓存
POST /api/admin/cache/invalidate/homepage
```

**效果**：
| 指标 | 值 |
|-----|-----|
| 首页加载时间 | 500-2000ms（完全实时） |
| 数据更新延迟 | 0秒（手动操作后立即生效） |
| Cloudflare 利用率 | 几乎不使用 |
| 用户体验 | 一般 |
| 数据新鲜度 | 最高 |

**优点**：
- ✅ 完全实时更新
- ✅ 通过调用 Cloudflare API 可以立即清缓存

**缺点**：
- ❌ 加载速度慢（完全实时请求）
- ❌ 需要实现后端清缓存接口
- ❌ 需要集成 Cloudflare API（需要 API Token）
- ❌ Cloudflare 每月清缓存次数有限制（默认 30 次/月）

**适用场景**：
- 高度实时性要求的系统（如库存、价格）
- 更新频率低（每天才更新几次）

---

### 方案 D：混合方案 - 页面壳缓存 + API 实时 ⭐⭐ 推荐

**核心思路**：
- 首页 HTML 壳子缓存（由 Cloudflare 缓存）
- 页面内的数据通过 AJAX 实时请求

**配置**：
```typescript
// [locale]/page.tsx
export const revalidate = 60

// lib/api.ts 保持 no-store（用于前端 AJAX 请求）
cache: 'no-store' as const

// 在页面中：
export default async function Page() {
  // 使用 Suspense + 客户端 fetch 获取实时数据
  return (
    <>
      {/* 页面壳子 - 60秒缓存 */}
      <Header />
      <Navigation />
      
      {/* 实时数据 - 客户端加载 */}
      <Suspense fallback={<Skeleton />}>
        <HomeDataContent />
      </Suspense>
    </>
  )
}
```

**效果**：
| 指标 | 值 |
|-----|-----|
| 首页加载时间 | 50-200ms（返回缓存壳子） |
| 数据加载时间 | 选项1：500-2000ms（实时）或选项2：60秒内 |
| 数据更新延迟 | 0-60秒（取决于客户端刷新频率） |
| Cloudflare 利用率 | 高 |
| 用户体验 | 很好（快速 FCP，渐进式加载） |
| 数据新鲜度 | 高 |

**优点**：
- ✅ 页面加载快（Cloudflare 缓存）
- ✅ 数据可以实时或近实时更新
- ✅ 用户看到快速的首屏（FCP < 200ms）
- ✅ 不需要手动清缓存
- ✅ UX 体验好（skeleton loading）

**缺点**：
- ❌ 实现复杂度高（需要拆分 SSR 和 CSR）
- ❌ 需要在客户端添加 Suspense 和骨架屏

**适用场景**：
- 追求极致用户体验
- 想要快速首屏 + 实时数据
- 内容较多，需要渐进式加载

---

### 方案 E：如何配合后端 Redis 清缓存

**原理**：利用后端的 `StatisticsCacheEvictAspect` 自动清理缓存

**配置**：
```typescript
// [locale]/page.tsx
export const revalidate = 60

// lib/api.ts
headers: {
  'Cache-Control': 'public, max-age=60, s-maxage=60'
}

// 后端 Java 保持不变：
// - Redis 60秒 TTL
// - @Log 自动清理 public:home:* 的缓存
```

**联动逻辑**：
1. 用户访问首页 → Cloudflare 缓存 60 秒
2. 数据更新 → 后端 aspect 清理 Redis
3. 如果有人在 Redis 失效后访问 → 后端查询最新数据，缓存到 Redis
4. Cloudflare 仍然返回旧缓存（直到 60 秒过期）
5. 60 秒后 → Cloudflare 重新请求后端 → 获得新数据

**效果**：
| 指标 | 值 |
|-----|-----|
| 首页加载时间 | 50-200ms（Cloudflare 缓存） |
| 后端性能 | 非常好（Redis 命中率高） |
| 数据一致性 | 在单个用户角度：不一致（0-60秒） |
| 用户体验 | 很快 |

**缺点**：
- ❌ 前端用户可能看到 60 秒内的旧数据
- ❌ 但这对游戏推广系统通常可以接受

---

## 对比总结表

```
方案A (1小时缓存)
├─ 速度: ████████████ 极快
├─ 成本: ████████████ 最低
├─ 数据新鲜度: ░░░░░░░░░░░░ 差
└─ 推荐: 不推荐

方案B (60秒缓存) ⭐ 最推荐
├─ 速度: ████████████ 很快
├─ 成本: ██████████░░ 低
├─ 数据新鲜度: ████████░░░░ 中等
└─ 推荐: 强烈推荐

方案C (实时+手动清)
├─ 速度: ████░░░░░░░░ 一般
├─ 成本: ░░░░░░░░░░░░ 浪费
├─ 数据新鲜度: ████████████ 极高
└─ 推荐: 特定场景

方案D (混合壳子)
├─ 速度: ████████████ 极快
├─ 成本: ██████░░░░░░ 中等
├─ 数据新鲜度: ████████░░░░ 中高
└─ 推荐: 追求体验时

方案E (后端协同)
├─ 速度: ████████████ 很快
├─ 成本: ██████████░░ 低
├─ 数据新鲜度: ████████░░░░ 中等
└─ 推荐: 与方案B类似
```

---

## 最终建议

### 🎯 立即推荐：采用 **方案 B**（60秒缓存）

**原因**：
1. **最平衡** - 速度快 + 数据相对新鲜
2. **成本效益** - Cloudflare 成本低，后端压力小
3. **与后端匹配** - 前端 60s + 后端 Redis 60s = 完美配合
4. **无需额外开发** - 只需改 `revalidate` 和 HTTP 头
5. **适合游戏推广** - 用户可以接受 60 秒数据延迟

### 实现步骤（方案 B）：

1. **修改首页缓存配置**
   ```typescript
   export const revalidate = 60
   export const dynamic = 'force-dynamic'
   ```

2. **在 api.ts 的某处添加 HTTP 头**
   ```typescript
   // 可以在 request 拦截器中添加
   headers: {
     'Cache-Control': 'public, max-age=60, s-maxage=60'
   }
   ```

3. **验证效果**
   - 使用浏览器开发者工具查看响应头
   - 应该看到 `cf-cache-status: HIT` (Cloudflare 缓存命中)

### 后续优化（可选）：
- **短期（1-2周）** - 改成方案 B，观察效果
- **中期（1-2月）** - 如果需要更快响应，考虑方案 D（混合壳子 + 实时数据）
- **长期** - 考虑前端 Web Worker 缓存数据到本地

---

## 技术细节

### HTTP 头 vs Next.js 配置的区别

| 配置项 | 控制范围 | Cloudflare 能否识别 |
|-------|--------|-------------------|
| `revalidate` | Next.js ISR 重新生成间隔 | ❌ 否 |
| `dynamic = 'force-dynamic'` | 强制动态生成 | ❌ 否 |
| `cache: 'no-store'` | fetch() 缓存策略 | ❌ 否 |
| **HTTP `Cache-Control` 头** | 浏览器 + CDN 缓存 | ✅ 是 |

**结论**：Cloudflare 只看 HTTP 响应头，不看 Next.js 配置。

---

## 关键参数解释

```
Cache-Control: public, max-age=60, s-maxage=60
                │        │          │
                │        │          └─ CDN(Cloudflare) 缓存时间
                │        └────────────── 浏览器缓存时间
                └──────────────────────── 可被任何缓存存储
```

- `public` - 浏览器、代理、CDN 都可以缓存
- `max-age=60` - 浏览器缓存 60 秒
- `s-maxage=60` - **Cloudflare 缓存 60 秒**（s = surrogate，代理）
- `must-revalidate` - 过期后必须向源服务器验证
- `no-cache` - 使用前必须向源服务器验证
- `no-store` - 完全不缓存

