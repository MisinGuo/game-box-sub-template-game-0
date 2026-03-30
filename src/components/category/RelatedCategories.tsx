import Link from 'next/link'
import { Gamepad2, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface RelatedCategoriesProps {
  categories: Array<{
    id: number
    name: string
    slug: string
    icon?: string
    gamesCount?: number
  }>
  locale: string
  defaultLocale: string
}

export default function RelatedCategories({ categories, locale, defaultLocale }: RelatedCategoriesProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  const getCategoryLink = (slug: string) => {
    return locale === defaultLocale ? `/games/category/${slug}` : `/${locale}/games/category/${slug}`
  }

  return (
    <section className="related-categories mb-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          您可能还喜欢
        </h2>
        <p className="text-sm text-muted-foreground">探索更多品类游戏</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={getCategoryLink(category.slug)}>
            <Card className="overflow-hidden hover:shadow-lg transition-all group h-full">
              <CardContent className="p-6 text-center">
                {category.icon && (
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.gamesCount !== undefined && (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4" />
                    <span>{category.gamesCount}款游戏</span>
                  </div>
                )}
                <ChevronRight className="h-5 w-5 mx-auto mt-2 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
