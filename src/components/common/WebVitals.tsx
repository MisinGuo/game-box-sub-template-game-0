'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 发送到 console（开发环境调试）
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }

    // 发送到自定义端点（如果配置了）
    const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT
    if (analyticsEndpoint) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      })

      if (navigator.sendBeacon) {
        navigator.sendBeacon(analyticsEndpoint, body)
      } else {
        fetch(analyticsEndpoint, {
          body,
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  })

  return null
}
