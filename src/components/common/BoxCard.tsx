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

export function BoxCard({ id, name, logoColor, logoText, logoUrl, description, tags, gameCount, rating, discount, locale = defaultLocale, androidUrl, iosUrl }: BoxCardProps) {
  const t = locales[(locale as Locale) in locales ? (locale as Locale) : defaultLocale].translations
  const lp = (path: string) => locale === defaultLocale ? path : `/${locale}${path}`
  const gameCountText = locale === 'en-US' ? `${gameCount} ${t.gamesCount}` : `${gameCount}${t.gamesCount}`

  return (
    <Link href={lp(`/boxes/${id}`)}>
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20 group h-full cursor-pointer">
        <CardContent className="p-6 flex flex-col h-full">
          {/* Header with Logo and Action */}
          <div className="flex items-start justify-between mb-4">
            {logoUrl ? (
              <img 
                src={logoUrl}
                alt={name}
                className="w-14 h-14 rounded-lg shadow-lg shrink-0 group-hover:scale-110 transition-transform object-cover"
              />
            ) : (
              <div className={`w-14 h-14 rounded-lg ${logoColor} flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                {logoText}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">{rating}</span>
            </div>
          </div>

          {/* Title and Discount */}
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-300 transition-colors">{name}</h3>
          {discount && (
            <div className="mb-3">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs font-bold px-2 py-1">
                🔥 {discount}
              </Badge>
            </div>
          )}

          {/* Category Tags */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-block text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
              {description}
            </p>
          )}

          {/* Footer with Game Count and Download Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <span className="text-xs text-slate-500">
              🎮 {gameCountText}
            </span>
            <BoxDownloadButtons androidUrl={androidUrl} iosUrl={iosUrl} viewDetailText={t.viewDetail} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
