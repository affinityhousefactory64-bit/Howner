import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ purchases: [] })
  }

  const { data: purchases } = await supabase
    .from('credit_purchases')
    .select('*')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ purchases: purchases || [] })
}
