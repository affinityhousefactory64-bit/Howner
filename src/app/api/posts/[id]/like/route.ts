import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connect\u00e9' }, { status: 401 })
    }

    const { id: postId } = await params

    // Check if already liked
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.userId)
      .single()

    if (existing) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.userId)

      // Decrement likes_count
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      await supabase
        .from('posts')
        .update({ likes_count: Math.max(0, (post?.likes_count || 1) - 1) })
        .eq('id', postId)

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: session.userId })

      // Increment likes_count
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      await supabase
        .from('posts')
        .update({ likes_count: (post?.likes_count || 0) + 1 })
        .eq('id', postId)

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
