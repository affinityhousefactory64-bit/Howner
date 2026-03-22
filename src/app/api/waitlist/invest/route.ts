import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()

    // Insert into waitlist_invest (unique constraint handles duplicates)
    const { error } = await supabase
      .from('waitlist_invest')
      .insert({ email: normalized })

    if (error) {
      if (error.code === '23505') {
        // Already registered — return current position
        const { count } = await supabase
          .from('waitlist_invest')
          .select('*', { count: 'exact', head: true })

        return NextResponse.json({ success: true, already: true, position: count ?? 0 })
      }
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Get current count as position
    const { count } = await supabase
      .from('waitlist_invest')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ success: true, position: count ?? 1 })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('waitlist_invest')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Waitlist count error:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
