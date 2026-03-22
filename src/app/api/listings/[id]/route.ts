import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET — Public: get a single listing by ID, increment view_count
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Fetch listing
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !listing) {
    return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
  }

  // Increment view_count (fire and forget)
  supabase
    .from('listings')
    .update({ view_count: (listing.view_count || 0) + 1 })
    .eq('id', id)
    .then()

  return NextResponse.json({ listing })
}

// PATCH — Auth required: update a listing (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    if (existing.user_id !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()

    // Only allow updatable fields
    const allowedFields = [
      'title', 'description', 'location', 'price', 'surface', 'rooms',
      'external_link', 'property_type', 'bedrooms', 'floor', 'dpe',
      'pro_tariff', 'pro_availability', 'urgency', 'photos',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Listing update error:', error)
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Patch listing error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE — Auth required: soft-delete a listing (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    if (existing.user_id !== session.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Soft delete
    const { error } = await supabase
      .from('listings')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Listing delete error:', error)
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'listing_deleted',
      details: { listing_id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
