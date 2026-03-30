# 分类分页探测并发优化验证指南

## 优化内容
将分类分页总页数探测从**顺序执行**改为**最多 4 并发**执行，压低 games sitemap 分片生成的尾延迟。

## 关键改动
- **文件**: `src/lib/sitemap/fetchers.ts`
- **函数**: `getGameCategoryMeta()` 
- **优化前**: 21 个分类逐个探测，可能需要 ~2-3 秒
- **优化后**: 4 并发池轮询，预期 ~600-800ms

## 验证步骤

### 1. 启动开发服务器
```bash
cd Next-web
pnpm dev
```

等待启动完成，通常显示：
```
> ready - started server on 0.0.0.0:3000
```

### 2. 测试 games sitemap 分片 API

#### 方式 A：使用测试脚本（推荐）
```bash
# 测试 zh-CN locale 的 games 分片 1
node scripts/test-sitemap-concurrency.js http://localhost:3000 zh-CN games 1

# 测试多个分片（自动测 1 和 2）
node scripts/test-sitemap-concurrency.js http://localhost:3000 zh-CN games
```

#### 方式 B：使用 curl
```bash
# 单个请求，测量响应时间
time curl -s "http://localhost:3000/api/sitemap/zh-CN-games-1.xml" | wc -l

# 或更详细的时间统计
curl -w "\nTime: %{time_total}s\nSize: %{size_download} bytes\n" \
  -s "http://localhost:3000/api/sitemap/zh-CN-games-1.xml" | head -20
```

#### 方式 C：浏览器开发者工具
1. 打开浏览器 DevTools（F12）
2. 切换到 Network 标签
3. 访问 `http://localhost:3000/api/sitemap/zh-CN-games-1.xml`
4. 观察：
   - Response time
   - Total size
   - Number of URLs (count `<url>` tags)

### 3. 检查 console 日志（可选）

在 VS Code terminal 中查看 Next.js 服务器日志：
```
[Sitemap] 开始获取游戏列表...
[Sitemap] 游戏API响应: { code: 200, total: N, rowsLength: M, ... }
[API请求] /categories/[id]/games ... pageSize=24 pageNum=1    ← 分类探测开始
[API请求] /categories/[id]/games ... pageSize=24 pageNum=2    ← 并发执行
[API请求] /categories/[id]/games ... pageSize=24 pageNum=3
[API请求] /categories/[id]/games ... pageSize=24 pageNum=4
```

**关键观察**：
- 【优化前】请求顺序排列，间隔约 100-200ms
- 【优化后】前 4 个请求几乎同时发出，后续才依次排队

### 4. 性能指标对比

#### 优化前（顺序）
- 每个分类探测 1-3 个 HTTP 调用
- 21 分类 × ~150ms 平均 = ~3150ms
- 首个 games chunk XML 生成时间：**3-5 秒**

#### 优化后（4 并发）
- 21 分类分成 6 批（每批 ~4 个）
- 6 批 × ~150ms = ~900ms
- 首个 games chunk XML 生成时间：**600-1000ms**

**预期改进**: **60-70% 更快**，尾延迟显著降低

### 5. 验证检查清单

- [ ] TypeScript 编译无错误 (`pnpm tsc --noEmit`)
- [ ] 开发服务器正常启动 (`pnpm dev`)
- [ ] `/api/sitemap/zh-CN-games-1.xml` 正常返回（status 200）
- [ ] XML 包含 `<url>` 标签（游戏详情页 + 分类分页页）
- [ ] 响应时间 < 1.5 秒（预期 600-1000ms）
- [ ] 其他语言 locale 也正常工作（zh-TW, en-US）
- [ ] `/sitemap.xml` 主索引快速返回（< 100ms）

### 6. 如果遇到问题

| 问题 | 可能原因 | 解决方案 |
|------|--------|---------|
| 请求超时（>30s） | 并发限制未生效 | 检查 `fetchers.ts` 中 `withConcurrencyLimit()` 是否正确导入 |
| 类型错误 | 类型标注缺失 | 运行 `pnpm tsc --noEmit` 检查 |
| 返回 0 个 URL | 分类查询失败 | 检查 API 是否正常响应，查看 console 错误日志 |
| 响应时间无改进 | 60 秒缓存生效 | 重启服务器或等待缓存过期后重新测试 |

## 核心代码

### 新增工具函数
```typescript
// 并发限制执行器，限制同时任务数为 concurrency（默认 4）
async function withConcurrencyLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number = 4
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let index = 0

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++
      results[currentIndex] = await fn(items[currentIndex])
    }
  }

  const workers = Array(Math.min(concurrency, items.length))
    .fill(0)
    .map(() => worker())

  await Promise.all(workers)
  return results
}
```

### 修改后的分类元数据获取
```typescript
async function getGameCategoryMeta(locale: string): Promise<GameCategoryMeta[]> {
  const categoriesResponse = await ApiClient.getCategories({
    categoryType: 'game',
    locale: locale as any,
  })

  const categories = (categoriesResponse.data || []) as any[]

  // 使用并发限制（4 并发）探测每个分类的页数，压低尾延迟
  const totalPagesArray = await withConcurrencyLimit(
    categories,
    (category: any) => resolveCategoryTotalPages(category.id, locale),
    4
  )

  const result: GameCategoryMeta[] = categories.map((category: any, idx: number) => ({
    slug: String(category.slug || category.id),
    totalPages: totalPagesArray[idx] || 1,
  }))

  return result
}
```

## 相关链接

- Issue history: Root sitemap 28+ sec → lightweight index
- API optimization: 60-sec metrics cache
- Games chunking: 2000 URLs per file

## 下一步优化方向

1. **可选**：降低并发限制常数（从 4 → 3）观察是否有进一步改进
2. **可选**：为分类探测添加超时（如 5 秒）防止卡住
3. **验证**：在生产环境（Vercel 或自部署）测试实际效果
