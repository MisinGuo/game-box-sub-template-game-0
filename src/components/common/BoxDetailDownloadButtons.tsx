'use client'

import { Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOutboundUrl } from '@/lib/outbound-url'

interface BoxDetailDownloadButtonsProps {
  androidUrl?: string
  iosUrl?: string
  downloadUrl?: string
  androidText: string
  iosText: string
  sourceText: string
  noDownloadText: string
}

export function BoxDetailDownloadButtons({
  androidUrl, iosUrl, downloadUrl,
  androidText, iosText, sourceText, noDownloadText,
}: BoxDetailDownloadButtonsProps) {
  const handleClick = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault()
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
