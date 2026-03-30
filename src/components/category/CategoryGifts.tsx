import Link from 'next/link'
import { Gift, Calendar, Users, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ImageWithFallback from '@/app/[locale]/ImageWithFallback'
import type { GiftListItem } from '@/lib/api-types'

interface CategoryGiftsProps {
  categoryName: string
  categorySlug: string
  gifts: GiftListItem[]
  locale: string
  defaultLocale: string
}

export default function CategoryGifts({ 
  categoryName, 
  categorySlug,
  gifts, 
  locale,
  defaultLocale 
}: CategoryGiftsProps) {
  if (!gifts || gifts.length === 0) {
    return null
  }

  const getGameLink = (gameId: number) => {
    return locale === defaultLocale ? `/games/${gameId}` : `/${locale}/games/${gameId}`
  }

  const getGiftsLink = () => {
    return locale === defaultLocale ? `/gifts?category=${categorySlug}` : `/${locale}/gifts?category=${categorySlug}`
  }

  return (
    <section className="category-gifts mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <Gift className="inline h-7 w-7 text-orange-500 mr-2" />
            {categoryName}专属礼包
          </h2>
          <p className="text-sm text-muted-foreground">注册即领，先到先得</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.slice(0, 6).map((gift) => (
          <Card key={gift.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-4">
              {/* 游戏信息 */}
              <div className="flex items-center gap-3 mb-3">
                {gift.gameIcon && (
                  <ImageWithFallback
                    src={gift.gameIcon}
                    alt={gift.gameName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link href={getGameLink(gift.gameId)} className="hover:text-primary transition-colors">
                    <h3 className="font-semibold truncate">{gift.gameName}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground">{gift.name}</p>
                </div>
              </div>

              {/* 礼包内容 */}
              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gift.content}
                </p>
              </div>

              {/* 礼包信息 */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                {gift.validUntil && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>有效期至 {new Date(gift.validUntil).toLocaleDateString()}</span>
                  </div>
                )}
                {gift.receiveCount !== undefined && gift.totalCount && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>剩余 {gift.totalCount - gift.receiveCount}</span>
                  </div>
                )}
              </div>

              {/* 领取按钮 */}
              <Link href={getGameLink(gift.gameId)}>
                <Button className="w-full" size="sm">
                  <Gift className="h-4 w-4 mr-2" />
                  立即领取
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 查看更多 */}
      {gifts.length > 6 && (
        <div className="text-center mt-6">
          <Link href={getGiftsLink()}>
            <Button variant="outline">
              查看更多礼包 ({gifts.length}个)
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
