import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type')

    let query = supabase
      .from('users')
      .select('id, name, type, pro_category, pro_specialty, pro_zone, pro_photo, pro_rating, pro_transactions, review_count, created_at')
      .order('pro_rating', { ascending: false, nullsFirst: false })
      .limit(50)

    if (type) {
      query = query.eq('type', type)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Users list error:', error)
      return NextResponse.json({ error: 'Erreur chargement' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
