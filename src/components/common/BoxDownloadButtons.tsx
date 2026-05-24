'use client'

import { Download } from 'lucide-react'
import { getOutboundUrl } from '@/lib/outbound-url'
import { usePathname } from 'next/navigation'
import { trackOutboundClick, resolvePageMeta } from '@/lib/tracker'

interface BoxDownloadButtonsProps {
  androidUrl?: string
  iosUrl?: string
  viewDetailText: string
  locale?: string
}

export function BoxDownloadButtons({ androidUrl, iosUrl, viewDetailText, locale }: BoxDownloadButtonsProps) {
  const pathname = usePathname()
  const pageMeta = resolvePageMeta(pathname)

  const handleClick = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackOutboundClick(url, {
      pageType: pageMeta.pageType,
      contentSlug: pageMeta.contentSlug,
      locale,
      pagePath: pathname,
    })
    window.open(getOutboundUrl(url), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-2">
      {androidUrl && (
        <button
          type="button"
          onClick={handleClick(androidUrl)}
          className="inline-flex items-center justify-center h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 font-semibold rounded-md text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5 mr-1" />Android
        </button>
      )}
      {iosUrl && (
        <button
          type="button"
          onClick={handleClick(iosUrl)}
          className="inline-flex items-center justify-center h-8 px-3 text-xs bg-green-600 hover:bg-green-700 font-semibold rounded-md text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5 mr-1" />iOS
        </button>
      )}
      {!androidUrl && !iosUrl && (
        <span className="inline-flex items-center justify-center h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 font-semibold rounded-md text-white transition-all">
          {viewDetailText}
        </span>
      )}
    </div>
  )
}
