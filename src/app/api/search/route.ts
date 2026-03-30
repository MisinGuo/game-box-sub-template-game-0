import { NextRequest, NextResponse } from 'next/server'
import ApiClient from '@/lib/api'

export async function GET(request: NextRequest) {
  const keyword = (request.nextUrl.searchParams.get('keyword') || '').trim()
  const locale = request.nextUrl.searchParams.get('locale') || 'zh-CN'
  const pageNum = Number(request.nextUrl.searchParams.get('pageNum') || '1')
  const pageSize = Number(request.nextUrl.searchParams.get('pageSize') || '10')

  if (!keyword) {
    return NextResponse.json({
      code: 200,
      msg: 'ok',
      data: {
        articles: [],
        games: [],
        articlesTotal: 0,
        gamesTotal: 0,
      },
    })
  }

  try {
    const [articlesRes, gamesRes] = await Promise.all([
      ApiClient.searchArticles(keyword, { pageNum, pageSize, locale }),
      ApiClient.searchGames(keyword, { pageNum, pageSize, locale }),
    ])

    return NextResponse.json({
      code: 200,
      msg: 'ok',
      data: {
        articles: articlesRes.rows || [],
        games: gamesRes.rows || [],
        articlesTotal: articlesRes.total || 0,
        gamesTotal: gamesRes.total || 0,
      },
    })
  } catch (error) {
    console.error('搜索代理接口失败:', error)
    return NextResponse.json(
      {
        code: 500,
        msg: 'search proxy failed',
        data: {
          articles: [],
          games: [],
          articlesTotal: 0,
          gamesTotal: 0,
        },
      },
      { status: 500 }
    )
  }
}
