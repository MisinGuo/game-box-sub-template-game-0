'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function NavigationTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (window.parent !== window) {
      const search = searchParams.toString()
      const fullPath = pathname + (search ? `?${search}` : '')
      window.parent.postMessage(
        { type: 'PREVIEW_NAVIGATION', path: fullPath, href: window.location.href },
        '*'
      )
    }
  }, [pathname, searchParams])

  return null
}
