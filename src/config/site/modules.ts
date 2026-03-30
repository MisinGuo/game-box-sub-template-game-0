import type { ModuleConfig, ModuleType } from '../types'

/**
 * 文档模块配置
 * 
 * 每个模块 (content、news) 可以有不同的：
 * - 布局和样式
 * - 功能组件 (下载入口、分类过滤器等)
 * - 侧边栏内容
 * - 列表展示方式
 */
export const modules: Record<ModuleType, ModuleConfig> = {
  /**
   * 内容中心模块
   */
  content: {
    type: 'content',
    title: '内容中心',
    description: '游戏攻略、资讯、评测和专题',
    contentPath: 'api/articles',
    routePrefix: '/content',
    
    theme: {
      primaryColor: 'green',
      badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
      badgeText: '内容',
    },
    
    categoryFilter: {
      enabled: true,
      title: '内容分类',
      type: 'category',
      showCount: true,
    },
    
    downloadEntry: {
      enabled: true,
      position: 'sidebar',
      buttonText: '查看游戏盒子',
      buttonLink: '/boxes',
      buttonStyle: 'gradient',
    },
    
    sidebar: {
      enabled: true,
      showTOC: true,
      showRelated: true,
      showDownload: true,
      components: ['TOC', 'RelatedArticles', 'Download'],
    },
    
    articleList: {
      layout: 'grid',
      showCover: true,
      showExcerpt: true,
      pageSize: 12,
      showDate: true,
      showCategory: true,
      showReadingTime: false,
    },
    
    articleDetail: {
      showBreadcrumb: true,
      showMeta: true,
      showTOC: true,
      showAuthor: false,
      showTags: false,
      showRelated: false,
      showComments: false,
      showShare: true,
    },
  },

  /**
   * 资讯速报模块
   */
  news: {
    type: 'news',
    title: '资讯速报',
    description: '游戏资讯、新闻、公告速报',
    contentPath: 'api/articles',
    routePrefix: '/news',

    theme: {
      primaryColor: 'green',
      badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
      badgeText: '资讯',
    },

    categoryFilter: {
      enabled: true,
      title: '资讯分类',
      type: 'category',
      showCount: true,
    },

    downloadEntry: {
      enabled: true,
      position: 'sidebar',
      buttonText: '查看游戏盒子',
      buttonLink: '/boxes',
      buttonStyle: 'gradient',
    },

    sidebar: {
      enabled: true,
      showTOC: true,
      showRelated: true,
      showDownload: true,
      components: ['TOC', 'RelatedArticles', 'Download'],
    },

    articleList: {
      layout: 'grid',
      showCover: true,
      showExcerpt: true,
      pageSize: 12,
      showDate: true,
      showCategory: true,
      showReadingTime: false,
    },

    articleDetail: {
      showBreadcrumb: true,
      showMeta: true,
      showTOC: true,
      showAuthor: false,
      showTags: false,
      showRelated: false,
      showComments: false,
      showShare: true,
    },
  },
}

/** 获取模块配置 */
export function getModuleConfig(type: ModuleType): ModuleConfig {
  return modules[type]
}

/** 根据路径获取模块配置 */
export function getModuleFromPath(path: string): ModuleConfig | null {
  if (path.startsWith('/content')) {
    return modules.content
  }
  if (path.startsWith('/news')) {
    return modules.news
  }
  return null
}
