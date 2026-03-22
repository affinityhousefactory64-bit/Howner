import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + 19)

  if (type) query = query.eq('type', type)

  const { data: posts, error } = await query

  if (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ posts: [] })
  }

  // Fetch user info for each unique user_id
  const userIds = [...new Set((posts || []).map(p => p.user_id))]
  const userMap: Record<string, { name: string; pro_category: string | null; pro_photo: string | null; average_rating: number | null }> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, pro_category, pro_photo, average_rating')
      .in('id', userIds)

    for (const u of users || []) {
      userMap[u.id] = {
        name: u.name || 'Utilisateur',
        pro_category: u.pro_category,
        pro_photo: u.pro_photo,
        average_rating: u.average_rating,
      }
    }
  }

  const enriched = (posts || []).map(p => ({
    ...p,
    user: userMap[p.user_id] || { name: 'Utilisateur', pro_category: null, pro_photo: null, average_rating: null },
  }))

  return NextResponse.json({ posts: enriched })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connect\u00e9' }, { status: 401 })
    }

    const body = await req.json()
    const { type, content, media_url, media_type } = body

    if (!type || !content) {
      return NextResponse.json({ error: 'Type et contenu requis' }, { status: 400 })
    }

    const validTypes = ['story', 'update', 'milestone', 'tip']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: session.userId,
        type,
        content,
        media_url: media_url || null,
        media_type: media_type || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Post creation error:', error)
      return NextResponse.json({ error: 'Erreur cr\u00e9ation post' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: session.userId,
      action: 'post_created',
      details: { type, post_id: post.id },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
