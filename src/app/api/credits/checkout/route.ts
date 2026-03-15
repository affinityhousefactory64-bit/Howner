import { NextRequest, NextResponse } from 'next/server'
import { getStripe, CREDIT_PACKS } from '@/lib/stripe'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { packId } = await req.json()
    const pack = CREDIT_PACKS.find((p) => p.id === packId)

    if (!pack) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: pack.name,
              description: `${pack.credits} crédit${pack.credits > 1 ? 's' : ''} IA + ${pack.tickets} ticket${pack.tickets > 1 ? 's' : ''} jeu concours`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.userId,
        packId: pack.id,
        credits: pack.credits.toString(),
        tickets: pack.tickets.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur de paiement' }, { status: 500 })
  }
}
