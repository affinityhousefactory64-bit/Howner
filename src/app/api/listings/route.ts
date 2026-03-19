import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const location = searchParams.get('location')
  const boosted = searchParams.get('boosted')

  let query = supabase
    .from('listings')
    .select('*')
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (category) query = query.eq('category', category)
  if (subcategory) query = query.eq('subcategory', subcategory)
  if (location) query = query.ilike('location', `%${location}%`)
  if (boosted === 'true') query = query.eq('is_boosted', true)

  const { data: listings, error } = await query

  if (error) {
    console.error('Listings error:', error)
    return NextResponse.json({ listings: [], total: 0 })
  }

  return NextResponse.json({ listings: listings || [], total: listings?.length || 0 })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const body = await req.json()
    const { category, subcategory, title, description, location, price, surface, rooms } = body

    if (!category || !subcategory || !title || !location) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('credits, tickets, free_listing_used')
      .eq('id', session.userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    let usedCredit = false

    // First listing is free, subsequent ones cost 1 credit
    if (user.free_listing_used) {
      if (user.credits < 1) {
        return NextResponse.json({ error: 'Pas assez de crédits. Achète un pack !' }, { status: 402 })
      }
      // Deduct credit, add ticket
      await supabase
        .from('users')
        .update({ credits: user.credits - 1, tickets: user.tickets + 1 })
        .eq('id', session.userId)
      usedCredit = true
    } else {
      // Mark free listing as used
      await supabase
        .from('users')
        .update({ free_listing_used: true })
        .eq('id', session.userId)
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        user_id: session.userId,
        category,
        subcategory,
        title,
        description: description || '',
        location,
        price: price || null,
        surface: surface || null,
        rooms: rooms || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Listing creation error:', error)
      return NextResponse.json({ error: 'Erreur création annonce' }, { status: 500 })
    }

    // Log credit usage if paid
    if (usedCredit) {
      await supabase.from('credit_usage').insert({
        user_id: session.userId,
        action: 'listing',
        listing_id: listing.id,
      })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'listing_created',
      details: { title, category, free: !usedCredit },
    })

    return NextResponse.json({
      listing,
      usedCredit,
      message: usedCredit
        ? 'Annonce publiée ! 🎟️ +1 ticket gagné'
        : 'Annonce gratuite publiée ! 🎉',
    })
  } catch (error) {
    console.error('Post listing error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
