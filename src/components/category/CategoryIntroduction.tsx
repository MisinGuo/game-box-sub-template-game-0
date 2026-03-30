import { Gamepad2, FileText, Gift } from 'lucide-react'
import ImageWithFallback from '@/app/[locale]/ImageWithFallback'
import { Badge } from '@/components/ui/badge'

interface CategoryIntroductionProps {
  category: {
    id: number
    name: string
    slug: string
    icon?: string
    description?: string
    longDescription?: string
    bannerUrl?: string
    tags?: string[]
    welcomeMessage?: string
  }
  stats: {
    gamesCount: number
    guidesCount: number
    giftsCount: number
  }
  fromSubSite?: boolean
}

export default function CategoryIntroduction({ category, stats, fromSubSite }: CategoryIntroductionProps) {
  return (
    <section className="category-introduction mb-8">
      {/* Banner图 */}
      {category.bannerUrl && (
        <div className="category-banner mb-6 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={category.bannerUrl}
            alt={`${category.name}品类`}
            className="w-full h-48 md:h-64 object-cover"
          />
        </div>
      )}

      {/* 欢迎提示（来自子站） */}
      {fromSubSite && category.welcomeMessage && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm md:text-base">
            👋 <span className="font-semibold">{category.welcomeMessage}</span>
          </p>
        </div>
      )}

      {/* 品类头部 */}
      <div className="flex items-start gap-4 mb-6">
        {category.icon && (
          <span className="text-4xl md:text-5xl">{category.icon}</span>
        )}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground text-sm md:text-base">{category.description}</p>
          )}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold">{stats.gamesCount}</div>
          <div className="text-sm text-muted-foreground">游戏</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gift className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{stats.giftsCount}</div>
          <div className="text-sm text-muted-foreground">礼包</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{stats.guidesCount}</div>
          <div className="text-sm text-muted-foreground">攻略</div>
        </div>
      </div>

      {/* 详细介绍 */}
      {category.longDescription && (
        <div className="prose prose-sm md:prose-base max-w-none mb-6">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {category.longDescription}
          </p>
        </div>
      )}

      {/* 品类标签 */}
      {category.tags && category.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {category.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </section>
  )
}
