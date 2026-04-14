---
layout: home
hero:
  name: 游戏盒子推广站
  text: 前端项目文档
  tagline: 主站（Next-web）+ 子站（Next-web-sub）双站技术文档
  actions:
    - theme: brand
      text: 页面路由说明
      link: /页面路由说明
    - theme: alt
      text: 配置指南
      link: /配置指南
    - theme: alt
      text: 部署教程
      link: /部署教程

features:
  - icon: 🚀
    title: 边缘计算部署
    details: 两站均部署于 Cloudflare Workers，全球 CDN 加速，毫秒级响应
  - icon: ⚡
    title: Next.js App Router
    details: SSG/ISR/动态渲染混合，SEO 与性能兼顾；主站支持三语言，子站双语言
  - icon: 🎮
    title: 双站架构
    details: 主站（5awyx.com）盒子折扣聚合 + 子站（kapai-web）卡牌垂直攻略，流量互导
  - icon: 📝
    title: 内容驱动 SEO
    details: 资讯/攻略/评测多内容类型，tag 聚合页覆盖长尾关键词，内链网络深度互联
  - icon: 🔧
    title: TypeScript 全栈
    details: 完整类型支持；统一 API 客户端；配置驱动，无需改代码即可调整页面文案
  - icon: 📊
    title: 多语言 Sitemap
    details: 自动生成 hreflang 多语言 Sitemap，边缘缓存，搜索引擎优先收录
---

## 站点概览

| 项目 | 主站 | 子站 |
|---|---|---|
| **项目路径** | `Next-web/` | `Next-web-sub/` |
| **域名** | https://www.5awyx.com | https://kapai-web.94kj.cn |
| **后台 SITE_ID** | `1` | `8` |
| **定位** | 游戏盒子折扣聚合站 | 卡牌手游垂直攻略站 |
| **转化动作** | 点击盒子推广链接（CPS/CPA） | 跳转主站盒子页 |
| **多语言** | zh-CN / zh-TW / en | zh-CN / zh-TW |

## 快速开发

```bash
# 主站
cd Next-web
pnpm install
pnpm dev          # http://localhost:3000

# 子站
cd Next-web-sub
pnpm install
pnpm dev          # http://localhost:3001（或下一个可用端口）
```

**环境变量**（两站各自的 `.env.local`）：

```env
# 主站
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_ID=1

# 子站
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_ID=8
```

## 文档导航

| 文档 | 说明 |
|------|------|
| [页面路由说明](./页面路由说明.md) | 主站+子站所有页面路由、功能、SEO要求、内链规范 |
| [开发指南](./开发指南.md) | 项目结构、开发规范、组件开发 |
| [配置指南](./配置指南.md) | 环境变量、站点配置、多语言配置 |
| [数据展示指南](./文章数据展示指南.md) | API 调用、数据流、内容渲染 |
| [多语言路由架构](./多语言路由架构.md) | i18n 路由设计、hreflang、语言切换 |
| [部署教程](./部署教程.md) | Cloudflare Workers/Pages 部署完整步骤 |
| [API 文档](./API接口文档.md) | 后端 API 接口说明 |

## 技术栈

- **框架**：Next.js 14 (App Router)
- **UI**：React 18 + Tailwind CSS + shadcn/ui
- **部署**：Cloudflare Workers (OpenNext)
- **语言**：TypeScript
