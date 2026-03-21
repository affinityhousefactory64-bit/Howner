import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const updates: Record<string, string | null> = {}

  if (typeof body.pro_specialty === 'string') updates.pro_specialty = body.pro_specialty || null
  if (typeof body.pro_zone === 'string') updates.pro_zone = body.pro_zone || null
  if (typeof body.pro_photo === 'string') updates.pro_photo = body.pro_photo || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 })
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', session.userId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user })
}
