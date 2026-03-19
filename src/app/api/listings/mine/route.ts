import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ listings: listings || [] })
  } catch (error) {
    console.error('My listings error:', error)
    return NextResponse.json({ listings: [] })
  }
}
