export type UserType = 'particulier' | 'pro'
export type ProType = 'agent' | 'courtier' | 'promoteur'

export type ListingCategory = 'immo' | 'service' | 'demande'
export type ListingSubcategory =
  | 'vente' | 'location' | 'recherche_achat' | 'recherche_location'
  | 'offre_service' | 'recherche_service'

export type SwipeDirection = 'left' | 'right'
export type CreditAction = 'listing' | 'boost' | 'alert' | 'reservation' | 'estimation' | 'optimize_listing'

export type ReservationStatus = 'active' | 'contacted' | 'expired' | 'cancelled'

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
  average_rating: number | null
  review_count: number
  credits: number
  tickets: number
  free_listing_used: boolean
  referral_code: string
  referred_by: string | null
  is_admin: boolean
  created_at: string
}

export type PropertyType = 'appartement' | 'maison' | 'terrain' | 'local_commercial' | 'parking'
export type DPE = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type Urgency = 'normal' | 'urgent'

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
  property_type: PropertyType | null
  bedrooms: number | null
  floor: number | null
  dpe: DPE | null
  photos: string[] | null
  video: string | null
  pro_tariff: string | null
  pro_availability: string | null
  urgency: Urgency | null
  view_count: number
  is_active: boolean
  is_boosted: boolean
  boost_expires_at: string | null
  alert_active: boolean
  alert_expires_at: string | null
  reservation_window_hours: number
  max_reservations: number
  external_link: string | null
  expires_at: string | null
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
  listing_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export interface Reservation {
  id: string
  listing_id: string
  user_id: string
  status: ReservationStatus
  created_at: string
  listings?: {
    title: string
    location: string
    price: number | null
    subcategory: ListingSubcategory
  }
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

export interface WaitlistInvest {
  id: string
  email: string
  created_at: string
}

export type PostType = 'story' | 'update' | 'milestone' | 'tip'

export interface Post {
  id: string
  user_id: string
  type: PostType
  content: string
  media_url: string | null
  media_type: 'photo' | 'video' | null
  likes_count: number
  comments_count: number
  is_sponsored: boolean
  created_at: string
  user?: { name: string; pro_category: string | null; pro_photo: string | null; average_rating: number | null }
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: { name: string }
}

export interface Conversation {
  id: string
  user_a: string
  user_b: string
  listing_id: string | null
  source: 'match' | 'reservation'
  last_message_at: string
  created_at: string
  other_user?: { id: string; name: string; pro_category: string | null; pro_photo: string | null }
  listing?: { title: string }
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Alert {
  id: string
  user_id: string
  category: string | null
  subcategory: string | null
  location: string | null
  price_min: number | null
  price_max: number | null
  surface_min: number | null
  property_type: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}
