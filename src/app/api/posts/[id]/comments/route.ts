import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  const { data: comments, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ comments: [] })
  }

  // Fetch user names
  const userIds = [...new Set((comments || []).map(c => c.user_id))]
  const userMap: Record<string, string> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds)

    for (const u of users || []) {
      userMap[u.id] = u.name || 'Utilisateur'
    }
  }

  const enriched = (comments || []).map(c => ({
    ...c,
    user: { name: userMap[c.user_id] || 'Utilisateur' },
  }))

  return NextResponse.json({ comments: enriched })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { id: postId } = await params
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: session.userId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Comment creation error:', error)
      return NextResponse.json({ error: 'Erreur création commentaire' }, { status: 500 })
    }

    // Increment comments_count
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single()

    await supabase
      .from('posts')
      .update({ comments_count: (post?.comments_count || 0) + 1 })
      .eq('id', postId)

    // Fetch user name for response
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', session.userId)
      .single()

    return NextResponse.json({
      comment: {
        ...comment,
        user: { name: userData?.name || 'Utilisateur' },
      },
    })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
