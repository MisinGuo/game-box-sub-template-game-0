/**
 * 统一路由配置
 * 集中管理所有页面的路由、导航、SEO配置
 */

export interface RouteConfig {
  /** 路由路径 */
  path: string
  /** 页面标题（用于导航和SEO） */
  title: string
  /** 页面描述 */
  description?: string
  /** 是否启用该页面 */
  enabled: boolean
  /** 是否在导航栏显示 */
  showInNav: boolean
  /** 导航栏位置（数字越小越靠前） */
  navOrder?: number
  /** 父级路由（用于下拉菜单） */
  parent?: string
  /** 图标（可选） */
  icon?: string
  /** 子路由 */
  children?: RouteConfig[]
}

/**
 * 所有路由配置
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    title: '首页',
    description: '游戏盒子推荐、游戏折扣对比平台',
    enabled: true,
    showInNav: true,
    navOrder: 1,
  },
  {
    path: '/games',
    title: '游戏库',
    description: '热门游戏折扣对比',
    enabled: true,
    showInNav: true,
    navOrder: 2,
  },
  {
    path: '/boxes',
    title: '盒子大全',
    description: '游戏盒子推荐和对比',
    enabled: true,
    showInNav: true,
    navOrder: 3,
  },
  {
    path: '/content',
    title: '内容中心',
    description: '攻略、评测、专题等内容聚合',
    enabled: true,
    showInNav: true,
    navOrder: 4,
  },
  {
    path: '/content/guides',
    title: '攻略',
    description: '游戏攻略合集',
    enabled: true,
    showInNav: false,
  },
  {
    path: '/content/reviews',
    title: '评测',
    description: '游戏评测合集',
    enabled: true,
    showInNav: false,
  },
  {
    path: '/content/topics',
    title: '专题',
    description: '游戏专题合集',
    enabled: true,
    showInNav: false,
  },
  {
    path: '/news',
    title: '资讯',
    description: '最新游戏活动与行业动态',
    enabled: true,
    showInNav: true,
    navOrder: 5,
  },
  {
    path: '/search',
    title: '搜索',
    description: '搜索游戏、盒子和内容',
    enabled: true,
    showInNav: false,
  },
]

/**
 * 获取启用的路由
 */
export function getEnabledRoutes(): RouteConfig[] {
  return routes.filter(route => route.enabled)
}

/**
 * 获取导航栏路由
 */
export function getNavRoutes(): RouteConfig[] {
  return routes
    .filter(route => route.enabled && route.showInNav)
    .sort((a, b) => (a.navOrder || 999) - (b.navOrder || 999))
}

/**
 * 根据路径获取路由配置
 */
export function getRouteByPath(path: string): RouteConfig | undefined {
  return routes.find(route => route.path === path)
}

/**
 * 构建导航菜单结构（支持下拉菜单）
 */
export interface NavItem {
  text: string
  link?: string
  children?: NavItem[]
}

export function buildNavMenu(): NavItem[] {
  const navRoutes = getNavRoutes()
  const menuMap = new Map<string, NavItem>()
  const rootItems: NavItem[] = []

  // 第一遍：创建所有菜单项
  navRoutes.forEach(route => {
    const item: NavItem = {
      text: route.title,
      link: route.path,
    }
    
    if (route.parent) {
      if (!menuMap.has(route.parent)) {
        menuMap.set(route.parent, {
          text: route.parent === 'guides' ? '攻略' : route.parent,
          children: [],
        })
      }
      const parent = menuMap.get(route.parent)!
      if (!parent.children) parent.children = []
      parent.children.push(item)
    } else {
      rootItems.push(item)
    }
  })

  // 第二遍：合并父子关系
  const result: NavItem[] = []
  rootItems.forEach(item => {
    result.push(item)
  })
  
  // 添加有子项的父菜单
  menuMap.forEach(parentItem => {
    if (parentItem.children && parentItem.children.length > 0) {
      result.push(parentItem)
    }
  })

  return result.sort((a, b) => {
    const aRoute = routes.find(r => r.title === a.text)
    const bRoute = routes.find(r => r.title === b.text)
    return (aRoute?.navOrder || 999) - (bRoute?.navOrder || 999)
  })
}
