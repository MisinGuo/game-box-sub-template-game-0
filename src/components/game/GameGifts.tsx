import Link from 'next/link'
import { Gift, Calendar, Users, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ImageWithFallback from '@/app/[locale]/ImageWithFallback'
import type { GiftListItem } from '@/lib/api-types'

interface GameGiftsProps {
  gameName: string
  gameId: number
  gifts: GiftListItem[]
  locale: string
  defaultLocale: string
}

export default function GameGifts({ gameName, gameId, gifts, locale, defaultLocale }: GameGiftsProps) {
  const i18n = {
    sectionTitle: locale === 'zh-TW' ? '專屬砲包' : locale === 'en-US' ? 'Exclusive Gift Packs' : '专属礼包',
    noGifts: locale === 'zh-TW' ? '暫無可用砲包' : locale === 'en-US' ? 'No gift packs available' : '暂无可用礼包',
    gameGifts: locale === 'zh-TW' ? `${gameName} 專屬砲包` : locale === 'en-US' ? `${gameName} Gift Packs` : `${gameName} 专属礼包`,
    subtitle: locale === 'zh-TW' ? '立即領取，先到先得' : locale === 'en-US' ? 'Claim now, first come first served' : '立即领取，先到先得',
    available: locale === 'zh-TW' ? '✓ 可領取' : locale === 'en-US' ? '✓ Available' : '✓ 可领取',
    giftContent: locale === 'zh-TW' ? '砲包內容：' : locale === 'en-US' ? 'Contents:' : '礼包内容：',
    validUntil: locale === 'zh-TW' ? '有效期至：' : locale === 'en-US' ? 'Valid until:' : '有效期至：',
    claimed: (r: number, total: number) => locale === 'zh-TW' ? `已領取 ${r} / ${total}` : locale === 'en-US' ? `${r} / ${total} claimed` : `已领取 ${r} / ${total}`,
    remaining: (n: number) => locale === 'zh-TW' ? `(剩餘 ${n})` : locale === 'en-US' ? `(${n} left)` : `(剩余 ${n})`,
    claimBtn: locale === 'zh-TW' ? '立即領取砲包' : locale === 'en-US' ? 'Claim Gift Pack' : '立即领取礼包',
    giftCode: locale === 'zh-TW' ? '砲包碼：' : locale === 'en-US' ? 'Gift Code:' : '礼包码：',
  }

  if (!gifts || gifts.length === 0) {
    return (
      <section className="game-gifts mb-12">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <Gift className="inline h-7 w-7 text-orange-500 mr-2" />
            {i18n.sectionTitle}
          </h2>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {i18n.noGifts}
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="game-gifts mb-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <Gift className="inline h-7 w-7 text-orange-500 mr-2" />
          {i18n.gameGifts}
        </h2>
        <p className="text-sm text-muted-foreground">{i18n.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift) => (
          <Card key={gift.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-6">
              {/* 礼包名称 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{gift.name}</h3>
                  {gift.status && (
                    <span className="text-xs text-green-500">{i18n.available}</span>
                  )}
                </div>
                <Gift className="h-6 w-6 text-orange-500 flex-shrink-0" />
              </div>

              {/* 礼包内容 */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-1">{i18n.giftContent}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {gift.content}
                </p>
              </div>

              {/* 礼包信息 */}
              <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                {gift.validUntil && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{i18n.validUntil}{new Date(gift.validUntil).toLocaleDateString(locale)}</span>
                  </div>
                )}
                {gift.receiveCount !== undefined && gift.totalCount && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{i18n.claimed(gift.receiveCount, gift.totalCount)}</span>
                    {gift.totalCount - gift.receiveCount > 0 && (
                      <span className="text-orange-500 font-semibold">
                        {i18n.remaining(gift.totalCount - gift.receiveCount)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 领取按钮 */}
              <Button className="w-full" size="lg">
                <Gift className="h-4 w-4 mr-2" />
                {i18n.claimBtn}
              </Button>

              {/* 礼包码展示区域（领取后显示） */}
              {gift.code && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">{i18n.giftCode}</p>
                  <code className="text-lg font-mono font-bold text-primary">
                    {gift.code}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
