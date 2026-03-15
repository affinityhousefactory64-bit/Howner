export type UserType = 'particulier' | 'artisan' | 'agent' | 'promoteur' | 'courtier'

export type ListingType = 'vente' | 'location' | 'neuf'

export type ListingSource = 'howner' | 'leboncoin' | 'seloger' | 'pap' | 'bienici'

export type MatchStatus = 'pending_a' | 'pending_b' | 'matched' | 'rejected'

export type SwipeDirection = 'left' | 'right'

export type CreditTransactionType = 'purchase' | 'referral' | 'signup_bonus'

export type AITaskType = 'search_buy' | 'search_rent' | 'search_artisan' | 'bank_file' | 'quote_analysis' | 'property_analysis'

export type ProPlan = 'free' | 'artisan' | 'agent' | 'promoteur'

export interface User {
  id: string
  phone: string
  type: UserType
  name: string
  credits: number
  tickets: number
  referral_code: string
  referred_by: string | null
  created_at: string
}

export interface Listing {
  id: string
  user_id: string | null
  type: ListingType
  title: string
  location: string
  price: number
  surface: number
  rooms: number
  description: string
  source: ListingSource
  external_url: string | null
  is_native: boolean
  created_at: string
}

export interface Match {
  id: string
  user_a: string
  user_b: string
  status: MatchStatus
  created_at: string
}

export interface Swipe {
  id: string
  swiper_id: string
  swiped_id: string
  direction: SwipeDirection
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: CreditTransactionType
  stripe_payment_id: string | null
  created_at: string
}

export interface AITask {
  id: string
  user_id: string
  type: AITaskType
  input: Record<string, unknown>
  output: Record<string, unknown>
  created_at: string
}

export interface ProSubscription {
  id: string
  user_id: string
  plan: ProPlan
  stripe_subscription_id: string | null
  active: boolean
  created_at: string
}
