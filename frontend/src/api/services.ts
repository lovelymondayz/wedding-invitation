import apiClient from './client';
import type {
  Couple, CountdownInfo, Guest, RSVP, Wish,
  GalleryPhoto, MusicTrack, ScheduleEvent, LoveStoryEvent,
  GiftInfo, LoginResponse, CreateCoupleResponse, AnalyticsStats, PaginatedResponse, RSVPStats,
} from './types';

const slug = (coupleSlug: string) => `/couples/${coupleSlug}`;

// ═══════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════

// Create a new couple (homepage form)
export const createCouple = (data: {
  groom_name: string; bride_name: string; wedding_date: string;
  wedding_time?: string; venue_name?: string; venue_address?: string;
  username: string; password: string;
}) => apiClient.post<CreateCoupleResponse>('/couples', data).then(r => r.data);

// Couple-scoped public endpoints
export const getCouple = (coupleSlug: string) => apiClient.get<Couple>(`/couples/${coupleSlug}`).then(r => r.data);
export const getCountdown = (coupleSlug: string) => apiClient.get<CountdownInfo>(`/couples/${coupleSlug}/countdown`).then(r => r.data);
export const getGuest = (coupleSlug: string, guestSlug: string) => apiClient.get<Guest>(`/couples/${coupleSlug}/guest/${guestSlug}`).then(r => r.data);
export const markOpened = (coupleSlug: string, guestSlug: string) => apiClient.post(`/couples/${coupleSlug}/guest/${guestSlug}/open`).then(r => r.data);
export const submitRSVP = (coupleSlug: string, data: Partial<RSVP>) => apiClient.post(`/couples/${coupleSlug}/rsvp`, data).then(r => r.data);
export const getWishes = (coupleSlug: string) => apiClient.get<Wish[]>(`/couples/${coupleSlug}/wishes`).then(r => r.data);
export const submitWish = (coupleSlug: string, data: { guest_name: string; message: string }) => apiClient.post(`/couples/${coupleSlug}/wishes`, data).then(r => r.data);
export const getGallery = (coupleSlug: string) => apiClient.get<GalleryPhoto[]>(`/couples/${coupleSlug}/gallery`).then(r => r.data);
export const getMusic = (coupleSlug: string) => apiClient.get<MusicTrack>(`/couples/${coupleSlug}/music/active`).then(r => r.data);
export const getSchedule = (coupleSlug: string) => apiClient.get<ScheduleEvent[]>(`/couples/${coupleSlug}/schedule`).then(r => r.data);
export const getLoveStory = (coupleSlug: string) => apiClient.get<LoveStoryEvent[]>(`/couples/${coupleSlug}/love-story`).then(r => r.data);
export const getGift = (coupleSlug: string) => apiClient.get<GiftInfo[]>(`/couples/${coupleSlug}/gift`).then(r => r.data);

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════

export const loginAdmin = (username: string, password: string) =>
  apiClient.post<LoginResponse>('/auth/login', { username, password }).then(r => r.data);
export const getMe = () => apiClient.get('/admin/auth/me').then(r => r.data);

// ═══════════════════════════════════════════
// ADMIN ENDPOINTS (all scoped by coupleSlug)
// ═══════════════════════════════════════════

export const adminUpdateCouple = (coupleSlug: string, data: Partial<Couple>) =>
  apiClient.put(`/admin/couples/${coupleSlug}`, data).then(r => r.data);

export const adminGetGuests = (coupleSlug: string, page = 1, limit = 20, search = '') =>
  apiClient.get<PaginatedResponse<Guest>>(`/admin/couples/${coupleSlug}/guests`, { params: { page, limit, search } }).then(r => r.data);
export const adminCreateGuest = (coupleSlug: string, data: Partial<Guest>) =>
  apiClient.post(`/admin/couples/${coupleSlug}/guests`, data).then(r => r.data);
export const adminUpdateGuest = (coupleSlug: string, id: number, data: Partial<Guest>) =>
  apiClient.put(`/admin/couples/${coupleSlug}/guests/${id}`, data).then(r => r.data);
export const adminDeleteGuest = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/guests/${id}`).then(r => r.data);
export const adminImportGuests = (coupleSlug: string, formData: FormData) =>
  apiClient.post(`/admin/couples/${coupleSlug}/guests/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminExportGuests = (coupleSlug: string) =>
  apiClient.get(`/admin/couples/${coupleSlug}/guests/export`, { responseType: 'blob' }).then(r => r.data);

export const adminGetRSVPs = (coupleSlug: string) =>
  apiClient.get<RSVPStats>(`/admin/couples/${coupleSlug}/rsvps`).then(r => r.data);

export const adminGetWishes = (coupleSlug: string) =>
  apiClient.get<Wish[]>(`/admin/couples/${coupleSlug}/wishes`).then(r => r.data);
export const adminUpdateWish = (coupleSlug: string, id: number, data: Partial<Wish>) =>
  apiClient.put(`/admin/couples/${coupleSlug}/wishes/${id}`, data).then(r => r.data);
export const adminDeleteWish = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/wishes/${id}`).then(r => r.data);

export const adminAddGalleryPhoto = (coupleSlug: string, data: Partial<GalleryPhoto>) =>
  apiClient.post(`/admin/couples/${coupleSlug}/gallery`, data).then(r => r.data);
export const adminUpdateGalleryPhoto = (coupleSlug: string, id: number, data: Partial<GalleryPhoto>) =>
  apiClient.put(`/admin/couples/${coupleSlug}/gallery/${id}`, data).then(r => r.data);
export const adminDeleteGalleryPhoto = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/gallery/${id}`).then(r => r.data);
export const adminReorderGallery = (coupleSlug: string, orders: { id: number; sort_order: number }[]) =>
  apiClient.put(`/admin/couples/${coupleSlug}/gallery/reorder`, { orders }).then(r => r.data);

export const adminAddMusicTrack = (coupleSlug: string, data: Partial<MusicTrack>) =>
  apiClient.post(`/admin/couples/${coupleSlug}/music`, data).then(r => r.data);
export const adminActivateMusic = (coupleSlug: string, id: number) =>
  apiClient.put(`/admin/couples/${coupleSlug}/music/${id}/activate`).then(r => r.data);
export const adminDeleteMusic = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/music/${id}`).then(r => r.data);

export const adminCreateScheduleEvent = (coupleSlug: string, data: Partial<ScheduleEvent>) =>
  apiClient.post(`/admin/couples/${coupleSlug}/schedule`, data).then(r => r.data);
export const adminUpdateScheduleEvent = (coupleSlug: string, id: number, data: Partial<ScheduleEvent>) =>
  apiClient.put(`/admin/couples/${coupleSlug}/schedule/${id}`, data).then(r => r.data);
export const adminDeleteScheduleEvent = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/schedule/${id}`).then(r => r.data);

export const adminCreateLoveStoryEvent = (coupleSlug: string, data: Partial<LoveStoryEvent>) =>
  apiClient.post(`/admin/couples/${coupleSlug}/love-story`, data).then(r => r.data);
export const adminUpdateLoveStoryEvent = (coupleSlug: string, id: number, data: Partial<LoveStoryEvent>) =>
  apiClient.put(`/admin/couples/${coupleSlug}/love-story/${id}`, data).then(r => r.data);
export const adminDeleteLoveStoryEvent = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/love-story/${id}`).then(r => r.data);

export const adminCreateGiftInfo = (coupleSlug: string, data: Partial<GiftInfo>) =>
  apiClient.post(`/admin/couples/${coupleSlug}/gift`, data).then(r => r.data);
export const adminUpdateGiftInfo = (coupleSlug: string, id: number, data: Partial<GiftInfo>) =>
  apiClient.put(`/admin/couples/${coupleSlug}/gift/${id}`, data).then(r => r.data);
export const adminDeleteGiftInfo = (coupleSlug: string, id: number) =>
  apiClient.delete(`/admin/couples/${coupleSlug}/gift/${id}`).then(r => r.data);

export const adminGetAnalytics = (coupleSlug: string) =>
  apiClient.get<AnalyticsStats>(`/admin/couples/${coupleSlug}/analytics`).then(r => r.data);

// Super admin
export const adminGetAllCouples = () =>
  apiClient.get<Couple[]>('/admin/couples').then(r => r.data);

export const adminUploadFile = (coupleSlug: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/admin/couples/${coupleSlug}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};
