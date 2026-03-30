import Link from 'next/link'
import { Star, Download, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ImageWithFallback from '@/app/[locale]/ImageWithFallback'
import type { GameListItem } from '@/lib/api-types'
import { categoryTopGamesTranslations, getT } from '@/i18n/page-translations'


interface CategoryTopGamesProps {
  categoryName: string
  topGames: GameListItem[]
  locale: string
  defaultLocale: string
}

export default function CategoryTopGames({ 
  categoryName, 
  topGames, 
  locale,
  defaultLocale 
}: CategoryTopGamesProps) {
  if (!topGames || topGames.length === 0) {
    return null
  }

  const i18n = getT(categoryTopGamesTranslations, locale)

  const getGameLink = (gameId: number) => {
    return locale === defaultLocale ? `/games/${gameId}` : `/${locale}/games/${gameId}`
  }

  return (
    <section className="category-top-games mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <Flame className="inline h-7 w-7 text-orange-500 mr-2" />
            {categoryName} · {i18n.topTitle}
          </h2>
          <p className="text-sm text-muted-foreground">{i18n.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topGames.slice(0, 10).map((game, index) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-all group">
            <div className="flex gap-4 p-4">
              {/* 游戏图标 */}
              <Link href={getGameLink(game.id)} className="flex-shrink-0">
                <div className="relative">
                  <ImageWithFallback
                    src={game.iconUrl || game.coverImage || ''}
                    alt={game.name || game.title}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
                  />
                  {/* 排名标记 */}
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                </div>
              </Link>

              {/* 游戏信息 */}
              <div className="flex-1 min-w-0">
                <Link href={getGameLink(game.id)}>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors truncate">
                    {game.name || game.title}
                  </h3>
                </Link>
                
                {/* 评分和标签 */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {game.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{game.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {game.isNew && (
                    <Badge variant="default" className="text-xs">{i18n.isNew}</Badge>
                  )}
                  {game.isHot && (
                    <Badge variant="destructive" className="text-xs">{i18n.isHot}</Badge>
                  )}
                  {game.isRecommend && (
                    <Badge variant="secondary" className="text-xs">{i18n.isRecommend}</Badge>
                  )}
                </div>

                {/* 简短描述 */}
                {game.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {game.description}
                  </p>
                )}

                {/* 下载量 */}
                {game.downloadCount && game.downloadCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <Download className="h-3 w-3" />
                    <span>{game.downloadCount.toLocaleString()}{i18n.downloads}</span>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-2">
                  <Link href={getGameLink(game.id)}>
                    <Button size="sm" className="h-8">
                      {i18n.viewDetail}
                    </Button>
                  </Link>
                  <Link href={getGameLink(game.id)}>
                    <Button size="sm" variant="outline" className="h-8">
                      {i18n.register}
                    </Button>
                  </Link>
                  <Link href={getGameLink(game.id)}>
                    <Button size="sm" variant="ghost" className="h-8">
                      {i18n.gift}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
