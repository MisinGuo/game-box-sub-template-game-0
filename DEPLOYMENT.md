# 📦 Next-web 部署完整指南

> 🎯 本指南涵盖所有部署方式，重点介绍 Cloudflare 部署配置

---

## 📋 目录

1. [快速开始](#快速开始)
2. [Cloudflare Pages 部署](#1-cloudflare-pages-推荐)
3. [Cloudflare Workers 部署](#2-cloudflare-workers-高级)
4. [其他部署方式](#3-其他部署方式)
5. [环境变量配置](#环境变量配置)
6. [常见问题](#常见问题)

---

## 快速开始

### 🎯 选择部署方式

| 部署方式 | 免费额度 | 中国访问 | 适用场景 | 难度 |
|---------|---------|---------|---------|------|
| **Cloudflare Pages** | 无限流量 | ⭐⭐⭐⭐⭐ | 推荐新手 | ⭐ |
| **Cloudflare Workers** | 10万请求/天 | ⭐⭐⭐⭐⭐ | 需要高性能 | ⭐⭐ |
| Vercel | 100GB/月 | ⭐⭐ | 海外用户 | ⭐ |
| GitHub Pages | 100GB/月 | ⭐⭐ | 静态展示 | ⭐ |

### ⚠️ 重要提示

**部署后前端无法访问后端？**
- 本地 `.env.local` 配置的 `localhost:8080` 只适用于开发
- **必须在生产环境配置真实的API地址**
- 构建日志中的 `ECONNREFUSED` 错误是正常的（构建时访问不到后端）
- 配置环境变量后，页面在运行时会正常获取数据

---

## 1. Cloudflare Pages（推荐）

### 📌 适用场景
- ✅ 新手友好，配置简单
- ✅ 免费无限流量
- ✅ 中国访问速度快
- ✅ 自动HTTPS和CDN加速
- ✅ 支持自定义域名

### 🚀 部署步骤

#### 步骤 1：通过 Dashboard 部署

1. **登录 Cloudflare**
   - 访问 https://dash.cloudflare.com
   - 登录你的账号

2. **创建项目**
   - 进入 **Pages** → **Create a project**
   - 选择 **Connect to Git**
   - 授权并选择你的 GitHub 仓库

3. **配置构建设置**
   ```
   项目名称: game-box-web (或自定义)
   框架预设: Next.js (Static HTML Export)
   构建命令: pnpm run build
   输出目录: out
   根目录: /Next-web
   Node.js 版本: 20
   ```

4. **配置环境变量（关键步骤）**
   
   点击 **Environment variables** → **Add variable**
   
   **Production 环境（必填）：**
   
   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` | ⚠️ 你的后端API地址（必须配置） |
   | `NEXT_PUBLIC_SITE_ID` | `1` | 站点ID |
   | `REVALIDATE_SECRET` | `random-secret-key-123` | ISR重新验证密钥（推荐） |
   
   **可选配置：**
   
   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `NEXT_PUBLIC_API_KEY` | `your-api-key` | 如果后端启用API密钥验证 |
   | `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics |

5. **开始部署**
   - 点击 **Save and Deploy**
   - 等待构建完成（3-5分钟）
   - 获得部署地址：`https://your-project.pages.dev`

#### 步骤 2：通过 GitHub Actions 自动部署

1. **获取 Cloudflare 凭证**
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 创建 Token，选择 "Cloudflare Pages" 模板
   - 复制 Account ID（在 Pages 页面右侧）

2. **配置 GitHub Secrets**
   - 进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
   - 添加 Secrets：
     - `CLOUDFLARE_API_TOKEN`: 你的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`: 你的 Account ID

3. **推送代码自动部署**
   ```bash
   git add .
   git commit -m "部署到 Cloudflare Pages"
   git push origin main
   ```

### 📍 重要说明

#### 关于构建日志中的错误

构建时可能看到：
```
API请求失败: ECONNREFUSED
构建时 API 不可用，使用空数据生成页面
```

**这是正常的！** 不影响功能：
- ✅ 构建在 Cloudflare 服务器，无法访问本地 `localhost:8080`
- ✅ 使用 ISR 模式，页面在用户访问时动态生成
- ✅ 配置环境变量后，运行时会使用正确的API地址
- ✅ 首次访问会从后端获取数据并缓存

#### HTTPS vs HTTP

**强烈推荐使用 HTTPS：**
- Cloudflare Pages 默认使用 HTTPS
- 浏览器会阻止 HTTPS 页面访问 HTTP API（Mixed Content 错误）

**如果后端只有 HTTP：**
- 方案1：为后端配置 HTTPS（推荐）
  - 使用 Let's Encrypt 免费证书
  - 或使用云服务商的 SSL
- 方案2：使用 Cloudflare 代理（见下方 Q6）
- 方案3：使用 Cloudflare Workers 转发

---

## 2. Cloudflare Workers（高级）

### 📌 适用场景
- ✅ 需要边缘计算能力
- ✅ 需要更高的性能和灵活性
- ✅ 每天超过 10万 请求
- ✅ 需要自定义路由逻辑

### 🚀 部署步骤

#### 前提条件
- ✅ 已配置 `wrangler.toml`
- ✅ 已安装 `@opennextjs/cloudflare`
- ✅ 在 Linux/WSL2 环境（Windows需要WSL）

#### 步骤 1：配置 wrangler.toml

已为你配置好基础结构，只需修改 API 地址：

```toml
#:schema node_modules/wrangler/config-schema.json

name = "game-box-web"
compatibility_date = "2024-12-24"
compatibility_flags = ["nodejs_compat"]
main = ".open-next/worker.js"

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[services]]
binding = "WORKER_SELF_REFERENCE"
service = "game-box-web"

[vars]
CLOUDFLARE_WORKERS = "true"

# ⚠️ 修改这里：配置你的后端API地址
NEXT_PUBLIC_API_URL = "https://api.yourdomain.com"
NEXT_PUBLIC_SITE_ID = "1"

# 可选配置
# REVALIDATE_SECRET = "your-random-secret-key"
# NEXT_PUBLIC_API_KEY = "your-api-key"
```

#### 步骤 2：部署到 Workers

```bash
# 进入项目目录
cd Next-web

# 构建并部署（一键完成）
pnpm run deploy

# 或分步执行
pnpm run build:cfworkers  # 构建
npx wrangler deploy       # 部署
```

部署成功后会显示：
```
Deployed game-box-web triggers
  https://game-box-web.your-account.workers.dev
```

#### 步骤 3：通过 Dashboard 配置（可选）

如果不想在 `wrangler.toml` 中写环境变量：

1. 登录 https://dash.cloudflare.com
2. 进入 **Workers & Pages**
3. 选择 **game-box-web** 项目
4. 点击 **Settings** → **Variables**
5. 添加环境变量（同上表）
6. 保存后自动重新部署

### ⚠️ Windows 限制

Cloudflare Workers 构建需要 Linux 环境：

**在 Windows 上部署：**
1. 安装 WSL2：`wsl --install`
2. 在 WSL2 中运行：
   ```bash
   cd /mnt/d/游戏推广项目/projects/game-box/Next-web
   pnpm run deploy
   ```

**或使用 GitHub Actions：**
- 推送代码到 GitHub
- 让 CI/CD 自动构建部署

---

## 3. 其他部署方式

### Vercel（零配置）

**CLI 部署：**
```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录
vercel login

# 部署
vercel
```

**Dashboard 部署：**
1. 访问 [vercel.com](https://vercel.com)
2. Import Git Repository
3. 自动检测 Next.js，一键部署

**环境变量：**
在 Vercel Dashboard → Settings → Environment Variables 配置相同的环境变量

---

### GitHub Pages（静态托管）

**自动部署（已配置）：**
```bash
git push origin main
```

访问地址：`https://your-username.github.io/game-box`

**注意：** GitHub Pages 不支持动态功能，仅适用于静态内容展示

---

## 环境变量配置

### 必填变量

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|---------|---------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | `https://api.yourdomain.com` | 后端API地址 |
| `NEXT_PUBLIC_SITE_ID` | `1` | `1` | 站点ID |

### 推荐配置

| 变量名 | 值示例 | 说明 |
|--------|-------|------|
| `REVALIDATE_SECRET` | `random-secret-123` | ISR重新验证密钥 |

### 可选配置

| 变量名 | 值示例 | 说明 |
|--------|-------|------|
| `NEXT_PUBLIC_API_KEY` | `your-api-key` | API密钥（如果后端需要） |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Google Tag Manager |

### 配置方式

**本地开发：**
- 复制 `.env.example` 为 `.env.local`
- 填写本地开发配置

**Cloudflare Pages：**
- Dashboard → Settings → Environment variables

**Cloudflare Workers：**
- 修改 `wrangler.toml` 的 `[vars]` 部分
- 或通过 Dashboard → Settings → Variables

**Vercel：**
- Dashboard → Settings → Environment Variables

---

## 常见问题

### Q1: 部署后仍然访问 localhost:8080？

**问题：** 网站部署成功，但无法加载内容，浏览器显示连接 localhost 失败

**原因：** 环境变量未正确配置或未生效

**解决方案：**
1. ✅ 确认环境变量已保存在平台（Cloudflare/Vercel）
2. ✅ 变量名拼写正确（区分大小写）
3. ✅ 重新部署项目
4. ✅ 清除浏览器缓存，使用无痕模式访问
5. ✅ 等待 5-10 分钟让 CDN 缓存刷新

**验证方法：**
- 按 F12 打开开发者工具
- 切换到 Network 标签
- 刷新页面，查看 API 请求地址

---

### Q2: 出现 CORS 错误

**问题表现：**
```
Access to fetch at 'https://api.yourdomain.com/...' from origin 'https://your-project.pages.dev' 
has been blocked by CORS policy
```

**原因：** 后端未配置允许前端域名访问

**解决方案：** 在后端配置 CORS

**Spring Boot 配置：**
```yaml
# application.yml
cors:
  allowed-origins:
    - https://your-project.pages.dev
    - https://game-box-web.your-account.workers.dev
    - https://yourdomain.com  # 如果有自定义域名
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
  allowed-headers: "*"
  max-age: 3600
```

---

### Q3: 站点ID错误

**问题表现：**
- API 返回 404 或 403
- 提示"站点不存在"

**解决方案：**
1. 登录后台管理系统
2. 进入"站点管理"
3. 查看站点详情，复制正确的站点ID
4. 更新环境变量中的 `NEXT_PUBLIC_SITE_ID`
5. 重新部署

---

### Q4: API密钥验证失败

**问题表现：**
- API 返回 401 Unauthorized
- 提示"API密钥无效"

**解决方案：**
1. 确认后端是否启用了API密钥验证
2. 从后台获取正确的API密钥
3. 配置 `NEXT_PUBLIC_API_KEY` 环境变量
4. 重新部署

---

### Q5: ISR 重新验证不工作

**问题表现：**
- 后台更新内容后，前端不更新
- 需要手动清除缓存才能看到新内容

**解决方案：**
1. 配置 `REVALIDATE_SECRET` 环境变量（前后端一致）
2. 确认后端在内容更新后调用 `/api/revalidate` 接口
3. 检查重新验证接口日志

**后端调用示例：**
```java
String revalidateUrl = frontendUrl + "/api/revalidate?secret=" + revalidateSecret;
restTemplate.postForObject(revalidateUrl, null, String.class);
```

---

### Q6: 后端只有 HTTP，出现 Mixed Content 错误

**问题表现：**
```
Mixed Content: The page at 'https://your-project.pages.dev' was loaded over HTTPS, 
but requested an insecure resource 'http://api.yourdomain.com/...'. 
This request has been blocked.
```

**原因：** 浏览器不允许 HTTPS 页面加载 HTTP 资源

**解决方案（按优先级）：**

**1. 最佳方案：为后端配置 HTTPS**

使用 Nginx + Let's Encrypt：
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 自动配置 HTTPS
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

**2. 临时方案：Cloudflare 代理**

1. 将后端域名添加到 Cloudflare
2. 设置 DNS 记录指向后端服务器
3. 开启 Cloudflare 的 SSL/TLS（灵活模式）
4. Cloudflare 会自动提供 HTTPS 访问

**3. 临时方案：Cloudflare Workers 转发**

创建一个 Worker 作为 HTTPS 代理：

```javascript
// api-proxy.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 后端HTTP地址
    const backendUrl = 'http://your-backend-ip:8080' + url.pathname + url.search;
    
    // 转发请求
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    // 添加 CORS 头
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return newResponse;
  }
}
```

部署 Worker 后，将 `NEXT_PUBLIC_API_URL` 设置为 Worker 地址

---

### Q7: 构建时 API 错误是否影响功能？

**问题：** 构建日志显示大量 `ECONNREFUSED` 错误

**答案：** **不影响！** 这是正常现象

**原因：**
- ✅ 构建在云端服务器，无法访问本地 `localhost:8080`
- ✅ 项目使用 ISR（增量静态再生成）模式
- ✅ 页面在用户首次访问时动态生成
- ✅ 配置环境变量后，运行时会使用正确的API

**工作流程：**
```
构建时（Build Time）
├── 尝试预生成页面 → API不可用
├── 生成空白页面框架
└── 部署成功 ✅

运行时（Runtime）
├── 用户访问网站
├── 使用环境变量的API地址
├── 从后端获取数据
├── 动态生成完整页面
└── 缓存页面内容 ✅
```

---

## ✅ 验证部署

### 1. 检查构建状态

在部署平台查看构建日志：
- ✅ 构建成功（绿色勾号）
- ✅ 部署完成
- ⚠️ API 错误可忽略（见 Q7）

### 2. 测试网站功能

访问部署地址，测试：
- ✅ 首页能正常加载
- ✅ 文章列表能显示内容
- ✅ 分类筛选功能正常
- ✅ 文章详情页能打开
- ✅ 搜索功能正常

### 3. 检查 API 请求

按 F12 打开浏览器开发者工具：
1. 切换到 **Network** 标签
2. 刷新页面
3. 查看 API 请求：
   - ✅ 请求地址应该是 `https://api.yourdomain.com/...`
   - ✅ 响应状态应该是 `200 OK`
   - ✅ 返回正确的数据

### 4. 性能检查

- ✅ 首屏加载时间 < 3秒
- ✅ 页面切换流畅
- ✅ 图片正常加载
- ✅ 无明显的白屏或卡顿

---

## 📚 相关资源

### 官方文档
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 文档](https://vercel.com/docs)

### 项目文档
- [环境变量配置示例](./.env.production.example)
- [Cloudflare Workers 配置](./wrangler.toml)

---

## 💡 最佳实践

### 1. 安全性
- ✅ 生产环境使用 HTTPS
- ✅ 不在代码中硬编码 API 地址
- ✅ 使用强密钥作为 `REVALIDATE_SECRET`
- ✅ 定期更新 API 密钥
- ✅ 配置 CORS 白名单

### 2. 性能优化
- ✅ 启用 ISR（增量静态再生成）
- ✅ 配置 CDN 缓存
- ✅ 压缩图片资源
- ✅ 使用自定义域名
- ✅ 开启 HTTP/2 和 Brotli 压缩

### 3. 监控与调试
- ✅ 配置 Google Analytics
- ✅ 定期检查部署日志
- ✅ 使用浏览器开发者工具
- ✅ 监控 API 响应时间
- ✅ 设置错误追踪（Sentry 等）

### 4. 开发流程
- ✅ 本地测试通过后再部署
- ✅ 使用 Git 分支管理代码
- ✅ 配置自动化部署（CI/CD）
- ✅ 保留 Preview 环境用于测试
- ✅ 定期备份数据和配置

---

## 🎉 部署成功后的下一步

1. ✅ **绑定自定义域名**
   - Cloudflare Pages: Settings → Custom domains
   - 配置 DNS 记录（CNAME 或 A 记录）

2. ✅ **配置 HTTPS**
   - Cloudflare 自动提供免费 SSL
   - 或使用 Let's Encrypt

3. ✅ **设置数据分析**
   - 配置 Google Analytics
   - 或使用 Cloudflare Analytics

4. ✅ **优化 SEO**
   - 提交站点地图到搜索引擎
   - 配置 robots.txt

5. ✅ **性能监控**
   - 使用 Lighthouse 检查性能
   - 监控 Core Web Vitals

---

## 📞 获取帮助

遇到问题？
1. 查看本文档的"常见问题"部分
2. 检查部署平台的构建日志
3. 查看浏览器控制台错误信息
4. 参考官方文档
5. 提交 Issue 到项目仓库

祝部署顺利！🚀
