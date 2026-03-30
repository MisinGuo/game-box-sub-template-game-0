/**
 * 游戏盒子下载逻辑处理器
 * 
 * 为每个游戏盒子定义自定义的下载逻辑
 * 可以根据盒子名称实现不同的下载流程（跳转、表单、直接下载等）
 */

export interface DownloadHandler {
  /** 处理器名称 */
  name: string
  /** 下载说明 */
  description?: string
  /** 自定义下载逻辑 */
  execute: (boxData: any) => Promise<void> | void
}

/**
 * 默认下载处理器
 * 当没有匹配的自定义处理器时使用
 */
const defaultHandler: DownloadHandler = {
  name: 'default',
  description: '直接下载',
  execute: (boxData) => {
    if (boxData.downloadUrl) {
      window.open(boxData.downloadUrl, '_blank')
    } else {
      alert('暂无下载链接')
    }
  }
}

/**
 * 游戏盒子下载处理器映射
 * 
 * 使用方法：
 * 1. 根据盒子名称添加对应的处理器
 * 2. 在execute函数中实现自定义下载逻辑
 * 
 * 示例：
 * 'U2Game盒子': {
 *   name: 'U2Game盒子',
 *   description: '跳转到官网下载页面',
 *   execute: (boxData) => {
 *     window.location.href = 'https://u2game.com/download'
 *   }
 * }
 */
const downloadHandlers: Record<string, DownloadHandler> = {
  // 在这里添加每个盒子的自定义下载逻辑
  // 格式：'盒子名称': { name, description, execute }
  
  // 示例 1: 直接跳转到外部下载页面
  // 'U2Game盒子': {
  //   name: 'U2Game盒子',
  //   description: '跳转到U2Game官网下载',
  //   execute: (boxData) => {
  //     window.location.href = 'https://u2game.com/download'
  //   }
  // },

  // 示例 2: 显示自定义下载说明
  // '277': {
  //   name: '277',
  //   description: '扫码下载',
  //   execute: async (boxData) => {
  //     // 可以打开模态框显示二维码
  //     // 或跳转到自定义下载页面
  //     console.log('显示二维码下载')
  //   }
  // },

  // 示例 3: 需要先注册的下载流程
  // '某游戏盒子': {
  //   name: '某游戏盒子',
  //   description: '注册后下载',
  //   execute: async (boxData) => {
  //     // 检查是否已登录
  //     // 如果未登录，跳转到登录/注册页面
  //     // 登录后继续下载
  //   }
  // },
}

/**
 * 获取指定盒子的下载处理器
 * @param boxName 盒子名称
 * @returns 下载处理器
 */
export function getDownloadHandler(boxName: string): DownloadHandler {
  return downloadHandlers[boxName] || defaultHandler
}

/**
 * 执行下载逻辑
 * @param boxName 盒子名称
 * @param boxData 盒子数据
 */
export async function executeDownload(boxName: string, boxData: any): Promise<void> {
  const handler = getDownloadHandler(boxName)
  await handler.execute(boxData)
}

/**
 * 检查是否有自定义下载处理器
 * @param boxName 盒子名称
 * @returns 是否有自定义处理器
 */
export function hasCustomHandler(boxName: string): boolean {
  return !!downloadHandlers[boxName]
}
