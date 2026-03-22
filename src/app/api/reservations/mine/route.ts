import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('id, status, created_at, listing_id, listings(title, location, price, subcategory)')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Reservations query error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ reservations: reservations ?? [] })
  } catch (error) {
    console.error('Reservations mine error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
