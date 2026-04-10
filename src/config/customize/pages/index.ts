/**
 * 页面配置统一入口
 * 按路由组织所有页面配置
 */

export type {
  HomePageConfig,
  HeroConfig,
  StatItem,
  ContentSectionConfig,
} from './home'

export { homeConfig } from './home'
export { boxesListConfig } from './boxes'
export { gamesListConfig } from './games'
export { searchConfig } from './search'
export { newsGroupsConfig } from './news'
export {
  ContentSection,
  ContentGroups,
  SiteSectionSlugGroups,
  sectionConfig,
} from './content'

import type { HomePageConfig } from './home'
import { homeConfig } from './home'

export const routeConfigs = {
  '/': homeConfig,
} as const

export function getPageConfig(route: keyof typeof routeConfigs) {
  return routeConfigs[route]
}

export function getHomePageConfig(): HomePageConfig {
  return homeConfig
}