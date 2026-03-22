import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // Find all listings owned by this user
    const { data: myListings, error: listingsError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', session.userId)

    if (listingsError) {
      console.error('Listings query error:', listingsError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    if (!myListings || myListings.length === 0) {
      return NextResponse.json({ reservations: [] })
    }

    const listingIds = myListings.map((l) => l.id)

    // Find all reservations on those listings with reserver + listing info
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('id, status, created_at, listing_id, user_id, listings(title, location, price), users(name, phone, email, type, pro_category)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Received reservations query error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ reservations: reservations ?? [] })
  } catch (error) {
    console.error('Reservations received error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
