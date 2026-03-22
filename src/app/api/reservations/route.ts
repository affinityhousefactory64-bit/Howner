import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { listingId } = await req.json()

    if (!listingId) {
      return NextResponse.json({ error: 'ID annonce requis' }, { status: 400 })
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('credits, tickets')
      .eq('id', session.userId)
      .single()

    if (!user || user.credits < 1) {
      return NextResponse.json({ error: 'Pas assez de crédits' }, { status: 402 })
    }

    // Check listing exists and user is NOT the owner
    const { data: listing } = await supabase
      .from('listings')
      .select('id, user_id, max_reservations')
      .eq('id', listingId)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    if (listing.user_id === session.userId) {
      return NextResponse.json({ error: 'Impossible de réserver votre propre annonce' }, { status: 400 })
    }

    // Check no existing reservation by this user on this listing
    const { data: existing } = await supabase
      .from('reservations')
      .select('id')
      .eq('user_id', session.userId)
      .eq('listing_id', listingId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà réservé cette annonce' }, { status: 409 })
    }

    // Check total active reservations < max_reservations
    const maxReservations = listing.max_reservations ?? 5
    const { count } = await supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('listing_id', listingId)
      .eq('status', 'active')

    if ((count ?? 0) >= maxReservations) {
      return NextResponse.json({ error: 'Plus de places disponibles' }, { status: 409 })
    }

    // Insert reservation
    await supabase.from('reservations').insert({
      user_id: session.userId,
      listing_id: listingId,
      status: 'active',
    })

    // Deduct 1 credit, add 1 ticket
    await supabase
      .from('users')
      .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
      .eq('id', session.userId)

    // Log credit usage
    await supabase.from('credit_usage').insert({
      user_id: session.userId,
      action: 'reservation',
      listing_id: listingId,
    })

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'reservation',
      details: { listing_id: listingId },
    })

    // Auto-create conversation between reserver and listing owner
    const userA = session.userId < listing.user_id ? session.userId : listing.user_id
    const userB = session.userId < listing.user_id ? listing.user_id : session.userId
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_a', userA)
      .eq('user_b', userB)
      .eq('listing_id', listingId)
      .single()

    if (!existingConv) {
      await supabase.from('conversations').insert({
        user_a: userA,
        user_b: userB,
        listing_id: listingId,
        source: 'reservation',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Réservation confirmée ! +1 ticket offert',
    })
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
