import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { id } = await params

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('id, status, created_at, listing_id, user_id, listings(title, location, price, user_id), users(name, phone, email, type, pro_category)')
      .eq('id', id)
      .single()

    if (error || !reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Must be reservation owner or listing owner
    const listing = reservation.listings as unknown as { user_id: string }
    if (reservation.user_id !== session.userId && listing?.user_id !== session.userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Reservation get error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

const VALID_STATUSES = ['contacted', 'completed', 'cancelled']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await req.json()

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide. Valeurs acceptées : contacted, completed, cancelled' },
        { status: 400 }
      )
    }

    // Fetch reservation with listing info for ownership check
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, user_id, listing_id, listings(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Must be reservation owner or listing owner
    const listing = reservation.listings as unknown as { user_id: string }
    if (reservation.user_id !== session.userId && listing?.user_id !== session.userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Update status
    const { data: updated, error: updateError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select('id, status, created_at, listing_id, user_id')
      .single()

    if (updateError) {
      console.error('Reservation update error:', updateError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true, reservation: updated })
  } catch (error) {
    console.error('Reservation patch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
