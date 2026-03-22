import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ usages: [] })
  }

  const { data: usages } = await supabase
    .from('credit_usage')
    .select('*, listings:listing_id(title)')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(30)

  // Flatten the listing title
  const formatted = (usages || []).map((u: Record<string, unknown>) => ({
    ...u,
    listing_title: (u.listings as { title?: string } | null)?.title || null,
    listings: undefined,
  }))

  return NextResponse.json({ usages: formatted })
}
