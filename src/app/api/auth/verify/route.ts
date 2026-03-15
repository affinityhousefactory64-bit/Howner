import { NextResponse } from 'next/server'

export async function POST() {
  // TODO: Verify SMS code
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 })
}
