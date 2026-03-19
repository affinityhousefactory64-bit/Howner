import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

export const STANDARD_PACKS = [
  { id: 'standard_1', name: '1 crédit', credits: 1, tickets: 1, price: 900, priceLabel: '9€', pricePerCredit: '9€' },
  { id: 'standard_5', name: '5 crédits', credits: 5, tickets: 5, price: 3900, priceLabel: '39€', pricePerCredit: '7,80€' },
  { id: 'standard_10', name: '10 crédits', credits: 10, tickets: 10, price: 6900, priceLabel: '69€', pricePerCredit: '6,90€' },
  { id: 'standard_20', name: '20 crédits', credits: 20, tickets: 20, price: 11900, priceLabel: '119€', pricePerCredit: '5,95€' },
] as const

export const PRO_PACKS = [
  { id: 'pro_10', name: '10 crédits Pro', credits: 10, tickets: 10, price: 5900, priceLabel: '59€', pricePerCredit: '5,90€' },
  { id: 'pro_30', name: '30 crédits Pro', credits: 30, tickets: 30, price: 14900, priceLabel: '149€', pricePerCredit: '4,97€' },
  { id: 'pro_50', name: '50 crédits Pro', credits: 50, tickets: 50, price: 22900, priceLabel: '229€', pricePerCredit: '4,58€' },
  { id: 'pro_100', name: '100 crédits Pro', credits: 100, tickets: 100, price: 39900, priceLabel: '399€', pricePerCredit: '3,99€' },
] as const

export const ALL_PACKS = [...STANDARD_PACKS, ...PRO_PACKS]
