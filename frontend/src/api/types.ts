export interface Couple {
  id: string;
  slug: string;
  groom_name: string;
  bride_name: string;
  groom_photo_url: string;
  bride_photo_url: string;
  couple_photo_url: string;
  story: string;
  quote: string;
  wedding_date: string;
  wedding_time: string;
  ceremony_time: string;
  reception_time: string;
  venue_name: string;
  venue_address: string;
  maps_url: string;
  maps_embed_url: string;
  dress_code: string;
  music_url: string;
  primary_color: string;
  secondary_color: string;
  bg_image_url: string;
  video_url: string;
  video_type: string;
  is_published: boolean;
  updated_at: string;
  created_at: string;
}

export interface CountdownInfo {
  wedding_date: string;
  wedding_time: string;
  ceremony_time: string;
  reception_time: string;
}

export interface Guest {
  id: number;
  couple_id: string;
  full_name: string;
  slug: string;
  phone: string;
  notes: string;
  attendance_status: 'pending' | 'attending' | 'not_attending';
  invitation_sent: boolean;
  invitation_opened: boolean;
  invitation_opened_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RSVP {
  id: number;
  couple_id: string;
  guest_id?: number;
  name: string;
  status: 'attending' | 'not_attending';
  attendee_count: number;
  message: string;
  created_at: string;
}

export interface Wish {
  id: number;
  couple_id: string;
  guest_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export interface GalleryPhoto {
  id: number;
  couple_id: string;
  url: string;
  thumbnail_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface MusicTrack {
  id: number;
  couple_id: string;
  title: string;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ScheduleEvent {
  id: number;
  couple_id: string;
  event_time: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface LoveStoryEvent {
  id: number;
  couple_id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface GiftInfo {
  id: number;
  couple_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  qris_image_url: string;
  ewallet_provider: string;
  ewallet_number: string;
  sort_order: number;
}

export interface AdminUser {
  id: number;
  username: string;
  role: 'super' | 'couple';
  couple_id: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  couple_id: string;
}

export interface CreateCoupleResponse {
  couple_id: string;
  slug: string;
  token: string;
  role: string;
  created_at: string;
}

export interface AnalyticsStats {
  total_guests: number;
  attending: number;
  not_attending: number;
  pending: number;
  total_rsvps: number;
  total_wishes: number;
  gallery_count: number;
  recent_opened: { name: string; opened_at: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RSVPStats {
  data: RSVP[];
  total: number;
  attending: number;
  not_attending: number;
  pending: number;
}
