'use client'

import { Download } from 'lucide-react'

interface BoxDownloadButtonsProps {
  androidUrl?: string
  iosUrl?: string
  viewDetailText: string
}

export function BoxDownloadButtons({ androidUrl, iosUrl, viewDetailText }: BoxDownloadButtonsProps) {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {androidUrl && (
        <a
          href={androidUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center justify-center h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 font-semibold rounded-md text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5 mr-1" />Android
        </a>
      )}
      {iosUrl && (
        <a
          href={iosUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center justify-center h-8 px-3 text-xs bg-green-600 hover:bg-green-700 font-semibold rounded-md text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5 mr-1" />iOS
        </a>
      )}
      {!androidUrl && !iosUrl && (
        <span className="inline-flex items-center justify-center h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 font-semibold rounded-md text-white transition-all">
          {viewDetailText}
        </span>
      )}
    </div>
  )
}
