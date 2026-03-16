import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { data: tasks } = await supabase
      .from('ai_tasks')
      .select('id, type, input, output, created_at')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json({ tasks: [] })
  }
}
