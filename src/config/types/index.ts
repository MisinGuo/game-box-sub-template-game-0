/**
 * 配置类型统一导出
 * 提供清晰的类型导入路径
 */

// 共享类型
export * from './common'

// 重新导出以提供更好的 IDE 提示
export type {
  LocalizedString,
  LocalizedArray,
  LinkConfig,
  ButtonConfig,
  SeoMetadata,
  LayoutType,
  DataLoadConfig,
} from './common'
