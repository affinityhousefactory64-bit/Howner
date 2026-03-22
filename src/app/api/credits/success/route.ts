import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(new URL('/credits', req.url))
  }

  const url = new URL('/compte', req.url)
  url.searchParams.set('payment', 'success')

  return NextResponse.redirect(url)
}
