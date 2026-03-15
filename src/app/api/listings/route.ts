import { NextRequest, NextResponse } from 'next/server'
import { MOCK_LISTINGS } from '@/lib/mock-listings'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const source = searchParams.get('source')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const minSurface = searchParams.get('minSurface')
  const rooms = searchParams.get('rooms')
  const location = searchParams.get('location')

  let listings = [...MOCK_LISTINGS]

  if (type) {
    listings = listings.filter((l) => l.type === type)
  }
  if (source === 'howner') {
    listings = listings.filter((l) => l.is_native)
  }
  if (minPrice) {
    listings = listings.filter((l) => l.price >= parseInt(minPrice))
  }
  if (maxPrice) {
    listings = listings.filter((l) => l.price <= parseInt(maxPrice))
  }
  if (minSurface) {
    listings = listings.filter((l) => l.surface >= parseInt(minSurface))
  }
  if (rooms) {
    listings = listings.filter((l) => l.rooms >= parseInt(rooms))
  }
  if (location) {
    listings = listings.filter((l) =>
      l.location.toLowerCase().includes(location.toLowerCase())
    )
  }

  return NextResponse.json({ listings, total: listings.length })
}
