import { defineConfig } from 'vitepress'
import { mermaidPlugin } from './plugins/mermaid'

export default defineConfig({
  title: '游戏盒子推广站',
  description: '游戏盒子推广站前端项目文档 - Next.js + Cloudflare Workers',
  lang: 'zh-CN',
  base: '/',
  
  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '开发指南', link: '/开发指南' },
      { text: '部署教程', link: '/部署教程' },
      { text: 'API文档', link: '/API接口文档' },
    ],
    
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '项目概述', link: '/index' },
        ]
      },
      {
        text: '开发',
        items: [
          { text: '开发指南', link: '/开发指南' },
          { text: '配置指南', link: '/配置指南' },
          { text: '数据展示', link: '/文章数据展示指南' },
          { text: '项目结构', link: '/开发指南#项目结构' },
          { text: '代码规范', link: '/开发指南#代码规范' },
          { text: '组件开发', link: '/开发指南#组件开发' },
          { text: '性能优化', link: '/开发指南#性能优化' },
        ]
      },
      {
        text: '配置系统',
        items: [
          { text: '配置总览', link: '/config/配置总览' },
          { text: '快速入门', link: '/config/快速入门' },
          { text: '页面配置', link: '/config/页面配置' },
          { text: '站点配置', link: '/config/站点配置' },
          { text: 'API配置', link: '/config/API配置' },
        ]
      },
      {
        text: '架构',
        items: [
          { text: '多语言路由', link: '/多语言路由架构' },
          { text: '类型组织规范', link: '/类型组织规范' },
        ]
      },
      {
        text: '部署',
        items: [
          { text: '部署教程', link: '/部署教程' },
          { text: 'Cloudflare Pages', link: '/部署教程#cloudflare-pages-部署推荐' },
          { text: 'Cloudflare Workers', link: '/部署教程#cloudflare-workers-部署使用-opennext' },
          { text: '环境变量', link: '/部署教程#环境变量配置' },
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'API 接口', link: '/API接口文档' },
          { text: '游戏盒子接口', link: '/API接口文档#游戏盒子相关接口' },
          { text: '游戏接口', link: '/API接口文档#游戏相关接口' },
          { text: '搜索接口', link: '/API接口文档#搜索接口' },
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],
    
    footer: {
      message: '游戏盒子推广站前端项目',
      copyright: 'Copyright © 2025'
    },
    
    search: {
      provider: 'local'
    },
    
    outline: {
      level: [2, 3],
      label: '目录'
    },
    
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    
    lastUpdated: {
      text: '最后更新于'
    }
  },
  
  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(mermaidPlugin)
    }
  },
  
  vite: {
    build: {
      target: 'esnext'
    }
  }
})
