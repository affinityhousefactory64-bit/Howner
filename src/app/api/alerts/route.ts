import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET — list user's active alerts
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non connecte' }, { status: 401 })
  }

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', session.userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Alerts fetch error:', error)
    return NextResponse.json({ alerts: [] })
  }

  return NextResponse.json({ alerts: alerts || [] })
}

// POST — create alert (first is free, then costs 1 credit)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecte' }, { status: 401 })
    }

    const body = await req.json()
    const { category, subcategory, location, price_min, price_max, surface_min, property_type } = body

    // Check how many alerts user has created
    const { count } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.userId)

    const isFirstAlert = (count ?? 0) === 0

    if (!isFirstAlert) {
      // Check credits
      const { data: user } = await supabase
        .from('users')
        .select('credits, tickets')
        .eq('id', session.userId)
        .single()

      if (!user || user.credits < 1) {
        return NextResponse.json({ error: 'Pas assez de credits. Achetez un pack !' }, { status: 402 })
      }

      // Deduct credit, add ticket
      await supabase
        .from('users')
        .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
        .eq('id', session.userId)

      // Log credit usage
      await supabase.from('credit_usage').insert({
        user_id: session.userId,
        action: 'alert',
      })
    }

    // Set expiry to 30 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        user_id: session.userId,
        category: category || null,
        subcategory: subcategory || null,
        location: location || null,
        price_min: price_min || null,
        price_max: price_max || null,
        surface_min: surface_min || null,
        property_type: property_type || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Alert creation error:', error)
      return NextResponse.json({ error: 'Erreur création alerte' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'alert_created',
      details: { category, location, free: isFirstAlert },
    })

    return NextResponse.json({
      alert,
      free: isFirstAlert,
      message: isFirstAlert ? 'Alerte gratuite creee !' : 'Alerte creee ! +1 ticket offert',
    })
  } catch (error) {
    console.error('Post alert error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE — deactivate alert
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecte' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      return NextResponse.json({ error: 'ID alerte manquant' }, { status: 400 })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('alerts')
      .select('user_id')
      .eq('id', alertId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Alerte introuvable' }, { status: 404 })
    }

    if (existing.user_id !== session.userId) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

    const { error } = await supabase
      .from('alerts')
      .update({ is_active: false })
      .eq('id', alertId)

    if (error) {
      console.error('Alert deactivation error:', error)
      return NextResponse.json({ error: 'Erreur desactivation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
