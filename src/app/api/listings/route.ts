import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Return listings (mock + native)
  return NextResponse.json({ listings: [] })
}
