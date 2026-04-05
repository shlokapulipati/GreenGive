export type UserRole = 'subscriber' | 'admin'
export type SubStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'
export type DrawStatus = 'pending' | 'simulation' | 'published'
export type DrawLogic = 'random' | 'weighted_frequent' | 'weighted_rare'
export type WinnerStatus = 'pending' | 'verified' | 'rejected' | 'paid'
export type PaymentStatus = 'pending' | 'paid'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  charity_id?: string
  charity_pct: number
  subscription_status: SubStatus
  subscription_plan?: 'monthly' | 'yearly'
  stripe_customer_id?: string
  stripe_sub_id?: string
  renewal_date?: string
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  played_at: string
  created_at: string
}

export interface Draw {
  id: string
  month: string
  numbers: number[]
  logic_type: DrawLogic
  status: DrawStatus
  jackpot_amount: number
  jackpot_rollover: boolean
  created_at: string
  published_at?: string
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  user_numbers: number[]
  matched_count: number
  created_at: string
}

export interface Prize {
  id: string
  draw_id: string
  tier: 3 | 4 | 5
  pool_amount: number
  winner_count: number
  per_winner_amount: number
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url?: string
  goal_amount: number
  raised_amount: number
  events: CharityEvent[]
  featured: boolean
  active: boolean
  created_at: string
}

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  date: string
  description: string
}

export interface Winner {
  id: string
  user_id: string
  draw_id: string
  tier: 3 | 4 | 5
  amount: number
  proof_url?: string
  status: WinnerStatus
  payment_status: PaymentStatus
  created_at: string
  profile?: Profile
  draw?: Draw
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'monthly' | 'yearly'
  stripe_sub_id: string
  stripe_customer_id: string
  status: SubStatus
  renewal_date: string
  amount: number
  created_at: string
}

export interface DashboardStats {
  total_users: number
  active_subscribers: number
  total_prize_pool: number
  total_charity_donated: number
  draw_stats: {
    total_draws: number
    last_draw_date?: string
    jackpot_current: number
  }
}