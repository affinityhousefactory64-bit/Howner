import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  // Check admin
  const { data: adminUser } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.userId)
    .single()

  if (!adminUser?.is_admin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    // Total users
    const { count: total_users } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: total_users_particulier } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'particulier')

    const { count: total_users_pro } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'pro')

    // Total listings (active)
    const { count: total_listings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })

    const { count: total_listings_immo } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'immo')

    const { count: total_listings_service } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'service')

    const { count: total_listings_demande } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'demande')

    // Matches
    const { count: total_matches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })

    // Reservations
    const { count: total_reservations } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })

    // Credit purchases aggregates
    const { data: purchaseAgg } = await supabase
      .from('credit_purchases')
      .select('credits, amount_cents')

    let total_credits_sold = 0
    let total_revenue_cents = 0
    if (purchaseAgg) {
      for (const p of purchaseAgg) {
        total_credits_sold += p.credits || 0
        total_revenue_cents += p.amount_cents || 0
      }
    }

    // Total tickets distributed (sum of tickets across all users)
    const { data: ticketAgg } = await supabase
      .from('users')
      .select('tickets')

    let total_tickets = 0
    if (ticketAgg) {
      for (const u of ticketAgg) {
        total_tickets += u.tickets || 0
      }
    }

    // Recent signups
    const { data: recent_signups } = await supabase
      .from('users')
      .select('id, name, type, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Recent purchases
    const { data: recent_purchases } = await supabase
      .from('credit_purchases')
      .select('id, user_id, pack_type, credits, tickets, amount_cents, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Enrich purchases with user names
    let enriched_purchases = recent_purchases || []
    if (recent_purchases && recent_purchases.length > 0) {
      const userIds = [...new Set(recent_purchases.map(p => p.user_id))]
      const { data: purchaseUsers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', userIds)

      const nameMap: Record<string, string> = {}
      if (purchaseUsers) {
        for (const u of purchaseUsers) {
          nameMap[u.id] = u.name || 'Sans nom'
        }
      }

      enriched_purchases = recent_purchases.map(p => ({
        ...p,
        user_name: nameMap[p.user_id] || 'Inconnu',
      }))
    }

    return NextResponse.json({
      total_users: total_users || 0,
      total_users_particulier: total_users_particulier || 0,
      total_users_pro: total_users_pro || 0,
      total_listings: total_listings || 0,
      total_listings_immo: total_listings_immo || 0,
      total_listings_service: total_listings_service || 0,
      total_listings_demande: total_listings_demande || 0,
      total_matches: total_matches || 0,
      total_reservations: total_reservations || 0,
      total_credits_sold,
      total_revenue_cents,
      total_tickets,
      recent_signups: recent_signups || [],
      recent_purchases: enriched_purchases,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
