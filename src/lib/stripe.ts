import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export const CREDIT_PACKS = [
  { id: 'credit_1', name: '1 crédit', credits: 1, tickets: 1, price: 900, priceLabel: '9€' },
  { id: 'credit_5', name: 'Pack 5 crédits', credits: 5, tickets: 5, price: 3900, priceLabel: '39€' },
  { id: 'credit_15', name: 'Pack 15 crédits', credits: 15, tickets: 15, price: 9900, priceLabel: '99€' },
  { id: 'credit_40', name: 'Pack 40 crédits', credits: 40, tickets: 40, price: 19900, priceLabel: '199€' },
] as const
