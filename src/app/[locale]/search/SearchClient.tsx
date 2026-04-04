'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { searchConfig } from '@/config/pages/search'
import { defaultLocale } from '@/config/site/locales'
import type { Locale } from '@/config/site/locales'
import ImageWithFallback from '../ImageWithFallback'

// 防抖Hook
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface Article {
  masterArticleId: number
  title: string
  slug?: string
  subtitle?: string
  articleType: string
  description?: string
  content?: string
  summary?: string
  coverUrl?: string
  categoryIcon?: string
  categoryName?: string
  sectionName?: string
  publishTime?: string
}

interface Game {
  id: number
  name: string
  subtitle?: string
  description?: string
  iconUrl?: string
  coverUrl?: string
  gameType?: string
  categoryName?: string
  categoryIcon?: string
  category?: string
  categories?: Array<{
    id?: number
    categoryId?: number
    name?: string
    categoryName?: string
    icon?: string
    categoryIcon?: string
    isPrimary?: string
  }>
  boxes?: Array<{
    boxId: number
    boxName: string
    logoUrl?: string
  }>
}

interface GameCategoryTag {
  id?: number
  name: string
  icon?: string
  isPrimary?: boolean
}

interface SearchResult {
  type: 'article' | 'game'
  id: number
  title: string
  subtitle?: string
  description?: string
  category?: string
  section?: string
  imageUrl?: string
  categoryIcon?: string
  gameType?: string
  categories?: GameCategoryTag[]
  boxes?: Array<{ boxId: number; boxName: string; logoUrl?: string }>
  date?: string
  url: string
}

interface SearchClientProps {
  locale: Locale
}

interface SearchProxyResponse {
  code: number
  msg: string
  data: {
    articles: Article[]
    games: Game[]
    articlesTotal: number
    gamesTotal: number
  }
}

function dedupeSearchResults(items: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  const result: SearchResult[] = []

  for (const item of items) {
    const key = `${item.type}-${item.id}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    result.push(item)
  }

  return result
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-16 rounded bg-slate-800" />
            <div className="h-5 w-20 rounded bg-slate-800" />
          </div>
          <div className="h-6 w-3/4 rounded bg-slate-800 mb-3" />
          <div className="h-4 w-1/3 rounded bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

export default function SearchClient({ locale }: SearchClientProps) {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const lp = (path: string) => locale === defaultLocale ? path : `/${locale}${path}`
  
  const [query, setQuery] = useState(urlQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'article' | 'game'>('all')
  
  // 使用防抖避免频繁请求
  const debouncedQuery = useDebounce(query, 500)

  const toPlainExcerpt = (text?: string, maxLen: number = 120): string | undefined => {
    if (!text) return undefined
    const plain = text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/[#>*_\-\[\]\(\)]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!plain) return undefined
    return plain.length > maxLen ? `${plain.slice(0, maxLen)}...` : plain
  }

  const resolveArticlePath = (article: Article): string => {
    const slugOrId = article.slug || String(article.masterArticleId)
    const section = article.sectionName || article.categoryName || ''
    const isReview = /评测|測評|review/i.test(section)
    const isTopic = /专题|專題|topic/i.test(section)
    const base = isReview ? '/content/reviews' : isTopic ? '/content/topics' : '/content/guides'
    return lp(`${base}/${slugOrId}`)
  }

  const normalizeGameCategories = (game: Game): GameCategoryTag[] => {
    const rawCategories = Array.isArray(game.categories) ? game.categories : []
    const fromApi = rawCategories
      .map((item) => {
        const name = item?.categoryName || item?.name
        if (!name) return null

        const rawId = item?.categoryId ?? item?.id
        const id = Number.isFinite(Number(rawId)) ? Number(rawId) : undefined

        return {
          id,
          name,
          icon: item?.categoryIcon || item?.icon,
          isPrimary: item?.isPrimary === '1',
        } as GameCategoryTag
      })
      .filter((item): item is GameCategoryTag => !!item)

    if (fromApi.length > 0) {
      return fromApi
    }

    const fallbackName = game.categoryName || game.category
    if (!fallbackName) {
      return []
    }

    return [{
      name: fallbackName,
      icon: game.categoryIcon,
      isPrimary: true,
    }]
  }

  // 搜索函数
  const performSearch = async (keyword: string, page: number = 1) => {
    if (!keyword.trim()) {
      setResults([])
      setSearchError(null)
      setTotalResults(0)
      setHasMore(false)
      return
    }

    setSearchError(null)
    setIsLoading(true)
    try {
      // 通过同域代理搜索，避免浏览器直接请求后端地址导致线上环境不可达
      const queryString = new URLSearchParams({
        keyword,
        locale,
        pageNum: String(page),
        pageSize: '10',
      }).toString()

      const res = await fetch(`/api/search?${queryString}`, {
        method: 'GET',
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const response: SearchProxyResponse = await res.json()
      const articles: Article[] = (response.data?.articles || []).filter(
        (article: Article) => Number.isFinite(Number(article?.masterArticleId)) && !!article?.title
      )
      const games: Game[] = (response.data?.games || []).filter(
        (game: Game) => Number.isFinite(Number(game?.id)) && !!game?.name
      )

      // 转换为统一的搜索结果格式
      const articleResults: SearchResult[] = articles.map(article => ({
        type: 'article' as const,
        id: article.masterArticleId,
        title: article.title,
        subtitle: article.subtitle,
        description: article.summary || article.description || toPlainExcerpt(article.content),
        category: article.categoryName || searchConfig.ui.uncategorized[locale],
        section: article.sectionName,
        categoryIcon: article.categoryIcon,
        imageUrl: article.coverUrl,
        date: article.publishTime,
        url: resolveArticlePath(article),
      }))

      const gameResults: SearchResult[] = games.map((game) => {
        const categories = normalizeGameCategories(game)
        const primaryCategory = categories.find((item) => item.isPrimary) || categories[0]

        return {
          type: 'game' as const,
          id: game.id,
          title: game.name,
          subtitle: game.subtitle,
          description: game.description,
          category: primaryCategory?.name || searchConfig.ui.uncategorized[locale],
          categoryIcon: primaryCategory?.icon,
          gameType: game.gameType,
          categories,
          boxes: game.boxes,
          imageUrl: game.iconUrl || game.coverUrl,
          url: lp(`/games/${game.id}`)
        }
      })

      // 合并结果：文章优先
      const incomingResults = dedupeSearchResults([...articleResults, ...gameResults])
      const total = (response.data?.articlesTotal || 0) + (response.data?.gamesTotal || 0)

      setTotalResults(total)
      setResults((prev) => {
        const merged = page === 1
          ? incomingResults
          : dedupeSearchResults([...prev, ...incomingResults])

        setHasMore(incomingResults.length > 0 && merged.length < total)
        return merged
      })
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchError(locale === 'en-US' ? 'Search service is temporarily unavailable.' : locale === 'zh-TW' ? '搜尋服務暫時不可用。' : '搜索服务暂时不可用。')
      setResults([])
      setTotalResults(0)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  // 监听搜索关键词变化
  useEffect(() => {
    setCurrentPage(1)
    performSearch(debouncedQuery, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  // 加载更多
  const loadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    performSearch(debouncedQuery, nextPage)
  }

  // 获取结果类型标签
  const getTypeBadge = (type: 'article' | 'game') => {
    if (type === 'article') {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
          {searchConfig.ui.strategies[locale]}
        </Badge>
      )
    }
    return (
      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
        {searchConfig.ui.games[locale]}
      </Badge>
    )
  }

  return (
    <div className="bg-slate-950 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{searchConfig.ui.search[locale]}</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              type="text"
              placeholder={searchConfig.ui.searchPlaceholder[locale]}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {query && results.length > 0 && (
          <div className="mb-6 flex items-center gap-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {searchConfig.ui.all[locale]} ({totalResults})
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'game'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {searchConfig.ui.games[locale]} ({results.filter(r => r.type === 'game').length})
              {activeTab === 'game' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('article')}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                activeTab === 'article'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {searchConfig.ui.strategies[locale]} ({results.filter(r => r.type === 'article').length})
              {activeTab === 'article' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && currentPage === 1 && query && (
          <div className="py-2">
            <SearchResultsSkeleton />
          </div>
        )}

        {/* Results */}
        {!isLoading || currentPage > 1 ? (
          query ? (
            <div>
              {results.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {results
                      .filter(item => activeTab === 'all' || item.type === activeTab)
                      .map((item, index) => (
                        <Link key={`${item.type}-${item.id}-${index}`} href={item.url}>
                          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                {item.imageUrl ? (
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-slate-800 shrink-0">
                                    <ImageWithFallback
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-slate-800 shrink-0 flex items-center justify-center text-slate-500 text-xl font-bold">
                                    {item.title.substring(0, 1)}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start gap-2 mb-2">
                                    {getTypeBadge(item.type)}
                                    {item.section && (
                                      <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20">
                                        {item.section}
                                      </Badge>
                                    )}
                                    {item.type === 'game' && item.categories && item.categories.length > 0 ? (
                                      item.categories.map((category, categoryIndex) => (
                                        <Badge
                                          key={`${item.type}-${item.id}-category-${category.id ?? categoryIndex}`}
                                          className={category.isPrimary
                                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                                            : 'bg-slate-800 text-slate-300 border-slate-700'
                                          }
                                        >
                                          {category.icon ? `${category.icon} ${category.name}` : category.name}
                                        </Badge>
                                      ))
                                    ) : item.category ? (
                                      <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                                        {item.categoryIcon ? `${item.categoryIcon} ${item.category}` : item.category}
                                      </Badge>
                                    ) : null}
                                    {item.gameType && (
                                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 uppercase">
                                        {item.gameType}
                                      </Badge>
                                    )}
                                    {item.type === 'game' && item.boxes && item.boxes.length > 0 && (
                                      item.boxes.map((box) => (
                                        <Badge
                                          key={`box-${box.boxId}`}
                                          className="bg-amber-500/10 text-amber-300 border-amber-500/20"
                                        >
                                          {box.logoUrl ? (
                                            <span className="flex items-center gap-1">
                                              <img src={box.logoUrl} alt={box.boxName} className="w-3.5 h-3.5 rounded-sm object-contain" />
                                              {box.boxName}
                                            </span>
                                          ) : (
                                            <>📦 {box.boxName}</>
                                          )}
                                        </Badge>
                                      ))
                                    )}
                                  </div>

                                  <h2 className="text-lg font-semibold text-white mb-1 hover:text-blue-400 transition-colors line-clamp-1">
                                    {item.title}
                                  </h2>

                                  {item.subtitle && (
                                    <div className="text-sm text-slate-400 mb-1 line-clamp-1">
                                      {item.subtitle}
                                    </div>
                                  )}

                                  {item.description && (
                                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}

                                  {item.date && (
                                    <div className="text-xs text-slate-500">
                                      {new Date(item.date).toLocaleDateString(locale === 'en-US' ? 'en-US' : locale === 'zh-TW' ? 'zh-TW' : 'zh-CN')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {searchConfig.ui.loading[locale]}
                          </>
                        ) : (
                          searchConfig.ui.loadMore[locale]
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : searchError ? (
                <div className="text-center py-12">
                  <div className="text-red-400 mb-2">{searchError}</div>
                  <div className="text-sm text-slate-500">
                    {locale === 'en-US' ? 'Please check API configuration and network connectivity.' : locale === 'zh-TW' ? '請檢查 API 配置與網路連線。' : '请检查 API 配置与网络连通性。'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-2">{searchConfig.ui.noResultsFound[locale]}</div>
                  <div className="text-sm text-slate-500">
                    {searchConfig.ui.tryOtherKeywords[locale]}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              {searchConfig.ui.startSearching[locale]}
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
