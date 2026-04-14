# Next-web 主项目 SEO 改造验证清单

> 日期：2026-04-01  
> 项目路径：`d:\游戏推广项目\projects\game-box\Next-web\`  
> 验证方法：部署后使用浏览器「查看源代码」或 Google Search Console 检查

---

## 验证方法说明

- **canonical**：`<link rel="canonical" href="...">` 出现在 `<head>` 中
- **hreflang**：`<link rel="alternate" hreflang="..." href="...">` 出现在 `<head>` 中
- **OG**：`<meta property="og:..." content="...">` 出现在 `<head>` 中
- **robots.txt**：访问 `https://www.5awyx.com/robots.txt` 查看输出
- **not-found**：访问一个不存在的 URL（如 `/does-not-exist`）观察页面标题和内容

---

## 第一部分：基础配置

### 1.1 robots.txt 修复
**文件**：`src/app/robots.ts`  
**改动**：将 `disallow: ['/_next/']` 改为只屏蔽 `/_next/webpack-hmr`，允许 `/_next/static/` 和 `/_next/image`

**验证**：访问 `https://www.5awyx.com/robots.txt`

**期望输出**：
```
User-agent: *
Allow: /
Allow: /_next/static/
Allow: /_next/image
Disallow: /api/
Disallow: /admin/
Disallow: /_next/webpack-hmr

Sitemap: https://www.5awyx.com/sitemap.xml
```

- [ ] ✅ 通过 / ❌ 有问题

---

### 1.2 metadataBase 添加
**文件**：`src/app/layout.tsx`  
**改动**：在根 metadata 中添加 `metadataBase: new URL('https://www.5awyx.com')`  
**作用**：确保所有相对路径的 canonical/hreflang URL 被解析为完整域名

**验证**：查看任意页面源码，canonical 和 hreflang 链接应包含完整域名 `https://www.5awyx.com`，而不是相对路径

- [ ] ✅ 通过 / ❌ 有问题

---

### 1.3 根级 404 页面
**文件**：`src/app/not-found.tsx`（**新建**）  
**改动**：创建根级 404 页面，包含 `export const metadata = { title: 'Not Found' }` 和中文提示

**验证**：访问 `https://www.5awyx.com/does-not-exist-abc123`  
**期望**：页面标题显示 "Not Found"，而不是重复 "404 | 404"

- [ ] ✅ 通过 / ❌ 有问题

---

### 1.4 locale 级 404 页面
**文件**：`src/app/[locale]/not-found.tsx`（**新建**）  
**改动**：创建 locale 级 404 页面，包含 `export const metadata = { title: 'Not Found' }`

**验证**：访问 `https://www.5awyx.com/games/does-not-exist-abc123`  
**期望**：页面标题不重复"404 Not Found | Not Found"

- [ ] ✅ 通过 / ❌ 有问题

---

## 第二部分：游戏页面

### 2.1 游戏详情页 - OG + canonical + hreflang
**文件**：`src/app/[locale]/games/[id]/page.tsx`  
**改动**：
- 新增 `getAvailableGameLocales()` 函数（调用 `ApiClient.getArticleLocales`）**（主站与子站最大差异）**
- 添加 OpenGraph 标签（图片、标题、描述）
- 添加 canonical 链接
- 根据游戏实际可用语言版本生成 hreflang（仅在有多语言版本时输出）
- 添加 `x-default` 指向默认语言（zh-CN）版本

**验证**：查看一个游戏详情页源码，例如 `https://www.5awyx.com/games/123`  
检查 `<head>` 中是否存在：

```html
<!-- canonical -->
<link rel="canonical" href="https://www.5awyx.com/games/123"/>

<!-- hreflang（仅在该游戏有多语言版本时出现） -->
<link rel="alternate" hreflang="zh-CN" href="https://www.5awyx.com/games/123"/>
<link rel="alternate" hreflang="zh-TW" href="https://www.5awyx.com/zh-TW/games/123"/>
<link rel="alternate" hreflang="en-US" href="https://www.5awyx.com/en-US/games/123"/>
<link rel="alternate" hreflang="x-default" href="https://www.5awyx.com/games/123"/>

<!-- OG -->
<meta property="og:title" content="游戏名称"/>
<meta property="og:image" content="https://..."/>
```

- [ ] ✅ 通过 / ❌ 有问题  
- [ ] hreflang 只在游戏有多语言版本时出现（仅单语言时不出现 hreflang）
- [ ] OG 图片正常显示

---

### 2.2 游戏分类页 - canonical + hreflang
**文件**：`src/app/[locale]/games/category/[slug]/page.tsx`  
**改动**：添加 canonical + 全 3 个语言的 hreflang（分类在所有 locale 存在）

**验证**：查看分类页源码，例如 `https://www.5awyx.com/games/category/rpg`

```html
<link rel="canonical" href="https://www.5awyx.com/games/category/rpg"/>
<link rel="alternate" hreflang="zh-CN" href="https://www.5awyx.com/games/category/rpg"/>
<link rel="alternate" hreflang="zh-TW" href="https://www.5awyx.com/zh-TW/games/category/rpg"/>
<link rel="alternate" hreflang="en-US" href="https://www.5awyx.com/en-US/games/category/rpg"/>
<link rel="alternate" hreflang="x-default" href="https://www.5awyx.com/games/category/rpg"/>
```

- [ ] ✅ 通过 / ❌ 有问题

---

## 第三部分：盒子页面

### 3.1 盒子详情页 - canonical + hreflang
**文件**：`src/app/[locale]/boxes/[id]/page.tsx`  
**改动**：添加 canonical + 全 3 个语言的 hreflang

**验证**：查看盒子详情页源码，例如 `https://www.5awyx.com/boxes/1`

```html
<link rel="canonical" href="https://www.5awyx.com/boxes/1"/>
<link rel="alternate" hreflang="zh-CN" href="https://www.5awyx.com/boxes/1"/>
<link rel="alternate" hreflang="zh-TW" href="https://www.5awyx.com/zh-TW/boxes/1"/>
<link rel="alternate" hreflang="en-US" href="https://www.5awyx.com/en-US/boxes/1"/>
<link rel="alternate" hreflang="x-default" href="https://www.5awyx.com/boxes/1"/>
```

- [ ] ✅ 通过 / ❌ 有问题

---

## 第四部分：内容详情页（攻略/评测/专题/资讯）

> 这 4 类页面均已有 `getAvailableXxxLocales()` 函数，但之前**未将结果用于 hreflang 输出**。本次修复补充了这一步。

### 4.1 攻略详情 - hreflang
**文件**：`src/app/[locale]/content/guides/[slug]/page.tsx`

**验证**：查看一篇攻略源码，例如 `https://www.5awyx.com/content/guides/123`  
**期望**：若该攻略有多语言版本，`<head>` 中出现 hreflang 标签

- [ ] ✅ 通过 / ❌ 有问题
- [ ] 单语言攻略无 hreflang 标签（正确行为）
- [ ] 多语言攻略有正确 hreflang 标签

---

### 4.2 评测详情 - hreflang
**文件**：`src/app/[locale]/content/reviews/[slug]/page.tsx`

**验证**：查看一篇评测源码，例如 `https://www.5awyx.com/content/reviews/123`

- [ ] ✅ 通过 / ❌ 有问题

---

### 4.3 专题详情 - hreflang
**文件**：`src/app/[locale]/content/topics/[slug]/page.tsx`

**验证**：查看一篇专题源码，例如 `https://www.5awyx.com/content/topics/123`

- [ ] ✅ 通过 / ❌ 有问题

---

### 4.4 资讯详情 - hreflang
**文件**：`src/app/[locale]/news/[slug]/page.tsx`

**验证**：查看一篇资讯源码，例如 `https://www.5awyx.com/news/123`

- [ ] ✅ 通过 / ❌ 有问题

---

## 第五部分：列表页

> 所有列表页添加 canonical + 全 3 语言 hreflang + x-default

| # | 页面 | 路径 | canonical 期望 |
|---|------|------|----------------|
| 5.1 | 首页 | `src/app/[locale]/page.tsx` | `/` |
| 5.2 | 游戏列表 | `src/app/[locale]/games/page.tsx` | `/games` |
| 5.3 | 盒子列表 | `src/app/[locale]/boxes/page.tsx` | `/boxes` |
| 5.4 | 资讯列表 | `src/app/[locale]/news/page.tsx` | `/news` |
| 5.5 | 内容中心 | `src/app/[locale]/content/page.tsx` | `/content` |
| 5.6 | 攻略列表 | `src/app/[locale]/content/guides/page.tsx` | `/content/guides` |
| 5.7 | 评测列表 | `src/app/[locale]/content/reviews/page.tsx` | `/content/reviews` |
| 5.8 | 专题列表 | `src/app/[locale]/content/topics/page.tsx` | `/content/topics` |

**验证示例（以资讯列表页 zh-TW 版为例）**：查看 `https://www.5awyx.com/zh-TW/news` 源码

```html
<!-- canonical 指向当前语言版本 -->
<link rel="canonical" href="https://www.5awyx.com/zh-TW/news"/>

<!-- hreflang 列出全部版本 -->
<link rel="alternate" hreflang="zh-CN" href="https://www.5awyx.com/news"/>
<link rel="alternate" hreflang="zh-TW" href="https://www.5awyx.com/zh-TW/news"/>
<link rel="alternate" hreflang="en-US" href="https://www.5awyx.com/en-US/news"/>
<link rel="alternate" hreflang="x-default" href="https://www.5awyx.com/news"/>
```

- [ ] 5.1 首页 ✅ / ❌
- [ ] 5.2 游戏列表 ✅ / ❌
- [ ] 5.3 盒子列表 ✅ / ❌
- [ ] 5.4 资讯列表 ✅ / ❌
- [ ] 5.5 内容中心 ✅ / ❌
- [ ] 5.6 攻略列表 ✅ / ❌
- [ ] 5.7 评测列表 ✅ / ❌
- [ ] 5.8 专题列表 ✅ / ❌

---

## 快速验证建议

部署生效后，可用以下方式批量检查：

1. **浏览器查源码**：`Ctrl+U` → `Ctrl+F` 搜索 `canonical` 或 `hreflang`
2. **Google Rich Results Test**：https://search.google.com/test/rich-results
3. **hreflang 检查工具**：https://www.hreflang.org/checker/
4. **robots.txt 检查**：Google Search Console → robots.txt 检查器

---

## 本次与 Next-web-sub 的主要差异

| 项目 | Next-web-sub | Next-web 主站 |
|------|-------------|--------------|
| 游戏 hreflang | ❌ 无（游戏无多语言内容） | ✅ 有（调用 API 获取实际可用语言） |
| 支持语言数量 | 2 个（zh-CN, zh-TW） | 3 个（zh-CN, zh-TW, en-US） |
| 列表页 hreflang | 部分 | 全部（8个列表页） |
