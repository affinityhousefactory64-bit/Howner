import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, packId, credits, tickets } = session.metadata || {}

    if (userId && credits && tickets) {
      const creditAmount = parseInt(credits)
      const ticketAmount = parseInt(tickets)

      // Get current user
      const { data: user } = await supabase
        .from('users')
        .select('credits, tickets')
        .eq('id', userId)
        .single()

      if (user) {
        // Update credits and tickets
        await supabase
          .from('users')
          .update({
            credits: user.credits + creditAmount,
            tickets: user.tickets + ticketAmount,
          })
          .eq('id', userId)

        // Log purchase
        await supabase.from('credit_purchases').insert({
          user_id: userId,
          pack_type: packId || 'standard_1',
          credits: creditAmount,
          tickets: ticketAmount,
          amount_cents: session.amount_total || 0,
          stripe_payment_id: session.payment_intent as string,
        })

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: userId,
          action: 'credit_purchase',
          details: { credits: creditAmount, tickets: ticketAmount, pack: packId },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
