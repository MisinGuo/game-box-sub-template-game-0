import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { locales, defaultLocale } from '@/config/site/locales'
import type { Locale } from '@/config/site/locales'

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
}

export function BoxCard({ id, name, logoColor, logoText, logoUrl, description, tags, gameCount, rating, discount, locale = defaultLocale }: BoxCardProps) {
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

          {/* Footer with Game Count */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <span className="text-xs text-slate-500">
              🎮 {gameCountText}
            </span>
            <Button className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 font-semibold transition-all group-hover:shadow-lg group-hover:shadow-blue-500/30">
              {t.viewDetail}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
