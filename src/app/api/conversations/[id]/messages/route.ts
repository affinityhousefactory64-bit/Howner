import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { id: conversationId } = await params

    // Verify user is part of this conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single()

    if (!conv) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    if (conv.user_a !== session.userId && conv.user_b !== session.userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Mark unread messages from the other user as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', session.userId)

    // Fetch all messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
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

    const { id: conversationId } = await params
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    // Verify user is part of this conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single()

    if (!conv) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }

    if (conv.user_a !== session.userId && conv.user_b !== session.userId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.userId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
