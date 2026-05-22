import { NextRequest, NextResponse } from 'next/server'

/**
 * 下载中间跳转 API
 *
 * GET /api/download?url=base64(realUrl)
 *
 * 将 Base64 编码的真实下载地址解码后 302 重定向，
 * 使前端页面不直接暴露外链，避免广告审核"被侵网站"拒登。
 */
export async function GET(req: NextRequest) {
  const encoded = req.nextUrl.searchParams.get('url')

  if (!encoded) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    const raw = decodeURIComponent(encoded)
    const decoded = Buffer.from(raw, 'base64').toString('utf-8')

    // 仅允许 http/https 协议，防止 javascript: 等协议注入
    if (!/^https?:\/\//i.test(decoded)) {
      return NextResponse.json({ error: 'Invalid URL scheme' }, { status: 400 })
    }

    return NextResponse.redirect(decoded, 302)
  } catch {
    return NextResponse.json({ error: 'Invalid base64 encoding' }, { status: 400 })
  }
}
