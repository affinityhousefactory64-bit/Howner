import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    const supabase = getSupabase()

    // Upsert — don't fail if already exists
    await supabase.from('waitlist_invest').upsert({ email }, { onConflict: 'email' })

    // Count total waitlist
    const { count } = await supabase.from('waitlist_invest').select('*', { count: 'exact', head: true })

    return NextResponse.json({ success: true, count: count || 0 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = getSupabase()
  const { count } = await supabase.from('waitlist_invest').select('*', { count: 'exact', head: true })
  return NextResponse.json({ count: count || 0 })
}
