import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { locales, defaultLocale } from '@/config/site/locales'
import type { Locale } from '@/config/site/locales'
import { BoxDownloadButtons } from '@/components/common/BoxDownloadButtons'

interface BoxCardProps {
  id: number;
  name: string;
  logoColor: string;
  logoText: string;
  logoUrl?: string;
  description: string;
  tags: string[];
  gameCount: number;
  rating: number;
  discount: string;
  locale?: string;
  androidUrl?: string;
  iosUrl?: string;
}

const translations: Record<string, { gameCount: string; games: string }> = {
  'zh-CN': { gameCount: '款游戏', games: '游戏' },
  'zh-TW': { gameCount: '款遊戲', games: '遊戲' },
  'en-US': { gameCount: ' games', games: 'Games' },
}

export function BoxCard({ id, name, logoColor, logoText, logoUrl, description, tags, gameCount, rating, discount, locale = defaultLocale, androidUrl, iosUrl }: BoxCardProps) {
  const t = translations[locale] || translations[defaultLocale]
  const gameCountText = `${gameCount}${t.gameCount}`
  const detailUrl = locale === defaultLocale ? `/boxes/${id}` : `/${locale}/boxes/${id}`

  return (
    <div className="group">
      <Card className="overflow-hidden bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 h-full">
        <CardContent className="p-6">
          {/* Logo and Name */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden"
              style={{ backgroundColor: logoColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                logoText
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={detailUrl} className="hover:text-blue-400 transition-colors">
                <h3 className="font-semibold text-white truncate">{name}</h3>
              </Link>
              {tags.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-slate-700 text-slate-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {discount && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 shrink-0">
                {discount}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">{description}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm text-yellow-500">{rating}</span>
          </div>

          {/* Footer with Game Count and Download Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <Link href={detailUrl} className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              🎮 {gameCountText}
            </Link>
            <BoxDownloadButtons androidUrl={androidUrl} iosUrl={iosUrl} viewDetailText="查看详情" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
