import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviewer_id(name)')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Reviews fetch error:', error)
      return NextResponse.json({ error: 'Erreur chargement avis' }, { status: 500 })
    }

    // Flatten reviewer name
    const formatted = (reviews || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      reviewer_id: r.reviewer_id,
      reviewed_id: r.reviewed_id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewer_name: (r.reviewer as { name?: string } | null)?.name || 'Anonyme',
    }))

    return NextResponse.json({ reviews: formatted })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { reviewed_id, rating, comment } = await req.json()

    if (!reviewed_id || !rating) {
      return NextResponse.json({ error: 'reviewed_id et rating requis' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating entre 1 et 5' }, { status: 400 })
    }

    // Can't review yourself
    if (session.userId === reviewed_id) {
      return NextResponse.json({ error: 'Impossible de vous noter vous-même' }, { status: 400 })
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', session.userId)
      .eq('reviewed_id', reviewed_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà noté cette personne' }, { status: 409 })
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: session.userId,
        reviewed_id,
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Review creation error:', error)
      return NextResponse.json({ error: 'Erreur création avis' }, { status: 500 })
    }

    // Update pro_rating average on the reviewed user
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', reviewed_id)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
      await supabase
        .from('users')
        .update({ pro_rating: Math.round(avg * 10) / 10 })
        .eq('id', reviewed_id)
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
