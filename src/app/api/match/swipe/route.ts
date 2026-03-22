import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { profileId, direction } = await req.json()

  if (!profileId || !direction) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // Log swipe in DB
  await supabase.from('swipes').insert({
    swiper_id: session.userId,
    swiped_id: profileId,
    direction,
  }).select()

  // Check if mutual match (other person already swiped right on us)
  let isMatch = false
  if (direction === 'right') {
    const { data: mutual } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_id', profileId)
      .eq('swiped_id', session.userId)
      .eq('direction', 'right')
      .single()

    if (mutual) {
      isMatch = true
      await supabase.from('matches').insert({
        user_a: session.userId,
        user_b: profileId,
        status: 'matched',
      })

      // Auto-create conversation on match
      const userA = session.userId < profileId ? session.userId : profileId
      const userB = session.userId < profileId ? profileId : session.userId
      await supabase.from('conversations').insert({
        user_a: userA,
        user_b: userB,
        listing_id: null,
        source: 'match',
      })
    }
  }

  return NextResponse.json({ ok: true, isMatch })
}
