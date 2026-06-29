// ── Database types ────────────────────────────────────────────────────────────

export interface Site {
  id: string;
  slug: string;
  name: string;
  full_name: string;
  domain: string;
  domain_www: string | null;
  active: boolean;
  logo_url: string | null;
  primary_color: string;
  map_lat: number;
  map_lng: number;
  map_zoom: number;
  hero_tagline: string;
  site_mode: 'active' | 'maintenance' | 'coming_soon';
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  type: string | null;
  section: string | null;
  description: string | null;
  emoji: string | null;
  color: string | null;
  location: string | null;
  suburb: string | null;
  website: string | null;
  img: string | null;
  plan: string;
  claimed: boolean;
  owner_id: string | null;
  city: string;
  is_gold: boolean;
  gold_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  credit_balance: number;
  admin_priority: number;
  slug: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[];
  listing_type: string | null;
  created_at: string;
}

export interface Event {
  id: number;
  slug: string | null;
  business_id: string | null;
  title: string;
  category: string | null;
  tags: string[];
  date: string | null;
  time: string | null;
  location: string | null;
  price: string | null;
  emoji: string | null;
  color: string | null;
  description: string | null;
  url: string | null;
  img: string | null;
  lat: number | null;
  lng: number | null;
  source: string | null;
  featured: boolean;
  is_promoted: boolean;
  city: string;
  admin_priority: number;
  sport: string | null;
  created_at: string;
}

export interface Stay {
  id: string;
  name: string;
  type: string | null;
  location: string | null;
  price: string | null;
  stars: string | null;
  emoji: string | null;
  color: string | null;
  img: string | null;
  city: string;
  created_at: string;
}

export interface Promo {
  id: string;
  business_id: string | null;
  title: string;
  description: string | null;
  expires: string | null;
  emoji: string | null;
  tag: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  type: 'guide' | 'news' | 'history' | null;
  title: string;
  excerpt: string | null;
  hero_img: string | null;
  before_img: string | null;
  after_img: string | null;
  published_at: string | null;
  author: string | null;
  business_ids: string[];
  event_ids: number[];
  tags: string[];
  content: string | null;
  submitted_by: string | null;
  approved: boolean;
  city: string | null;
  cities: string[] | null;
  created_at: string;
}

export interface Park {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  suburb: string | null;
  img: string | null;
  tags: string[];
  city: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  business_id: string | null;
  city: string;
  item_type: string | null;
  item_id: string | null;
  package: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  starts_at: string | null;
  ends_at: string | null;
  paid_amount: number | null;
  credits_used: number;
  stripe_session_id: string | null;
  created_at: string;
}

export interface Inquiry {
  id: string;
  business_id: string | null;
  name: string | null;
  email: string | null;
  message: string | null;
  unread: boolean;
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string | null;
  title: string | null;
  emoji: string | null;
  color: string | null;
  price: string | null;
  location: string | null;
  created_at: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prize: string | null;
  img: string | null;
  expires: string | null;
  city: string | null;
  active: boolean;
  created_at: string;
}

// ── Page/component types ──────────────────────────────────────────────────────

export type Section = 'eat' | 'drink' | 'do' | 'stay';

export interface CityConfig {
  slug: string;
  name: string;
  fullName: string;
  domain: string;
  logoUrl: string | null;
  primaryColor: string;
  heroTagline: string;
  mapLat: number;
  mapLng: number;
  mapZoom: number;
}

export const ADMIN_EMAILS = ['lee.renton81@gmail.com', 'adele@whattodogeelong.com.au'];
