import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const listingId = req.nextUrl.searchParams.get('listingId')

    if (!listingId) {
      return NextResponse.json({ error: 'ID annonce requis' }, { status: 400 })
    }

    const { count, error } = await supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('listing_id', listingId)
      .eq('status', 'active')

    if (error) {
      console.error('Reservation count error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('Reservation count error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
