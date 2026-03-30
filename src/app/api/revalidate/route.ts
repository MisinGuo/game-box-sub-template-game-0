import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 按需缓存失效接口
 *
 * 用法：
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>&tags=home,games
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>&path=/
 *
 * 可用 tags：home | games | articles | categories | gifts | boxes | site-config
 * 也支持精确 tag，如 game-123 | article-456 | category-789
 */

const ALL_TAGS = ['home', 'games', 'articles', 'categories', 'gifts', 'boxes', 'site-config']

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const revalidateSecret = process.env.REVALIDATE_SECRET

  if (!revalidateSecret) {
    return NextResponse.json({ error: '服务端未配置 REVALIDATE_SECRET' }, { status: 500 })
  }

  if (secret !== revalidateSecret) {
    return NextResponse.json({ error: '密钥无效' }, { status: 401 })
  }

  const tagsParam = request.nextUrl.searchParams.get('tags')
  const pathParam = request.nextUrl.searchParams.get('path')

  const revalidatedTags: string[] = []
  const revalidatedPaths: string[] = []

  // 按 path 失效
  if (pathParam) {
    const paths = pathParam.split(',').map((p) => p.trim()).filter(Boolean)
    for (const p of paths) {
      revalidatePath(p)
      revalidatedPaths.push(p)
    }
  }

  // 按 tag 失效
  const tags = tagsParam
    ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
    : ALL_TAGS // 不传 tags 则清除全部

  for (const tag of tags) {
    revalidateTag(tag)
    revalidatedTags.push(tag)
  }

  return NextResponse.json({
    revalidated: true,
    tags: revalidatedTags,
    paths: revalidatedPaths,
    timestamp: new Date().toISOString(),
  })
}

// 拒绝 GET 请求，防止爬虫误触发
export async function GET() {
  return NextResponse.json({ error: '请使用 POST 方法' }, { status: 405 })
}
