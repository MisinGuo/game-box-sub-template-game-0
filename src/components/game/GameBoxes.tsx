'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Download, Globe, Sparkles, Gift } from 'lucide-react'
import Link from 'next/link'

/**
 * promotionLinks JSON 结构示例：
 * { download_url, web_url, ios_url, web_url_alt, android_url_alt, h5_url, mash_url, short_url, ... }
 */
interface PromotionLinks {
  download_url?: string
  web_url?: string
  ios_url?: string
  web_url_alt?: string
  alt_web_url?: string
  android_url_alt?: string
  ios_url_alt?: string
  h5_url?: string
  mash_url?: string
  short_url?: string
  short_mash_url?: string
  [key: string]: string | undefined
}

/**
 * platformData JSON 结构示例：
 * { cps_ratio, is_h5, platform_game_id, genre_raw, version_raw, box_welfare_content, ... }
 */
interface PlatformData {
  cps_ratio?: number | string
  cps_ratio_wx?: number | string
  is_h5?: string | boolean
  platform_game_id?: string
  genre_raw?: string
  version_raw?: string
  platform_name?: string
  box_welfare_content?: string
  cps_text?: string
  cps_cpa_info?: string
  hw_cps_cpa_info?: string
  copy_text?: string
  is_cloud_game?: string
  video_url?: string
  [key: string]: any
}

export interface BoxRelation {
  id: number
  boxId: number
  gameId: number
  boxName?: string
  gameName?: string
  boxLogoUrl?: string
  discountLabel?: string
  firstChargeDomestic?: number
  firstChargeOverseas?: number
  rechargeDomestic?: number
  rechargeOverseas?: number
  hasSupport?: string
  supportDesc?: string
  downloadUrl?: string
  promoteUrl?: string
  qrcodeUrl?: string
  promoteText?: string
  posterUrl?: string
  promotionLinks?: string  // JSON string
  platformData?: string    // JSON string
  isFeatured?: string
  isExclusive?: string
  isNew?: string
  customName?: string
  customDescription?: string
  customDownloadUrl?: string
}

interface GameBoxesProps {
  boxes: BoxRelation[]
  locale: string
  defaultLocale: string
}

/** 安全解析 JSON */
function parseJSON<T>(str?: string | null): T | null {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

/** 判断 URL 是否有效（过滤 "无"、空字符串等） */
function isValidUrl(url?: string | null): url is string {
  if (!url) return false
  const trimmed = url.trim()
  return trimmed.length > 0 && trimmed !== '无' && trimmed.startsWith('http')
}

/** 推广链接字段 → 可读标签 */
const LINK_LABELS: Record<string, string> = {
  download_url: '下载',
  web_url: '网页版',
  ios_url: 'iOS',
  h5_url: 'H5',
  web_url_alt: '备用网页',
  alt_web_url: '备用网页',
  android_url_alt: '安卓备用',
  ios_url_alt: 'iOS备用',
  mash_url: '专属链接',
  short_url: '短链接',
  short_mash_url: '专属短链',
}

/** 从 promotionLinks 提取有效链接列表 */
function extractLinks(promoLinks: PromotionLinks | null): { label: string; url: string }[] {
  if (!promoLinks) return []
  const links: { label: string; url: string }[] = []

  // 优先级顺序展示
  const orderedKeys = ['download_url', 'web_url', 'h5_url', 'ios_url', 'android_url_alt', 'web_url_alt', 'alt_web_url', 'ios_url_alt', 'mash_url', 'short_url', 'short_mash_url']

  for (const key of orderedKeys) {
    const url = promoLinks[key]
    if (isValidUrl(url)) {
      links.push({ label: LINK_LABELS[key] || key, url })
    }
  }

  // 兜底：检查其他未列出的 key
  for (const [key, url] of Object.entries(promoLinks)) {
    if (!orderedKeys.includes(key) && isValidUrl(url) && !links.some(l => l.url === url)) {
      links.push({ label: LINK_LABELS[key] || key, url })
    }
  }

  // 去重（相同 URL 只保留第一个）
  const seen = new Set<string>()
  return links.filter(l => {
    if (seen.has(l.url)) return false
    seen.add(l.url)
    return true
  })
}

export default function GameBoxes({ boxes, locale, defaultLocale }: GameBoxesProps) {
  if (!boxes || boxes.length === 0) return null

  const localePath = (path: string) =>
    locale === defaultLocale ? path : `/${locale}${path}`

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          📦 可用盒子
        </span>
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs ml-1">
          {boxes.length}
        </Badge>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boxes.map((box) => {
          const promoLinks = parseJSON<PromotionLinks>(box.promotionLinks)
          const platform = parseJSON<PlatformData>(box.platformData)
          const links = extractLinks(promoLinks)

          // 确定主下载链接：customDownloadUrl > promotionLinks.download_url > box.downloadUrl
          const mainDownloadUrl =
            box.customDownloadUrl ||
            (promoLinks && isValidUrl(promoLinks.download_url) ? promoLinks.download_url : null) ||
            box.downloadUrl ||
            null

          const displayName = box.customName || box.boxName || `盒子 #${box.boxId}`

          // 判断是否有折扣信息
          const hasDiscount = (box.firstChargeDomestic != null && box.firstChargeDomestic > 0) ||
            (box.rechargeDomestic != null && box.rechargeDomestic > 0)

          // CPS 信息
          // const cpsInfo = platform?.cps_cpa_info || platform?.cps_text ||
          //   (platform?.cps_ratio && Number(platform.cps_ratio) > 0 ? `CPS ${platform.cps_ratio}%` : null)

          // 福利内容
          const welfare = platform?.box_welfare_content

          return (
            <Card
              key={box.id}
              className="bg-slate-900/60 border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-4">
                {/* 盒子头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <Link
                      href={localePath(`/boxes/${box.boxId}`)}
                      className="text-base font-semibold text-white hover:text-amber-400 transition-colors"
                    >
                      {displayName}
                    </Link>
                    {box.isExclusive === '1' && (
                      <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/25 text-[10px]">
                        <Sparkles className="h-3 w-3 mr-0.5" /> 独占
                      </Badge>
                    )}
                    {box.isNew === '1' && (
                      <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-[10px]">
                        新游
                      </Badge>
                    )}
                    {box.isFeatured === '1' && (
                      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/25 text-[10px]">
                        推荐
                      </Badge>
                    )}
                  </div>
                  {box.discountLabel && (
                    <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/25 text-xs flex-shrink-0">
                      {box.discountLabel}
                    </Badge>
                  )}
                </div>

                {/* 自定义描述 */}
                {box.customDescription && (
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{box.customDescription}</p>
                )}

                {/* 推广语 */}
                {box.promoteText && (
                  <p className="text-amber-300/80 text-sm italic mb-3">&ldquo;{box.promoteText}&rdquo;</p>
                )}

                {/* 折扣 + 平台信息 */}
                {(hasDiscount ||
                  // cpsInfo ||
                  platform?.is_h5 === '1' || platform?.is_cloud_game === '1') && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {box.firstChargeDomestic != null && box.firstChargeDomestic > 0 && (
                        <div className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          首充 {box.firstChargeDomestic}折
                        </div>
                      )}
                      {box.rechargeDomestic != null && box.rechargeDomestic > 0 && (
                        <div className="text-[11px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
                          续充 {box.rechargeDomestic}折
                        </div>
                      )}
                      {box.hasSupport === '1' && (
                        <div className="text-[11px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20">
                          有扶持{box.supportDesc ? ` · ${box.supportDesc}` : ''}
                        </div>
                      )}
                      {platform?.is_h5 === '1' && (
                        <div className="text-[11px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                          <Globe className="h-3 w-3 inline mr-0.5" />H5
                        </div>
                      )}
                      {platform?.is_cloud_game === '1' && (
                        <div className="text-[11px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                          ☁️ 云游戏
                        </div>
                      )}
                      {/* {cpsInfo && (
                      <div className="text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        {cpsInfo}
                      </div>
                    )} */}
                    </div>
                  )}

                {/* 版本/类型标签 */}
                {(platform?.version_raw || platform?.genre_raw) && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {platform?.version_raw && (
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">
                        {platform.version_raw}
                      </Badge>
                    )}
                    {platform?.genre_raw && platform.genre_raw.split(/[.,，、]/).filter(Boolean).map((g, i) => (
                      <Badge key={i} variant="outline" className="border-slate-600 text-slate-500 text-[10px]">
                        {g.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 福利内容 */}
                {welfare && (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-1">
                      <Gift className="h-3.5 w-3.5" /> 盒子福利
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line line-clamp-4">
                      {welfare}
                    </p>
                  </div>
                )}

                {/* 操作按钮区 */}
                {(mainDownloadUrl || links.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/50">
                    {/* 主下载按钮 */}
                    {mainDownloadUrl && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-xs h-7"
                        asChild
                      >
                        <a href={mainDownloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-1" /> 下载游戏
                        </a>
                      </Button>
                    )}

                    {/* 推广链接（排除已作为主下载的链接） */}
                    {links
                      .filter(l => l.url !== mainDownloadUrl && l.label !== '下载')
                      .slice(0, 4) // 最多显示 4 个额外链接
                      .map((link, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:text-white text-xs h-7"
                          asChild
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" /> {link.label}
                          </a>
                        </Button>
                      ))}

                    {/* 推广页 */}
                    {box.promoteUrl && isValidUrl(box.promoteUrl) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:text-white text-xs h-7"
                        asChild
                      >
                        <a href={box.promoteUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" /> 推广页
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
