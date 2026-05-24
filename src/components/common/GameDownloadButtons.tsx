'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOutboundUrl } from '@/lib/outbound-url'
import { usePathname } from 'next/navigation'
import { trackOutboundClick, resolvePageMeta } from '@/lib/tracker'

interface GameDownloadButtonsProps {
  downloadUrl?: string | null
  androidUrl?: string | null
  iosUrl?: string | null
  downloadNowText: string
  androidText: string
  iosText: string
  noDownloadText: string
  locale?: string
}

export function GameDownloadButtons({
  downloadUrl, androidUrl, iosUrl,
  downloadNowText, androidText, iosText, noDownloadText,
  locale,
}: GameDownloadButtonsProps) {
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
    window.open(getOutboundUrl(url), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
      {(downloadUrl || androidUrl) ? (
        <Button
          size="default"
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 font-bold shadow-lg shadow-blue-500/30 sm:px-8"
          onClick={handleClick(downloadUrl || androidUrl || '#')}
        >
          <Download className="h-4 w-4 mr-2" />
          {downloadUrl ? downloadNowText : androidText}
        </Button>
      ) : (
        <Button size="default" className="w-full sm:w-auto sm:px-8 bg-slate-700 text-slate-400 cursor-not-allowed" disabled>
          <Download className="h-4 w-4 mr-2" />{noDownloadText}
        </Button>
      )}
      {iosUrl && (
        <Button
          size="default"
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 font-bold shadow-lg shadow-green-500/30 sm:px-8"
          onClick={handleClick(iosUrl)}
        >
          <Download className="h-4 w-4 mr-2" />{iosText}
        </Button>
      )}
    </div>
  )
}
