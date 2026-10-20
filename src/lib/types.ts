export type Platform = 'Instagram' | 'TikTok' | 'YouTube';

export interface DropItem {
  id: string;
  name: string;
  description?: string | null;
  status: 'active' | 'planning' | 'launched' | 'archived';
  target_date?: string | null;
  created_at: string;
}

export type AthleteNiche = 'Pilates' | 'Yoga' | 'Hyrox & Strength' | 'Marathon & Running' | 'CrossFit & Functional' | 'Mobility & Physio' | 'Athleisure';

export type FollowerTier = 'Nano (<10k)' | 'Micro (10k-50k)' | 'Mid (50k-250k)' | 'Macro (250k+)';

export type SeedingStage =
  | 'scouted'
  | 'contacted'
  | 'sizing_confirmed'
  | 'kit_shipped'
  | 'post_live'
  | 'ambassador';

export interface AthleteCreator {
  id: string;
  full_name: string;
  handle: string;
  platform: Platform;
  niche: AthleteNiche;
  follower_tier: FollowerTier;
  // Sizing Matrix
  top_size: string;
  sports_bra_size: string;
  bottom_size: string;
  inseam_length: string;
  preferred_colors: string;
  // Pipeline & Logistics
  stage: SeedingStage;
  target_drop: string;
  shipping_address?: string | null;
  phone?: string | null;
  email?: string | null;
  tracking_number?: string | null;
  courier_partner?: string | null;
  post_url?: string | null;
  discount_code?: string | null;
  notes?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type WholesaleStage =
  | 'lead_pitch'
  | 'lookbook_sent'
  | 'sample_kit_sent'
  | 'po_received'
  | 'active_partner';

export type StudioAccountType =
  | 'Pilates Studio'
  | 'Yoga Studio'
  | 'Boutique Gym'
  | 'Multi-Brand Retailer';

export interface WholesaleAccount {
  id: string;
  business_name: string;
  account_type: StudioAccountType;
  location: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  stage: WholesaleStage;
  estimated_order_value: number;
  target_delivery_date?: string | null;
  notes?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type ContactCategory =
  | 'VIP Waitlist'
  | 'Press/Media'
  | 'Fitness Coach'
  | 'Community Leader';

export type VIPLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
export type TierColor = 'Green' | 'Yellow' | 'Damper' | 'Red';

export interface CRMContact {
  id: string;
  full_name: string;
  category: ContactCategory;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  full_address?: string | null;
  source?: string | null;
  vip_level?: VIPLevel | string;
  tier_color?: TierColor | string;
  estimated_spend?: string | null;
  status: string;
  notes?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
