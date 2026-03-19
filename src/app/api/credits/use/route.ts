import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { action, listingId } = await req.json()

    if (!action || !['boost', 'alert'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    if (!listingId) {
      return NextResponse.json({ error: 'ID annonce requis' }, { status: 400 })
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('credits, tickets')
      .eq('id', session.userId)
      .single()

    if (!user || user.credits < 1) {
      return NextResponse.json({ error: 'Pas assez de crédits' }, { status: 402 })
    }

    // Verify listing belongs to user
    const { data: listing } = await supabase
      .from('listings')
      .select('id, user_id, is_boosted, alert_active')
      .eq('id', listingId)
      .eq('user_id', session.userId)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    // Apply action
    const now = new Date()

    if (action === 'boost') {
      if (listing.is_boosted) {
        return NextResponse.json({ error: 'Annonce déjà boostée' }, { status: 400 })
      }
      const boostEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +24h
      await supabase
        .from('listings')
        .update({ is_boosted: true, boost_expires_at: boostEnd.toISOString() })
        .eq('id', listingId)
    }

    if (action === 'alert') {
      if (listing.alert_active) {
        return NextResponse.json({ error: 'Alerte déjà active' }, { status: 400 })
      }
      const alertEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours
      await supabase
        .from('listings')
        .update({ alert_active: true, alert_expires_at: alertEnd.toISOString() })
        .eq('id', listingId)
    }

    // Deduct credit, add ticket
    await supabase
      .from('users')
      .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
      .eq('id', session.userId)

    // Log usage
    await supabase.from('credit_usage').insert({
      user_id: session.userId,
      action,
      listing_id: listingId,
    })

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action,
      details: { listing_id: listingId },
    })

    return NextResponse.json({
      success: true,
      message: action === 'boost'
        ? 'Annonce boostée 24h ! 🎟️ +1 ticket'
        : 'Alerte activée 30 jours ! 🎟️ +1 ticket',
    })
  } catch (error) {
    console.error('Credit use error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
