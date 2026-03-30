import Link from 'next/link'
import { Download, Zap, Gift, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

/**
 * 文章元信息组件 - SEO 安全，无客户端代码
 */
interface ArticleMetaProps {
  title?: string
  date?: string
  category?: string
  readingTime?: number
  views?: string
}

export function ArticleMeta({ title, date, category, readingTime, views }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-800">
      {date && <time dateTime={date}>{date} 发布</time>}
      {readingTime && <span>阅读约 {readingTime} 分钟</span>}
      {views && <span>阅读 {views}</span>}
      {category && (
        <Badge variant="outline" className="text-slate-400 border-slate-700">
          {category}
        </Badge>
      )}
    </div>
  )
}

/**
 * 下载盒子卡片组件 - SEO 安全
 */
interface DownloadBoxProps {
  gameName?: string
  boxes?: Array<{
    name: string
    logo: string
    logoColor: string
    discount: string
    description: string
    isRecommended?: boolean
  }>
}

const defaultBoxes = [
  {
    name: '咪噜盒子',
    logo: '咪',
    logoColor: 'bg-orange-500',
    discount: '0.1折',
    description: '上线送VIP10 · 充值648仅需6.48元',
    isRecommended: true,
  },
  {
    name: 'BTGo盒子',
    logo: 'BT',
    logoColor: 'bg-green-500',
    discount: '福利版',
    description: '送无限钻石 · 每日领648代金券',
  },
  {
    name: '九妖游戏',
    logo: '九',
    logoColor: 'bg-purple-600',
    discount: '4折',
    description: '老牌折扣平台 · 大额代金券',
  },
]

export function DownloadBox({ gameName, boxes = defaultBoxes }: DownloadBoxProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden my-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Download className="h-4 w-4" /> 
          {gameName ? `下载 ${gameName}` : '下载本游戏'}
        </h3>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-800">
          {boxes.map((box, index) => (
            <div key={index} className="p-4 hover:bg-slate-800/50 transition-colors">
              <div className="flex gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg ${box.logoColor} flex items-center justify-center text-white font-bold text-lg`}>
                  {box.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{box.name}</h4>
                    <Badge className={`${box.isRecommended ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'} hover:opacity-90 text-[10px] px-1 h-5`}>
                      {box.discount}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{box.description}</p>
                </div>
              </div>
              <Button 
                className={`w-full h-9 text-sm font-semibold ${box.isRecommended ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={box.isRecommended ? 'default' : 'outline'}
                asChild
              >
                <Link href="/boxes">
                  {box.isRecommended ? `用${box.name}下载 (推荐)` : `下载 ${box.name} 版`}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 游戏截图组件 - SEO 安全
 */
interface GameScreenshotsProps {
  images: string[]
  alt?: string
}

export function GameScreenshots({ images, alt = '游戏截图' }: GameScreenshotsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      {images.map((src, index) => (
        <div key={index} className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={src} 
            alt={`${alt} ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}

/**
 * 实用提示组件 - SEO 安全
 */
interface TipBoxProps {
  title?: string
  children: React.ReactNode
  type?: 'tip' | 'warning' | 'info'
}

export function TipBox({ title = '实用 Tip', children, type = 'tip' }: TipBoxProps) {
  const colors = {
    tip: 'bg-amber-900/20 border-amber-900/50 text-amber-500',
    warning: 'bg-red-900/20 border-red-900/50 text-red-500',
    info: 'bg-blue-900/20 border-blue-900/50 text-blue-500',
  }
  
  const textColors = {
    tip: 'text-amber-200/80',
    warning: 'text-red-200/80',
    info: 'text-blue-200/80',
  }
  
  return (
    <div className={`${colors[type]} border rounded-lg p-4 my-6`}>
      <h4 className={`font-bold mb-2 flex items-center gap-2`}>
        <Zap className="h-4 w-4" /> {title}
      </h4>
      <div className={`${textColors[type]} text-sm`}>
        {children}
      </div>
    </div>
  )
}

/**
 * 福利对比组件 - SEO 安全
 */
interface DiscountCompareProps {
  items: Array<{
    platform: string
    discount: string
    highlight?: boolean
  }>
}

export function DiscountCompare({ items }: DiscountCompareProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 my-6">
      <CardContent className="p-4">
        <h4 className="text-base text-white flex items-center gap-2 mb-4">
          <Gift className="h-4 w-4 text-purple-400" /> 折扣与福利对比
        </h4>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2 last:border-0">
              <span className="text-slate-400">{item.platform}</span>
              <span className={item.highlight ? 'font-bold text-orange-400' : 'text-slate-200'}>
                {item.discount}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-slate-950 p-3 rounded text-xs text-slate-400">
          <p className="flex items-start gap-2">
            <Shield className="h-3 w-3 mt-0.5 text-blue-400 shrink-0" />
            平台担保：所有推荐盒子均为官方授权运营，充值安全有保障。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 游戏信息卡片 - SEO 安全
 */
interface GameInfoCardProps {
  name: string
  category?: string
  rating?: number
  description?: string
}

export function GameInfoCard({ name, category, rating, description }: GameInfoCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-800/50 my-8 p-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-2">想要体验 {name} 完整版？</h3>
        {description && <p className="text-slate-400 mb-4 text-sm">{description}</p>}
        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8" asChild>
          <Link href="/boxes">立即下载领取福利</Link>
        </Button>
      </div>
    </Card>
  )
}
