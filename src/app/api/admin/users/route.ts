import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  // Check admin
  const { data: adminUser } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.userId)
    .single()

  if (!adminUser?.is_admin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search')
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + 49)

  if (type === 'pro' || type === 'particulier') {
    query = query.eq('type', type)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data: users, error } = await query

  if (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ users: [], error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ users: users || [] })
}
