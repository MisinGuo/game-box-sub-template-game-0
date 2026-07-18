import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * 盒子下载计数中转
 * POST /api/track/box-download
 * body: { boxId: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.boxId) {
      return new NextResponse(null, { status: 204 })
    }

    await fetch(`${BACKEND_URL}/api/public/boxes/${body.boxId}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
