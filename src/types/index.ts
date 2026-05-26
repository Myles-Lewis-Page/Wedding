export interface Venue {
  id: string
  name: string
  url: string
  image_url: string
  cost: number
  address: string
  description: string
  capacity: number | null
  phone: string
  email: string
  website: string
  amenities: string[]
  is_selected: boolean
  notes: string
  created_at: string
}

export interface Guest {
  id: string
  name: string
  email: string | null
  side: 'bride' | 'groom' | 'both'
  has_plus_one: boolean
  plus_one_name: string | null
  plus_one_dietary: string | null
  dietary: string | null
  rsvp_status: 'pending' | 'attending' | 'declined'
  table_id: string | null
  seat_number: number | null
  created_at: string
  rsvp_at: string | null
}

export interface Table {
  id: string
  name: string
  shape: 'round' | 'rectangular' | 'oval'
  seats: number
  x: number
  y: number
  color: string
  created_at: string
}

export interface BudgetCategory {
  id: string
  name: string
  budgeted: number
  paid: number
  color: string
  order: number
}

export interface Vendor {
  id: string
  category: string
  name: string
  contact_name: string
  phone: string
  email: string
  website: string
  cost: number
  paid: number
  status: 'researching' | 'contacted' | 'booked' | 'paid'
  notes: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  category: string
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  assigned_to: string
  created_at: string
}

export interface WeddingSettings {
  id: string
  bride_name: string
  groom_name: string
  wedding_date: string
  selected_venue_id: string | null
  dress_code: string
  our_story: string
  ceremony_time: string
  reception_time: string
  rsvp_deadline: string
  website_slug: string
}

export interface PlaylistItem {
  id: string
  section: 'ceremony' | 'cocktail' | 'dinner' | 'dancing' | 'do_not_play'
  song_title: string
  artist: string
  notes: string
}

export interface PhotoShot {
  id: string
  group: string
  description: string
  people: string[]
  must_have: boolean
  completed: boolean
}
