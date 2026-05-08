# 🧭 主站 + 子站 SEO 架构调整 — 历史执行方案（单子站试跑阶段）

> **生成日期**：2026-04-17
> **状态**：历史归档（单子站试跑阶段样例，不再作为当前执行标准）
> **范围**：Next-web（主站）、Next-web-sub（子站）、后端配置

> ⚠️ 本文件记录的是 2026-04 的“单子站试跑阶段”执行方案。当前标准已升级为“多候选子站矩阵 + 单站 7 仓位起步”，请优先参考 [SEO流量战略.md](../01-战略/SEO流量战略.md)、[候选子站登记表.md](../02-规划/候选子站登记表.md) 和 [单站7仓位排期模板.md](../02-规划/单站7仓位排期模板.md)。本文件中的 `SITE_ID=8` 仅代表当时的试跑站 A 样例。

---

## 零、现状摘要

| 维度 | 主站（5awyx.com） | 历史试跑子站A（kapai-web.94kj.cn） |
|------|-------------------|--------------------------|
| SITE_ID | 1 | 8（历史示例站A） |
| 路由 | `/games` `/boxes` `/content/{guides,reviews,topics}` `/news` `/search` `/01zhe` `/rank` `/tag` | `/games` `/boxes` `/guides` `/reviews` `/news` `/tag` |
| 内容类型 | 资讯(news)、攻略(guides)、评测(reviews)、专题(topics) | 攻略(guides)、评测(reviews)、资讯(news) |
| 子站→主站链接 | — | ✅ 已全面铺开（Header/Footer/Hero/下载入口/canonical） |
| 主站→子站链接 | ⚠️ 基础设施就位（GameGuides/CategoryGuides 的 subSiteUrl prop），但**全局未配置子站域名** | — |
| jumpDomain | ✅ `https://www.5awyx.com`（主站自身域名，用于 Markdown 模板变量替换） | ✅ `https://www.5awyx.com` |

---

## 一、整体策略对齐

```
当前标准：
主站 = 转化中心（产品站）
多候选子站 = SEO试跑矩阵（项目层）
单个子站 = 单小类目 + 7 仓位起步（站内层）

本文件对应的是其中一个历史试跑站A样例。
```

---

## 二、代码改动清单

按优先级排列：P0 = 必须做（影响转化路径）；P1 = 应该做（完善分工）；P2 = 可选（锦上添花）。

---

### P0-1：主站配置 — 修正 jumpDomain ✅ 已完成

**结论**：`jumpDomain` 已修正；`subSiteUrl` 全局配置**不添加**（原因见下）。

**已执行改动**：

`Next-web/src/config/customize/site.ts`
```diff
- jumpDomain: 'https://download.example.com',
+ jumpDomain: 'https://www.5awyx.com',
```

`Next-web/src/components/content/MarkdownRenderer.tsx`
```diff
- .replace(/\{\{siteConfig\.jumpDomain\}\}/g, '#')
+ .replace(/\{\{siteConfig\.jumpDomain\}\}/g, siteConfig.jumpDomain)
```

**关于 `subSiteUrl` 不加的原因**：  
主站跳向子站的链接由服务端 API 数据决定，游戏 A 可能跳子站 X、游戏 B 可能跳子站 Y，并非固定的单一子站 URL。  
`jumpDomain` 变量在主站语境下的正确语义是"Markdown 文章模板里的跳转域名指向主站自身"，与子站无关。

**验证**：
- 主站 Markdown 文章中 `{{siteConfig.jumpDomain}}` 正确替换为 `https://www.5awyx.com`（不再渲染为 `#`）

---

### P0-2：主站游戏详情页 — 激活攻略入口组件 ❌ 取消

**取消原因**：每款游戏对应哪个子站（或是否有子站）由服务端 API 下发决定，不是所有游戏都归属同一个子站。  
不存在一个全局 `subSiteUrl` 可以作为通用 fallback，强行 fallback 会导致不相关游戏出现错误的子站链接。  

**结论**：`GameGuides` / `CategoryGuides` 的 `subSiteUrl` prop 继续保持由后端 API 数据驱动，前端不做改动。

---

### P0-3：子站文章内链规范 — 确保每篇文章链回主站

**问题**：子站文章内链到主站依赖 `{{siteConfig.jumpDomain}}` 模板变量，需确保所有新文章都包含。  
**方案**：这是**内容发布规范**层面的要求，不需要代码改动，但需更新发布指南。

**改动文件**：`Next-web/docs/seo/03-执行/内容发布指南.md`

新增子站发布规则：

```markdown
### 子站文章内链强制要求（每篇必须）

1. 至少链接 1-3 个主站游戏页：`https://www.5awyx.com/games/[id]`
2. 推荐链接主站盒子页：`https://www.5awyx.com/boxes/[id]`
3. 使用 Markdown 模板变量：`[游戏名]({{siteConfig.jumpDomain}}/games/123)`
4. 禁止：文章内直接放 APK 下载链接
```

---

### P1-1：主站内容降级策略 — 区分功能型 vs SEO型文章 ❌ 代码部分取消

**取消原因**：子站引导条依赖全局 `subSiteUrl`，而主站面向多个子站，无法固定单一 URL 写死在代码里。该入口应由后端配置驱动，前端代码暂不改动。

**保留的操作规范**（无代码改动）：
1. **停止在主站发布新的深度攻略文章** — 后台操作规范，攻略文章只发到对应子站
2. 不删除主站已有文章，自然降权即可

---

### P1-2：主站 robots.txt — 对攻略类页面降权（可选）

**问题**：主站攻略与子站攻略可能存在关键词竞争。  
**方案**：**不建议 noindex 已有文章**（会损失已有收录），但可以：

- 在主站攻略类文章的 `<meta>` 中不再主动优化关键词密度
- 新攻略类文章统一发布到子站

**结论**：无代码改动，纯操作规范。

---

### P1-3：子站新增内容板块 — 支持卡牌深度内容类型

**问题**：当前子站 section 仅有 guides / reviews / news，缺少"卡组推荐"、"Meta分析"、"FAQ"等卡牌特色内容类型。  
**方案分两步**：

#### 步骤 A：后端 — 新增 Section Slug（数据库操作）

在 `gb_categories` 表新增子站专属板块 slug：

```sql
-- 为当前候选子站新增特色板块（以下以历史示例 SITE_ID=8 演示，实际要替换成当前站点的 SITE_ID）
-- 以下为示例，实际 parent_id/sort_order 需对照现有数据
INSERT INTO gb_categories (site_id, name, slug, category_type, is_section, parent_id, sort_order)
VALUES
  (8, '卡组推荐', 'deck-builds', 'article', 1, 0, 10),
  (8, 'Meta分析', 'meta-analysis', 'article', 1, 0, 20),
  (8, 'FAQ', 'faq', 'article', 1, 0, 30);
```

> ⚠️ 此操作需要在后台管理界面或数据库中执行，建议先用后台界面创建分类。

#### 步骤 B：前端 — 子站新增页面路由

如果需要独立的列表页，需新增：

```
Next-web-sub/src/app/[locale]/decks/page.tsx       ← 卡组推荐列表
Next-web-sub/src/app/[locale]/decks/[slug]/page.tsx ← 卡组详情
Next-web-sub/src/app/[locale]/meta/page.tsx         ← Meta分析列表
Next-web-sub/src/app/[locale]/meta/[slug]/page.tsx  ← Meta分析详情
```

**评估**：此改动工作量较大。**替代方案**：先不加新路由，新内容类型统一使用 `/guides/[slug]` 路由，通过 section slug 分类即可。待内容量上来后再拆分为独立路由。

**建议**：先用 `/guides/` 承载所有深度内容，标记不同 section slug 即可 → **零代码改动**。

---

### P1-4：子站首页 — 增强"单小类目 / 游戏攻略聚合"入口

**问题**：子站首页目前展示"热门攻略"和"热门游戏"，缺少按游戏维度的攻略聚合入口。  
**方案**：在子站首页增加"热门游戏攻略专区"板块。

**改动文件**：`Next-web-sub/src/app/[locale]/page.tsx`

新增一个板块，按游戏维度聚合攻略：

```tsx
{/* 单游戏攻略入口 — 例如 Marvel Snap / 炉石传说 */}
<section>
  <h2>热门游戏攻略专区</h2>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {featuredGames.map(game => (
      <GameGuideCard
        key={game.id}
        game={game}
        guideCount={game.articleCount}
        href={`/tag/${game.slug}`}  {/* 利用现有 tag 页做聚合 */}
      />
    ))}
  </div>
</section>
```

> 利用已有的 `/tag/[tag]` 页面做游戏维度聚合，无需新增路由。

**工作量**：中等（需新增 1 个组件 + 修改首页）。

---

### P1-5：关键词分配 — 更新 SEO 文档

**问题**：现有 SEO 文档未明确标注"哪个关键词归哪个站"。  
**方案**：更新 `内容发布指南.md` 和 `SEO流量战略.md`。

**改动文件**：`Next-web/docs/seo/03-执行/内容发布指南.md`

新增关键词分配表：

```markdown
## 关键词归属（严格执行，同一关键词只许一个站做主）

| 关键词类型 | 归属站 | 示例 |
|-----------|--------|------|
| 品牌词 | 主站 | 我爱玩游戏 / 5awyx |
| 游戏名 + 下载 | 主站 | Marvel Snap下载 |
| 游戏名 + 官网 | 主站 | 炉石传说官网 |
| 游戏盒子 / 0.1折 | 主站 | 游戏盒子推荐 / 0.1折手游 |
| 游戏名 + 攻略 | 子站 | Marvel Snap攻略 |
| 游戏名 + 卡组 | 子站 | 炉石传说最强卡组 |
| 教程 / 上分 / 入坑 | 子站 | 卡牌游戏入坑指南 |
| 游戏名 + 怎么玩 | 子站 | Marvel Snap怎么玩 |
| Meta / 版本分析 | 子站 | 炉石传说当前版本T1卡组 |
| 卡牌游戏推荐 | 子站 | 2026最好玩的卡牌手游 |
```

---

### P2-1：子站游戏详情页 — 移除下载功能暗示

**问题**：子站有 `/games/[id]` 和 `/boxes/[id]` 页面，当前 canonical 已指向主站（正确），但页面本身可能包含下载按钮。  
**方案**：检查子站游戏/盒子详情页，确保下载类按钮都指向主站（而非直接下载）。

**验证**：子站游戏详情页的所有 CTA 按钮都是 `target="_blank"` 跳转到主站对应页面。

**预判**：根据现有代码分析，子站 `DownloadBox` 组件已链接到主站盒子页，可能已满足。需实际检查确认。

---

### P2-2：主站分类页 — 增加子站攻略入口 ❌ 取消

**取消原因**：同 P0-2 / P1-1。分类对应哪个子站由后端 API 决定，`CategoryGuides` 的 `subSiteUrl` prop 继续由服务端数据驱动，前端不添加全局 fallback。

---

### P2-3：子站 Sitemap — 对齐 maxUrlsPerSitemap

**改动文件**：`Next-web-sub/src/app/sitemap.ts`

```diff
- const maxUrlsPerSitemap = 50000
+ const maxUrlsPerSitemap = 10000
```

**原因**：与主站对齐，更安全。

---

## 三、不需要代码改动的策略变更

以下是**纯操作/内容层面**的调整，不涉及代码：

| # | 策略变更 | 执行方式 |
|---|---------|---------|
| 1 | 主站停止发布深度攻略类文章 | 后台操作规范 — 攻略文章只发到对应候选子站（按登记表确认 SITE_ID） |
| 2 | 子站文章每篇至少链接1-3个主站游戏页 | AI工作流 Step 4 提示词中加入要求 |
| 3 | 不做重复内容 | 发文前检查内容追踪矩阵 |
| 4 | 发布节奏：前2~3周按单站 7 仓位 Weekly Silo 起跑，再看早期数据 | 人工执行 |
| 5 | 候选子站优先“单小类目 + 7 仓位试跑”策略 | 先选 1 个小类目，站内覆盖 6~12 款关联游戏 / 问题词，先看谁冒头 |

---

## 四、改动优先级排序

```
第一批（已完成）
├── P0-1  ✅ jumpDomain 修正 + MarkdownRenderer 模板变量修复
├── P0-2  ❌ 取消（主→子链接由后端 API 驱动，无全局单一子站 URL）
├── P0-3  ✅ 内容发布指南新增子站内链规则（含模板变量写法 + APK禁止）
└── P1-5  ✅ 内容发布指南新增关键词归属表

第二批（已完成）
├── P1-1  ❌ 代码部分取消（原因同 P0-2）；操作规范部分保留
├── P2-2  ❌ 取消（原因同 P0-2）
└── P2-3  ✅ 子站 sitemap maxUrlsPerSitemap 改为 10000

第三批（内容量起来后执行）
├── P1-3  子站新增板块 slug（如 deck-builds, meta-analysis）
├── P1-4  子站首页新增"游戏攻略专区"板块
└── P2-1  子站游戏详情页 CTA 检查
```

---

## 五、验证清单

改动完成后，逐项检查：

- [x] 主站 `jumpDomain` 已改为 `https://www.5awyx.com`
- [x] 主站 Markdown 文章中 `{{siteConfig.jumpDomain}}` 正确替换为 `https://www.5awyx.com`（`MarkdownRenderer.tsx` 已修复，不再渲染为 `#`）
- [x] 内容发布指南新增关键词归属表（主站/子站各守各的关键词方向）
- [x] 内容发布指南子站内链规则补充模板变量写法 + APK 直链禁止规定
- [x] 子站 sitemap `maxUrlsPerSitemap` 已改为 10000（与主站对齐）
- [x] 子站 MarkdownRenderer 模板变量 `{{siteConfig.jumpDomain}}` 正确替换为主站域名（2026-04-18 修复）
- [x] 子站 DownloadBox 和 ArticleLayout CTA 按钮直接链接主站并添加 `nofollow`（2026-04-18 修复）
- [x] 主站内链枢纽页 `/01zhe/`、`/rank/`、`/tag/[tag]/` 已完整实现（2026-04-18 确认）
- [ ] 子站攻略文章 → 包含指向 `www.5awyx.com/games/[id]` 的链接（操作规范，人工执行）
- [ ] 子站游戏详情页 → canonical 指向主站（已有，确认未变）
- ~~主站游戏详情页攻略入口~~ — 由后端 API 数据驱动，不在前端写死
- ~~主站攻略列表页子站引导条~~ — 由后端 API 数据驱动，不在前端写死
- [ ] 同一关键词没有在两站同时出现文章

---

## 六、风险与注意事项

1. **不删除主站已有文章** — 已收录的页面删除会导致 404 和排名下降
2. **子站 canonical 指向主站** — 游戏/盒子详情页已做，确保不动
3. **robots.txt 不变** — 不对主站攻略页做 noindex，自然降权即可
4. **渐进式调整** — 先改配置和文档，再改 UI 组件，最后加新板块

---

> 📝 审核通过后告知我，我将按优先级顺序开始实施代码改动。
