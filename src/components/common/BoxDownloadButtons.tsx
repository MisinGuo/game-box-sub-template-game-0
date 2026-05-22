'use client'

import { Download } from 'lucide-react'
import { getOutboundUrl } from '@/lib/outbound-url'

interface BoxDownloadButtonsProps {
  androidUrl?: string
  iosUrl?: string
  viewDetailText: string
}

export function BoxDownloadButtons({ androidUrl, iosUrl, viewDetailText }: BoxDownloadButtonsProps) {
  const handleClick = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
