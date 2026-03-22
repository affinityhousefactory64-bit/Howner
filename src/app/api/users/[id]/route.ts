import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, type, pro_category, pro_specialty, pro_zone, pro_photo, pro_rating, pro_transactions, review_count, created_at')
      .eq('id', id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
