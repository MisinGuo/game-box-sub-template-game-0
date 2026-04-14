import { defineConfig } from 'vitepress'
import { mermaidPlugin } from './plugins/mermaid'

export default defineConfig({
  title: '游戏盒子推广站',
  description: '主站 + 子站前端项目文档 - Next.js + Cloudflare Workers',
  lang: 'zh-CN',
  base: '/',
  
  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '页面路由', link: '/页面路由说明' },
      { text: '开发指南', link: '/开发指南' },
      { 
        text: 'SEO运营',
        items: [
          { text: 'SEO 文档目录', link: '/seo/README' },
          { text: 'SEO 流量战略', link: '/seo/SEO流量战略' },
          { text: '内容发布指南', link: '/seo/内容发布指南' },
          { text: 'AI 提示词工作流', link: '/seo/AI提示词工作流' },
          { text: '内容追踪矩阵', link: '/seo/内容追踪矩阵' },
          { text: 'SEO 验证清单', link: '/seo/SEO验证清单' },
        ]
      },
      { text: '部署', link: '/部署教程' },
    ],
    
    sidebar: [
      {
        text: '概览',
        items: [
          { text: '项目概述', link: '/index' },
          { text: '页面路由说明', link: '/页面路由说明' },
        ]
      },
      {
        text: '开发',
        items: [
          { text: '开发指南', link: '/开发指南' },
          { text: '配置指南', link: '/配置指南' },
          { text: '数据展示', link: '/文章数据展示指南' },
          { text: '路由管理系统', link: '/路由管理系统' },
          { text: '多语言路由', link: '/多语言路由架构' },
          { text: '类型组织规范', link: '/类型组织规范' },
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
        text: 'SEO 与运营',
        items: [
          { text: 'SEO 文档目录', link: '/seo/README' },
          { text: 'SEO 流量战略', link: '/seo/SEO流量战略' },
          { text: '内容发布指南', link: '/seo/内容发布指南' },
          { text: 'AI 提示词工作流', link: '/seo/AI提示词工作流' },
          { text: '内容追踪矩阵', link: '/seo/内容追踪矩阵' },
          { text: 'SEO 验证清单', link: '/seo/SEO验证清单' },
        ]
      },
      {
        text: '部署',
        items: [
          { text: '部署教程', link: '/部署教程' },
          { text: 'Cloudflare Pages', link: '/部署教程#cloudflare-pages-部署推荐' },
          { text: 'Cloudflare Workers', link: '/部署教程#cloudflare-workers-部署使用-opennext' },
          { text: 'Cloudflare 缓存方案', link: '/Cloudflare缓存方案' },
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
