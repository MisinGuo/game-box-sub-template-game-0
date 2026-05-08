#!/usr/bin/env node
/**
 * 构建后补丁：向 .open-next/worker.js 注入 Cloudflare Workers Cron scheduled handler
 * 用于每天零点（UTC 16:00）预热 sitemap 缓存，避免 Googlebot 首次访问慢。
 *
 * 原理：opennextjs-cloudflare 生成的 worker.js 末尾固定为
 *   export default {
 *     async fetch(request, env, ctx) { ... },
 *   };
 * 此脚本在末尾 `};` 前注入 `scheduled` 方法。
 */

const fs = require('fs')
const path = require('path')

const WORKER_PATH = path.join(__dirname, '..', '.open-next', 'worker.js')

// 需要预热的 sitemap 路径（相对于站点根）
const SITEMAP_PATHS = [
  '/sitemap.xml',
  // 各语言 × 各内容类型
  ...['zh-CN', 'zh-TW', 'en-US'].flatMap((locale) =>
    ['static', 'games', 'boxes', 'guides', 'reviews', 'topics', 'news'].map(
      (type) => `/sitemap-${locale}-${type}.xml`
    )
  ),
]

// 注入到 worker.js 末尾的代码（纯 ESM，不使用 import/export）
const INJECTION = `
// ============================================================
// Sitemap Cache Warmer — injected by scripts/patch-worker-scheduled.js
// ============================================================
async function __warmSitemapCache(env) {
  const baseUrl = (env.SITE_URL || '').replace(/\\/$/, '')
  if (!baseUrl) {
    console.error('[SitemapCron] SITE_URL 环境变量未配置，跳过预热')
    return
  }

  const paths = ${JSON.stringify(SITEMAP_PATHS, null, 4)}

  let ok = 0
  let fail = 0
  for (const p of paths) {
    const url = baseUrl + p
    try {
      // Cache-Control: no-cache 让 Workers Cache 仍然写入，但强制重新拉取后端数据
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'X-Sitemap-Cron': '1' },
      })
      console.log('[SitemapCron]', res.status, url)
      ok++
    } catch (e) {
      console.error('[SitemapCron] 失败:', url, String(e))
      fail++
    }
  }
  console.log(\`[SitemapCron] 预热完成：成功 \${ok}，失败 \${fail}\`)
}
`

function main() {
  if (!fs.existsSync(WORKER_PATH)) {
    console.error(`[patch-worker-scheduled] 未找到 ${WORKER_PATH}，请先运行 build:cfworkers`)
    process.exit(1)
  }

  let content = fs.readFileSync(WORKER_PATH, 'utf8')

  // 检查是否已经注入过（幂等）
  if (content.includes('__warmSitemapCache')) {
    console.log('[patch-worker-scheduled] 已注入 scheduled handler，跳过')
    return
  }

  // 在最后的 `};` 前注入 scheduled 方法
  // opennextjs-cloudflare 生成的 worker.js 末尾固定为：
  //   ...
  //     },       ← fetch 方法结尾
  //   };         ← export default 对象结尾
  const marker = /(\n    },\n\};\s*)$/
  if (!marker.test(content)) {
    // 降级：匹配更宽松的末尾
    const fallbackMarker = /(\n\};\s*)$/
    if (!fallbackMarker.test(content)) {
      console.error('[patch-worker-scheduled] 未找到 export default 末尾 `};`，无法注入')
      process.exit(1)
    }
    content = content.replace(fallbackMarker, (_, tail) => {
      return `    ,async scheduled(event, env, ctx) {\n        ctx.waitUntil(__warmSitemapCache(env));\n    }${tail}${INJECTION}`
    })
  } else {
    content = content.replace(marker, (_, tail) => {
      return `\n    },\n    async scheduled(event, env, ctx) {\n        ctx.waitUntil(__warmSitemapCache(env));\n    }${tail}${INJECTION}`
    })
  }

  fs.writeFileSync(WORKER_PATH, content, 'utf8')
  console.log('[patch-worker-scheduled] 成功注入 scheduled handler')
}

main()
