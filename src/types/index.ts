export type UserType = 'particulier' | 'pro'
export type ProType = 'agent' | 'courtier' | 'promoteur'

export type ListingCategory = 'immo' | 'service' | 'demande'
export type ListingSubcategory =
  | 'vente' | 'location' | 'recherche_achat' | 'recherche_location'
  | 'offre_service' | 'recherche_service'

export type SwipeDirection = 'left' | 'right'
export type CreditAction = 'listing' | 'boost' | 'alert'

export type PackType =
  | 'standard_1' | 'standard_5' | 'standard_10' | 'standard_20'
  | 'pro_10' | 'pro_30' | 'pro_50' | 'pro_100'

export interface User {
  id: string
  phone: string
  name: string
  type: UserType
  pro_category: ProType | null
  pro_specialty: string | null
  pro_zone: string | null
  pro_photo: string | null
  pro_rating: number | null
  pro_transactions: number
  credits: number
  tickets: number
  free_listing_used: boolean
  referral_code: string
  referred_by: string | null
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  category: ListingCategory
  subcategory: ListingSubcategory
  title: string
  description: string
  location: string
  price: number | null
  surface: number | null
  rooms: number | null
  is_boosted: boolean
  boost_expires_at: string | null
  alert_active: boolean
  alert_expires_at: string | null
  created_at: string
}

export interface Swipe {
  id: string
  swiper_id: string
  swiped_id: string
  direction: SwipeDirection
  created_at: string
}

export interface Match {
  id: string
  user_a: string
  user_b: string
  created_at: string
}

export interface CreditPurchase {
  id: string
  user_id: string
  pack_type: PackType
  credits: number
  tickets: number
  amount_cents: number
  stripe_payment_id: string | null
  created_at: string
}

export interface CreditUsage {
  id: string
  user_id: string
  action: CreditAction
  listing_id: string | null
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Contest {
  id: string
  cycle: number
  total_tickets: number
  total_revenue_cents: number
  target_tickets: number
  target_revenue_cents: number
  status: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
}
