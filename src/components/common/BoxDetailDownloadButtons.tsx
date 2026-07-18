'use client'

import { Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOutboundUrl } from '@/lib/outbound-url'
import { usePathname } from 'next/navigation'
import { trackOutboundClick, resolvePageMeta } from '@/lib/tracker'

interface BoxDetailDownloadButtonsProps {
  boxId?: number
  androidUrl?: string
  iosUrl?: string
  downloadUrl?: string
  androidText: string
  iosText: string
  sourceText: string
  noDownloadText: string
  locale?: string
}

export function BoxDetailDownloadButtons({
  boxId, androidUrl, iosUrl, downloadUrl,
  androidText, iosText, sourceText, noDownloadText,
  locale,
}: BoxDetailDownloadButtonsProps) {
  const pathname = usePathname()
  const pageMeta = resolvePageMeta(pathname)

  const handleClick = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    trackOutboundClick(url, {
      pageType: pageMeta.pageType,
      contentSlug: pageMeta.contentSlug,
      locale,
      pagePath: pathname,
    })
    // 记录盒子下载（异步，不阻塞跳转）
    if (boxId) {
      trackBoxDownload(boxId)
    }
    window.open(getOutboundUrl(url), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {androidUrl ? (
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8" onClick={handleClick(androidUrl)}>
          <Download className="mr-2 h-5 w-5" />
          {androidText}
        </Button>
      ) : (
        <Button size="lg" className="h-12 px-8 bg-slate-700 text-slate-400 cursor-not-allowed" disabled>
          <Download className="mr-2 h-5 w-5" />{noDownloadText}
        </Button>
      )}
      {iosUrl && (
        <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8" onClick={handleClick(iosUrl)}>
          <Download className="mr-2 h-5 w-5" />
          {iosText}
        </Button>
      )}
      {downloadUrl && (
        <Button size="lg" variant="outline" className="h-12 px-8 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500" onClick={handleClick(downloadUrl)}>
          <ExternalLink className="mr-2 h-5 w-5" />
          {sourceText}
        </Button>
      )}
    </div>
  )
}

/** 上报盒子下载到后端（fire-and-forget，经 Next.js API 层中转） */
function trackBoxDownload(boxId: number): void {
  try {
    const blob = new Blob([JSON.stringify({ boxId })], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track/box-download', blob)
    } else {
      fetch('/api/track/box-download', { method: 'POST', body: blob, keepalive: true }).catch(() => {})
    }
  } catch {
    // 静默失败
  }
}
