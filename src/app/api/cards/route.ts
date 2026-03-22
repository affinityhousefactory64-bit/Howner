import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = getSupabase()
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', session.userId)
    .order('card_number', { ascending: true })

  return NextResponse.json({ cards: cards || [] })
}
