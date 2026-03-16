import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get active contest
    const { data: contest } = await supabase
      .from('contest')
      .select('*')
      .eq('is_active', true)
      .single()

    // Count total tickets distributed
    const { data: ticketData } = await supabase
      .from('users')
      .select('tickets')

    const totalTickets = ticketData?.reduce((sum, u) => sum + (u.tickets || 0), 0) || 0

    // Count total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      contest: contest || null,
      totalTickets,
      totalUsers: totalUsers || 0,
      target: contest?.total_tickets_target || 200000,
    })
  } catch (error) {
    console.error('Contest error:', error)
    return NextResponse.json({ contest: null, totalTickets: 0, totalUsers: 0, target: 200000 })
  }
}
