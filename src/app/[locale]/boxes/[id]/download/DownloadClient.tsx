'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { executeDownload, hasCustomHandler, getDownloadHandler } from '@/lib/box-download-handlers'

interface DownloadClientProps {
  boxData: any
  locale: string
}

export default function DownloadClient({ boxData, locale }: DownloadClientProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasCustom = hasCustomHandler(boxData.name)
  const handler = getDownloadHandler(boxData.name)

  const t = {
    back: locale === 'zh-TW' ? '返回' : locale === 'en-US' ? 'Back' : '返回',
    downloadTitle: locale === 'zh-TW' ? `下載 ${boxData.name}` : locale === 'en-US' ? `Download ${boxData.name}` : `下载 ${boxData.name}`,
    noDesc: locale === 'zh-TW' ? '暫無描述' : locale === 'en-US' ? 'No description available' : '暂无描述',
    errorMsg: locale === 'zh-TW' ? '下載失敗，請稍後重試' : locale === 'en-US' ? 'Download failed, please try again later' : '下载失败，请稍后重试',
    preparing: locale === 'zh-TW' ? '準備下載中...' : locale === 'en-US' ? 'Preparing download...' : '准备下载中...',
    downloadNow: locale === 'zh-TW' ? '立即下載' : locale === 'en-US' ? 'Download Now' : '立即下载',
    openInNewWindow: locale === 'zh-TW' ? '在新視窗開啟下載連結' : locale === 'en-US' ? 'Open download link in new window' : '在新窗口打开下载链接',
    instructions: locale === 'zh-TW' ? '下載說明：' : locale === 'en-US' ? 'Download Instructions:' : '下载说明：',
    tip1: locale === 'zh-TW' ? '下載將在 3 秒後自動開始' : locale === 'en-US' ? 'Download will start automatically in 3 seconds' : '下载将在 3 秒后自动开始',
    tip2: locale === 'zh-TW' ? '如果下載未開始，請點擊上方按鈕手動下載' : locale === 'en-US' ? 'If download does not start, click the button above to download manually' : '如果下载未开始，请点击上方按钮手动下载',
    tip3: locale === 'zh-TW' ? '部分瀏覽器可能會攔截自動下載，請允許下載' : locale === 'en-US' ? 'Some browsers may block auto-downloads, please allow it' : '部分浏览器可能会拦截自动下载，请允许下载',
    tip4: locale === 'zh-TW' ? '如遇問題，可嘗試使用新視窗開啟下載連結' : locale === 'en-US' ? 'If you have issues, try opening the link in a new window' : '如遇问题，可尝试使用新窗口打开下载链接',
  }

  useEffect(() => {
    // 3秒后自动开始下载
    const timer = setTimeout(() => {
      handleDownload()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = async () => {
    setIsDownloading(true)
    setError(null)

    try {
      await executeDownload(boxData.name, boxData)
    } catch (err) {
      setError(t.errorMsg)
      console.error('下载错误:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Button>
            </div>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <Download className="h-8 w-8 text-blue-500" />
              {t.downloadTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 盒子信息 */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">{boxData.name}</h3>
              <p className="text-slate-400 text-sm">{boxData.description || t.noDesc}</p>
            </div>

            {/* 下载处理器信息 */}
            {hasCustom && handler.description && (
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-blue-300">
                  {handler.description}
                </AlertDescription>
              </Alert>
            )}

            {/* 错误信息 */}
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* 下载按钮 */}
            <div className="flex flex-col gap-4">
              {isDownloading ? (
                <Button size="lg" disabled className="w-full h-14">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.preparing}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {t.downloadNow}
                  </Button>

                  {boxData.downloadUrl && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 border-slate-700 text-slate-300 hover:bg-slate-800"
                      asChild
                    >
                      <a href={boxData.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-5 w-5" />
                        {t.openInNewWindow}
                      </a>
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* 下载说明 */}
            <div className="text-sm text-slate-500 space-y-2">
              <p>{t.instructions}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t.tip1}</li>
                <li>{t.tip2}</li>
                <li>{t.tip3}</li>
                <li>{t.tip4}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
