#!/usr/bin/env node

/**
 * VitePress 文档部署脚本
 * 将 docs 目录构建并部署到 Cloudflare Pages
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DOCS_DIR = path.resolve(__dirname, '../docs');
const DIST_DIR = path.resolve(DOCS_DIR, '.vitepress/dist');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  log(`> ${command}`, 'blue');
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: DOCS_DIR,
      ...options 
    });
  } catch (error) {
    log(`命令执行失败: ${command}`, 'red');
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'build';

  log('\n📚 VitePress 文档部署工具\n', 'green');

  // 检查 docs 目录
  if (!fs.existsSync(DOCS_DIR)) {
    log('错误: docs 目录不存在', 'red');
    process.exit(1);
  }

  // 检查是否安装了 vitepress
  const vitepressPath = path.resolve(__dirname, '../node_modules/vitepress');
  if (!fs.existsSync(vitepressPath)) {
    log('正在安装 VitePress 依赖...', 'yellow');
    exec('pnpm add -D vitepress vitepress-plugin-mermaid mermaid', { cwd: path.resolve(__dirname, '..') });
  }

  switch (command) {
    case 'dev':
      log('🚀 启动开发服务器...', 'green');
      exec('npx vitepress dev');
      break;

    case 'build':
      log('🔨 构建文档...', 'green');
      exec('npx vitepress build');
      log(`\n✅ 构建完成! 输出目录: ${DIST_DIR}`, 'green');
      break;

    case 'preview':
      log('👀 预览构建结果...', 'green');
      exec('npx vitepress preview');
      break;

    case 'deploy':
      log('🚀 部署到 Cloudflare Pages...', 'green');
      
      // 1. 构建
      log('\n[1/2] 构建文档...', 'yellow');
      exec('npx vitepress build');
      
      // 2. 部署到 Cloudflare Pages
      log('\n[2/2] 部署到 Cloudflare Pages...', 'yellow');
      
      // 检查 wrangler 是否已安装
      try {
        execSync('npx wrangler --version', { stdio: 'pipe' });
      } catch {
        log('正在安装 wrangler...', 'yellow');
        exec('pnpm add -D wrangler', { cwd: path.resolve(__dirname, '..') });
      }
      
      // 使用 wrangler pages deploy
      exec(`npx wrangler pages deploy .vitepress/dist --project-name=game-box-docs`);
      
      log('\n✅ 部署完成!', 'green');
      break;

    case 'deploy:direct':
      // 直接部署（无需登录，使用环境变量中的 API Token）
      log('🚀 直接部署到 Cloudflare Pages...', 'green');
      
      if (!process.env.CLOUDFLARE_API_TOKEN) {
        log('错误: 请设置 CLOUDFLARE_API_TOKEN 环境变量', 'red');
        log('获取方式: https://dash.cloudflare.com/profile/api-tokens', 'yellow');
        process.exit(1);
      }
      
      if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
        log('错误: 请设置 CLOUDFLARE_ACCOUNT_ID 环境变量', 'red');
        process.exit(1);
      }
      
      // 构建
      exec('npx vitepress build');
      
      // 部署
      exec(`npx wrangler pages deploy .vitepress/dist --project-name=game-box-docs`);
      
      log('\n✅ 部署完成!', 'green');
      break;

    default:
      log(`
使用方法: node scripts/deploy-docs.js <command>

命令:
  dev           启动开发服务器
  build         构建静态文档
  preview       预览构建结果
  deploy        部署到 Cloudflare Pages (需要登录)
  deploy:direct 直接部署 (需要设置环境变量)

环境变量 (deploy:direct 需要):
  CLOUDFLARE_API_TOKEN    Cloudflare API Token
  CLOUDFLARE_ACCOUNT_ID   Cloudflare Account ID
`, 'yellow');
  }
}

main().catch(err => {
  log(`错误: ${err.message}`, 'red');
  process.exit(1);
});
