import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const userId = session.userId

    // Get all conversations where user is participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    // Enrich with other user info, listing title, unread count
    const enriched = await Promise.all(
      (conversations || []).map(async (conv) => {
        const otherUserId = conv.user_a === userId ? conv.user_b : conv.user_a

        // Get other user
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, name, pro_category, pro_photo')
          .eq('id', otherUserId)
          .single()

        // Get listing title if applicable
        let listing = null
        if (conv.listing_id) {
          const { data: l } = await supabase
            .from('listings')
            .select('title')
            .eq('id', conv.listing_id)
            .single()
          listing = l
        }

        // Count unread messages (sent by the other user, not yet read)
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId)

        // Get last message preview
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          other_user: otherUser,
          listing,
          unread_count: count || 0,
          last_message_preview: lastMsg?.content || null,
          last_message_time: lastMsg?.created_at || conv.last_message_at,
        }
      })
    )

    return NextResponse.json({ conversations: enriched })
  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { userId: otherUserId, listingId, source } = await req.json()

    if (!otherUserId || !source) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (otherUserId === session.userId) {
      return NextResponse.json({ error: 'Impossible de créer une conversation avec vous-même' }, { status: 400 })
    }

    // Normalize user order to avoid duplicates (smaller UUID first)
    const userA = session.userId < otherUserId ? session.userId : otherUserId
    const userB = session.userId < otherUserId ? otherUserId : session.userId

    // Check if conversation already exists
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_a', userA)
      .eq('user_b', userB)

    if (listingId) {
      query = query.eq('listing_id', listingId)
    } else {
      query = query.is('listing_id', null)
    }

    const { data: existing } = await query.single()

    if (existing) {
      return NextResponse.json({ conversation: existing })
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        user_a: userA,
        user_b: userB,
        listing_id: listingId || null,
        source,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ conversation: newConv }, { status: 201 })
  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
