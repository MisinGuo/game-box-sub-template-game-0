
# 游戏盒子聚合推广网站 - Next.js 前端

> 基于Next.js 14 + TypeScript + Tailwind CSS构建的游戏盒子聚合推广网站前端项目

## ✨ 特性

- 🚀 **Next.js 14 App Router** - 最新的Next.js应用架构
- 📱 **响应式设计** - 完美适配PC端和移动端
- 🎨 **Tailwind CSS 3.x** - 现代化的CSS框架
- 🌗 **深色模式支持** - 自动切换亮色/暗色主题
- ⚡ **ISR 增量静态再生** - 按需更新静态页面
- 🔍 **SEO 优化** - 完善的搜索引擎优化
- 📊 **数据分析集成** - Google Analytics + GTM
- 💬 **评论系统** - 基于Giscus的GitHub Discussions
- 🌍 **Cloudflare Pages 部署** - 全球CDN加速

## 📚 文档

- **[配置指南](./docs/配置指南.md)** - 完整的配置和自定义指南
- **[部署教程](./docs/部署教程.md)** - 详细的部署步骤
- **[开发指南](./docs/开发指南.md)** - 开发规范和最佳实践
- **[API接口文档](./docs/API接口文档.md)** - 后端API接口说明

## 🚀 快速开始

### 1. 环境准备

确保已安装：
- **Node.js**: >= 18.17 (推荐最新LTS)
- **pnpm**: >= 8.0

```bash
# 检查Node.js版本
node -v

# 安装pnpm
npm install -g pnpm
```

### 2. 安装依赖

```bash
cd Next-web
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，配置必要的环境变量
```

**必填配置：**

```env
# 后端API地址
NEXT_PUBLIC_API_URL=http://localhost:8080

# 站点ID
NEXT_PUBLIC_SITE_ID=default

# API密钥（如果后端启用了验证）
NEXT_PUBLIC_API_KEY=your-api-key
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 🎨 配置自定义

本项目采用**配置化设计**，您可以通过修改配置文件来自定义网站，无需修改源代码。

### 站点配置

编辑 [src/config/site.ts](src/config/site.ts) 配置站点基本信息：

```typescript
export const siteConfig = {
  name: '游戏盒子聚合平台',          // 网站名称
  description: '发现最佳游戏盒子',    // 网站描述
  hostname: 'https://yourdomain.com', // 网站域名
  
  logo: {
    light: '/images/logo-light.svg',  // 亮色模式Logo
    dark: '/images/logo-dark.svg',    // 暗色模式Logo
  },
  
  // 导航菜单
  nav: [
    { text: '首页', link: '/' },
    { text: '游戏盒子', link: '/boxes' },
    { text: '热门游戏', link: '/games' },
    { text: '攻略资讯', link: '/articles' },
  ],
  
  // 功能开关
  features: {
    search: true,      // 搜索功能
    darkMode: true,    // 暗色模式
    comments: true,    // 评论功能
    analytics: true    // 数据分析
  }
}
```

### 主题配置

编辑 [src/config/theme.ts](src/config/theme.ts) 自定义主题样式：

```typescript
export const themeConfig = {
  colors: {
    light: {
      primary: '#3B82F6',      // 主色调
      secondary: '#8B5CF6',    // 辅助色
      accent: '#F59E0B',       // 强调色
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#A78BFA',
      accent: '#FBBF24',
    }
  },
  
  fonts: {
    sans: 'Inter, sans-serif',
    heading: '"Plus Jakarta Sans", Inter, sans-serif'
  }
}
```

### 后端API配置

编辑 [src/config/backend.ts](src/config/backend.ts) 配置API连接：

```typescript
export const backendConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  apiPrefix: '/api/public',
  siteId: process.env.NEXT_PUBLIC_SITE_ID,
  apiKey: process.env.NEXT_PUBLIC_API_KEY
}
```

> 💡 **详细配置说明**：请查看 [配置指南](./docs/配置指南.md)

## 📁 项目结构

```
Next-web/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── layout.tsx    # 全局布局
│   │   ├── page.tsx      # 首页
│   │   ├── articles/     # 文章页面
│   │   ├── boxes/        # 盒子页面
│   │   ├── games/        # 游戏页面
│   │   └── api/          # API路由
│   │
│   ├── components/       # React组件
│   │   ├── layout/       # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/           # UI组件
│   │   └── ...
│   │
│   ├── config/           # 配置文件 ⭐️
│   │   ├── site.ts       # 站点配置
│   │   ├── theme.ts      # 主题配置
│   │   ├── backend.ts    # 后端API配置
│   │   └── index.ts      # 统一导出
│   │
│   ├── lib/              # 工具函数
│   │   ├── api.ts        # API客户端
│   │   └── utils.ts      # 通用工具
│   │
│   └── styles/           # 样式文件
│       └── globals.css   # 全局样式
│
├── public/               # 静态资源
│   ├── images/           # 图片
│   └── favicon.ico       # 网站图标
│
├── docs/                 # 文档
│   ├── 配置指南.md
│   ├── 部署教程.md
│   └── 开发指南.md
│
├── .env.example          # 环境变量模板
├── .env.local            # 本地环境变量（不提交）
├── next.config.js        # Next.js配置
├── tailwind.config.js    # Tailwind CSS配置
└── package.json          # 项目依赖
```

## 🚀 构建与部署

### 本地构建

```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

### 部署到 Cloudflare Pages

#### 方式一：GitHub Actions（推荐）

1. 在GitHub仓库配置Secrets：
   - `CF_ACCOUNT_ID`: Cloudflare账户ID
   - `CF_API_TOKEN`: Cloudflare API Token
   - `NEXT_PUBLIC_API_URL`: 后端API地址
   - `NEXT_PUBLIC_SITE_ID`: 站点ID

2. 推送代码自动部署：
```bash
git push origin main
```

#### 方式二：直接连接GitHub

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **创建项目**
3. 连接GitHub仓库
4. 配置构建设置：
   - **框架**: Next.js
   - **构建命令**: `pnpm build`
   - **构建输出**: `.next`
   - **Node版本**: 18

5. 添加环境变量并部署

> 📚 **详细部署教程**：请查看 [部署教程](./docs/部署教程.md)

## 🛠️ 开发命令

```bash
# 启动开发服务器
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# TypeScript类型检查
pnpm type-check

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📊 功能特性

### ISR 增量静态再生

支持按需更新静态页面，无需重新构建整个网站：

```bash
# 触发页面重新生成
curl -X POST 'https://yourdomain.com/api/revalidate' \
  -H 'Content-Type: application/json' \
  -d '{"secret": "your-secret", "path": "/articles/123"}'
```

### 数据分析集成

支持Google Analytics和Google Tag Manager：

```env
# .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 评论系统

基于Giscus的GitHub Discussions评论系统：

```env
# .env.local
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxxxxxx
```

## 🔗 相关链接

- **配置指南**: [docs/配置指南.md](./docs/配置指南.md)
- **部署教程**: [docs/部署教程.md](./docs/部署教程.md)
- **开发指南**: [docs/开发指南.md](./docs/开发指南.md)
- **API文档**: [docs/API接口文档.md](./docs/API接口文档.md)
- **Next.js文档**: https://nextjs.org/docs
- **Tailwind CSS文档**: https://tailwindcss.com/docs
- **Cloudflare Pages文档**: https://developers.cloudflare.com/pages/

## 📄 许可证

MIT License

---

## 📖 项目原始设计

This is a code bundle for 游戏盒子聚合推广网站设计. The original project is available at https://www.figma.com/design/fSfd6B3oQc5ID89cOmuf0c/%E6%B8%B8%E6%88%8F%E7%9B%92%E5%AD%90%E8%81%9A%E5%90%88%E6%8E%A8%E5%B9%BF%E7%BD%91%E7%AB%99%E8%AE%BE%E8%AE%A1.

  > 你是一名资深互联网产品 UI/UX 设计师，请为一个【游戏盒子（游戏平台）聚合推广网站】设计完整的 UI 与页面结构方案。
>
> 本网站的核心目标是：
>  **通过高质量游戏文章内容获取搜索引擎流量 → 引导用户对比多个游戏盒子 → 用户自行选择最合适的盒子下载/注册/充值**。
>
> 设计必须同时覆盖 **PC 端 Web** 与 **移动端 H5**，并重点考虑 SEO、可读性、转化效率。

------

## 一、整体 UI 风格与设计原则

### 1️⃣ 风格定位

- 类型：**内容型 + 工具型游戏平台**
- 不是单一游戏平台官网，而是「中立、可对比、可选择」
- 游戏感适中，避免过度炫酷，保证长时间阅读不疲劳

### 2️⃣ 视觉规则

- 主色：深色系（深蓝 / 深灰）
- 强调色：
  - 折扣 / 福利：橙色或绿色
  - CTA：高对比纯色
- 视觉优先级：
  1. 折扣 & 福利
  2. 盒子差异点
  3. 游戏信息
  4. 装饰视觉

------

## 二、网站整体结构（必须体现“平台的聚合”）

### 一级入口结构

- 首页
- 游戏盒子大全
- 游戏库（跨盒子）
- 攻略 / 资讯（SEO 内容核心）
- 折扣 / 福利中心

------

## 三、SEO 文章内容页（**核心流量入口页面**）

> 该页面用于展示类似《龍族重生2025：各职业高效输出手法全解析》的长内容攻略文章，是搜索引擎进入站点的第一落点。

------

### 🔹 PC 端文章页 UI 设计

#### 页面布局（经典内容型结构）

- 顶部：
  - Logo
  - 导航（盒子大全 / 游戏库 / 攻略）
- 主体区域（左右结构）：
  - 左侧（≈65%）：**文章内容**
  - 右侧（≈35%）：**盒子与折扣转化区（吸顶）**

#### 左侧内容区设计

- 文章标题（H1，大字号）
- 副标题 / 引言说明（弱平台露出）
- 标签：游戏名 / 年份 / 类型 / 攻略类型
- 正文内容：
  - 明确 H2 / H3 层级
  - 表格样式统一、易读
  - 「实用 Tip」使用高亮信息块
  - 长文支持目录锚点（可选）

#### 右侧转化区（关键）

- 模块 1：**该游戏可用盒子列表**
  - 盒子 Logo + 名称
  - 折扣标签（0.1 折 / BT）
  - 核心优势 1–2 条
  - CTA：**用该盒子下载**
- 模块 2：折扣对比摘要
  - 首充 / 续充价格
  - 礼包 / 抵扣券提示
- 模块 3：平台使用优势（3 条以内）

------

### 🔹 移动端文章页 UI 设计

#### 页面结构（纵向阅读优先）

- 顶部：
  - 简洁 Header（返回 / 标题缩略）
- 内容区：
  - 标题 + 标签
  - 正文内容全宽显示
  - 表格支持横向滑动
- 转化设计（重点）：
  - 底部固定悬浮栏：
    - 「查看可用盒子」
    - 「选择盒子下载」
  - 点击后弹出 Bottom Sheet：
    - 该游戏在多个盒子中的折扣卡片列表
    - 每个卡片一个明确 CTA

------

## 四、游戏盒子聚合相关页面（承接与选择）

### 1️⃣ 游戏盒子大全页

**PC**

- 左侧筛选：
  - 官方 / 折扣 / BT
  - 支持设备
  - 主打游戏类型
- 右侧盒子卡片列表：
  - Logo + 名称
  - 折扣标签
  - 覆盖游戏数
  - 主 CTA：进入盒子
  - 次 CTA：下载盒子

**移动**

- 顶部筛选抽屉
- 卡片纵向列表
- 折扣标签强视觉突出

------

### 2️⃣ 盒子详情页（查看盒子内游戏）

**PC**

- 盒子信息区（Logo + 简介 + 标签）
- Tab 切换：
  - 盒子内游戏（默认）
  - 福利 / 礼包
  - 使用说明
- 游戏列表字段：
  - 游戏名 / 类型
  - 折扣（首充 / 续充）
  - 礼包
  - CTA：用该盒子下载

**移动**

- 盒子信息压缩展示
- 游戏卡片化
- 底部固定 CTA：下载盒子

------

### 3️⃣ 游戏聚合详情页（同一游戏对比多个盒子）

**核心目标：帮用户选盒子**

**PC**

- 顶部：游戏信息
- 中部：盒子对比表
  - 盒子名
  - 折扣
  - 礼包
  - 设备
  - CTA：选择该盒子下载

**移动**

- 对比卡片列表
- 支持排序（最划算 / 官方 / 双端）

------

## 五、关键 UI 组件规范（全站复用）

### A）盒子卡片

- Logo + 名称
- 折扣标签
- 1–2 个差异点
- CTA 必须指向具体盒子

### B）折扣信息组件

- 折扣数字视觉优先
- 国内 / 海外清晰区分
- “省钱”表达而非“充值”

### C）下载 CTA

- 文案明确：
  - 「用【盒子名】下载」
  - 「通过该盒子安装」
- 禁止模糊 CTA

------

## 六、PC 与移动端设计侧重点

| 维度 | PC       | 移动     |
| ---- | -------- | -------- |
| 阅读 | 深度长文 | 快速扫读 |
| 转化 | 右侧吸顶 | 底部悬浮 |
| 对比 | 表格     | 卡片     |
| 筛选 | 常驻     | 抽屉     |

------

## 七、最终交付期望

请输出：

- PC 端页面结构说明（文章页 / 盒子页 / 游戏对比页）
- 移动端页面结构与关键交互
- 核心组件 UI 规范
- 文章页到盒子下载的转化路径说明

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  