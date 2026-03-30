/**
 * 资讯页配置
 * 路由: /news
 */

import type { LocalizedString } from '../types/common'
import { ContentSection } from './content'

export interface NewsGroupConfig {
  id: string
  emoji: string
  title: LocalizedString
  desc: LocalizedString
  badgeClass: string
  sections: ContentSection[]
}

export const newsGroupsConfig: NewsGroupConfig[] = [
  {
    id: 'update',
    emoji: '🔄',
    title: {
      'zh-CN': '版本更新',
      'zh-TW': '版本更新',
      'en-US': 'Version Updates',
    },
    desc: {
      'zh-CN': '游戏版本迭代、新内容上线、BUG修复速报',
      'zh-TW': '遊戲版本迭代、新內容上線、BUG修復速報',
      'en-US': 'Game version changes, new content releases and patch notes',
    },
    badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    sections: [ContentSection.NEWS_UPDATE],
  },
  {
    id: 'event',
    emoji: '🎉',
    title: {
      'zh-CN': '活动资讯',
      'zh-TW': '活動資訊',
      'en-US': 'Events',
    },
    desc: {
      'zh-CN': '限时活动、节日礼包、平台促销，不错过任何福利',
      'zh-TW': '限時活動、節日禮包、平台促銷，不錯過任何福利',
      'en-US': 'Limited events, holiday gifts and platform promotions',
    },
    badgeClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
    sections: [ContentSection.NEWS_EVENT],
  },
  {
    id: 'industry',
    emoji: '📰',
    title: {
      'zh-CN': '行业动态',
      'zh-TW': '行業動態',
      'en-US': 'Industry News',
    },
    desc: {
      'zh-CN': '手游市场趋势、盒子平台动向、行业新游速报',
      'zh-TW': '手遊市場趨勢、盒子平台動向、行業新遊速報',
      'en-US': 'Mobile game market trends and platform developments',
    },
    badgeClass: 'bg-slate-500/20 text-slate-400 dark:text-slate-300',
    sections: [ContentSection.NEWS_INDUSTRY],
  },
]
