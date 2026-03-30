/**
 * 页面配置统一入口
 * 按路由组织所有页面配置
 */

// 导出首页类型（从 home 模块）
export type {
  HomePageConfig,
  HeroConfig,
  StatItem,
  ContentSectionConfig,
} from './home'

// 导出各页面配置
export { homeConfig } from './home'

import type { HomePageConfig } from './home'
import { homeConfig } from './home'

/**
 * 路由到配置的映射
 */
export const routeConfigs = {
  '/': homeConfig,
} as const

/**
 * 根据路由获取页面配置
 */
export function getPageConfig(route: keyof typeof routeConfigs) {
  return routeConfigs[route]
}

/**
 * 获取首页配置（现在直接返回静态配置）
 */
export function getHomePageConfig(): HomePageConfig {
  return homeConfig
}
