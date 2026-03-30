---
layout: home
hero:
  name: 游戏盒子推广站
  text: 前端项目文档
  tagline: Next.js + Cloudflare Workers 边缘部署
  actions:
    - theme: brand
      text: 快速配置
      link: /配置指南
    - theme: alt
      text: 部署教程
      link: /部署教程
    - theme: alt
      text: API 文档
      link: /API接口文档

features:
  - icon: 🚀
    title: 边缘计算部署
    details: 部署于 Cloudflare Workers/Pages，全球 CDN 加速，毫秒级响应
  - icon: ⚡
    title: Next.js 14 驱动
    details: 使用最新的 App Router，支持 SSG/ISR/SSR 混合渲染，SEO 友好
  - icon: 🌐
    title: 多语言支持
    details: 内置简体中文、繁体中文、英文三语言，SEO 友好的 URL 结构
  - icon: 🎮
    title: 游戏内容聚合
    details: 游戏库、盒子大全、攻略指南、资讯中心完整内容体系
  - icon: 🔧
    title: TypeScript 全栈
    details: 完整的 TypeScript 类型支持，代码提示完善，开发体验优秀
  - icon: 📊
    title: SEO 优化
    details: 自动生成多语言 Sitemap，hreflang 标签，边缘缓存极速加载
---

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建部署（Cloudflare Workers）

```bash
pnpm deploy:cfworkers
```

## 项目特点

本项目是一个基于 Next.js 14 构建的游戏盒子聚合推广网站前端，支持多语言，通过后端 API 动态获取游戏、盒子、攻略等内容。

- ✅ **SEO 优化**：多语言 Sitemap + 动态 meta 标签
- ✅ **边缘部署**：Cloudflare Workers 全球边缘网络
- ✅ **响应式设计**：完美支持 PC 和移动端
- ✅ **多语言**：zh-CN / zh-TW / en-US 三语言完整支持

## 技术栈

- **框架**：Next.js 14 (App Router)
- **UI**：React 18 + Tailwind CSS + shadcn/ui
- **部署**：Cloudflare Workers (OpenNext)
- **语言**：TypeScript

## 文档导航

| 文档 | 说明 |
|------|------|
| [开发指南](./开发指南.md) | 项目结构、开发规范、组件开发 |
| [配置指南](./配置指南.md) | 环境变量、站点配置、多语言配置 |
| [部署教程](./部署教程.md) | Cloudflare Pages/Workers 部署详细步骤 |
| [API 文档](./API接口文档.md) | 后端 API 接口说明 |


## 快速开始

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建部署

```bash
pnpm build
```

## 项目特点

本项目是一个基于 Next.js 14 构建的游戏盒子聚合推广网站前端，通过 AI 生成的高质量游戏内容获取搜索引擎流量。

- ✅ **SEO 优化**：静态生成确保搜索引擎完整抓取
- ✅ **边缘部署**：Cloudflare 全球边缘网络
- ✅ **响应式设计**：完美支持 PC 和移动端
- ✅ **内容丰富**：游戏攻略、破解版、资讯等多类型内容

## 技术栈

- **框架**：Next.js 14 (App Router)
- **UI**：React 18 + Tailwind CSS + shadcn/ui
- **内容**：Markdown + gray-matter
- **部署**：Cloudflare Pages/Workers
- **语言**：TypeScript

## 文档导航

| 文档 | 说明 |
|------|------|
| [项目概述](./README.md) | 项目简介、快速开始、项目结构 |
| [开发指南](./开发指南.md) | 开发规范、组件开发、性能优化 |
| [部署教程](./部署教程.md) | Cloudflare Pages/Workers 部署详细步骤 |
| [API 文档](./API接口文档.md) | 后端 API 接口说明 |
