import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../../api/services';
import type { Guest, Wish, GalleryPhoto, MusicTrack, ScheduleEvent, LoveStoryEvent, GiftInfo, Couple, AnalyticsStats, PaginatedResponse } from '../../api/types';

// Helper to get coupleSlug from URL
const useCoupleSlug = () => useParams<{ coupleSlug: string }>().coupleSlug || '';

// ═══════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════
export const Overview: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);

  useEffect(() => {
    api.adminGetAnalytics(coupleSlug).then(setStats).catch(() => {});
    api.getCouple(coupleSlug).then(setCouple).catch(() => {});
  }, [coupleSlug]);

  const cards = [
    { label: 'Total Guests', value: stats?.total_guests || 0, icon: '👥' },
    { label: 'Attending', value: stats?.attending || 0, icon: '✅' },
    { label: 'Not Attending', value: stats?.not_attending || 0, icon: '❌' },
    { label: 'Pending', value: stats?.pending || 0, icon: '⏳' },
    { label: 'Total RSVPs', value: stats?.total_rsvps || 0, icon: '💌' },
    { label: 'Total Wishes', value: stats?.total_wishes || 0, icon: '💬' },
    { label: 'Gallery Photos', value: stats?.gallery_count || 0, icon: '📷' },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-dark mb-2">Dashboard Overview</h1>
      {couple && <p className="text-dark/40 mb-8">{couple.groom_name} & {couple.bride_name}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-xl p-4">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-serif text-dark">{card.value}</div>
            <div className="text-dark/50 text-sm">{card.label}</div>
          </div>
        ))}
      </div>
      {stats?.recent_opened && stats.recent_opened.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-serif text-xl text-dark mb-4">Recent Invitation Opens</h2>
          {stats.recent_opened.map((r: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-gold/10 last:border-0">
              <span className="text-dark/70">{r.name}</span>
              <span className="text-dark/40 text-sm">{r.opened_at ? new Date(r.opened_at).toLocaleString() : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// GUEST MANAGEMENT
// ═══════════════════════════════════════════
export const GuestManagement: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newGuest, setNewGuest] = useState({ full_name: '', phone: '', notes: '' });

  const loadGuests = async () => {
    try {
      const res = await api.adminGetGuests(coupleSlug, page, 20, search);
      setGuests(res.data);
      setTotal(res.total);
    } catch { toast.error('Failed to load guests'); }
  };

  useEffect(() => { loadGuests(); }, [page, search, coupleSlug]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateGuest(coupleSlug, newGuest);
      toast.success('Guest added');
      setShowAdd(false);
      setNewGuest({ full_name: '', phone: '', notes: '' });
      loadGuests();
    } catch { toast.error('Failed to add guest'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this guest?')) return;
    try { await api.adminDeleteGuest(coupleSlug, id); toast.success('Deleted'); loadGuests(); } catch { toast.error('Failed'); }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = { attending: 'bg-green-100 text-green-700', not_attending: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' };
    return <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || colors.pending}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl text-dark">Guest Management</h1>
        <button onClick={() => setShowAdd(true)} className="btn-gold text-sm">+ Add Guest</button>
      </div>

      <input type="text" placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-64 px-4 py-2 rounded-xl border border-gold/20 bg-cream/50 mb-4 focus:outline-none focus:border-gold" />

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gold/10">
            <th className="text-left p-4 text-dark/50 text-sm">Name</th>
            <th className="text-left p-4 text-dark/50 text-sm hidden md:table-cell">Phone</th>
            <th className="text-left p-4 text-dark/50 text-sm">Status</th>
            <th className="text-left p-4 text-dark/50 text-sm">Link</th>
            <th className="text-left p-4 text-dark/50 text-sm">Actions</th>
          </tr></thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} className="border-b border-gold/5 hover:bg-gold/5">
                <td className="p-4 font-medium text-dark">{g.full_name}</td>
                <td className="p-4 text-dark/60 text-sm hidden md:table-cell">{g.phone}</td>
                <td className="p-4">{getStatusBadge(g.attendance_status)}</td>
                <td className="p-4">
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${coupleSlug}/invite/${g.slug}`); toast.success('Copied!'); }}
                    className="text-gold text-xs hover:underline">Copy Link</button>
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(g.id)} className="text-red-400 text-sm hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)}
            className={`w-8 h-8 rounded-full text-sm ${page === i + 1 ? 'bg-gold text-white' : 'glass'}`}>{i + 1}</button>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-dark/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-dark mb-4">Add Guest</h2>
            <form onSubmit={handleAdd}>
              <input type="text" placeholder="Full Name *" required value={newGuest.full_name}
                onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gold/20 mb-3 focus:outline-none focus:border-gold" />
              <input type="text" placeholder="Phone" value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gold/20 mb-3 focus:outline-none focus:border-gold" />
              <textarea placeholder="Notes" value={newGuest.notes}
                onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gold/20 mb-4 focus:outline-none focus:border-gold resize-none" rows={2} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-gold/20 text-dark/60">Cancel</button>
                <button type="submit" className="btn-gold flex-1">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// WISHES MANAGEMENT
// ═══════════════════════════════════════════
export const WishesManagement: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [wishes, setWishes] = useState<Wish[]>([]);
  useEffect(() => { api.adminGetWishes(coupleSlug).then(setWishes).catch(() => {}); }, [coupleSlug]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this wish?')) return;
    try { await api.adminDeleteWish(coupleSlug, id); setWishes(wishes.filter((w) => w.id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-dark mb-6">Wishes Management</h1>
      {wishes.map((w) => (
        <div key={w.id} className="glass rounded-xl p-4 mb-3 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-dark">{w.guest_name}</span>
              {!w.is_approved && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>}
            </div>
            <p className="text-dark/60 text-sm">{w.message}</p>
            <p className="text-dark/30 text-xs mt-1">{new Date(w.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={() => handleDelete(w.id)} className="text-red-400 text-sm shrink-0">Delete</button>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════
// GALLERY MANAGEMENT
// ═══════════════════════════════════════════
export const GalleryManagement: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const loadPhotos = async () => { try { setPhotos(await api.getGallery(coupleSlug).catch(() => [])); } catch {} };
  useEffect(() => { loadPhotos(); }, [coupleSlug]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.adminAddGalleryPhoto(coupleSlug, { url, caption }); setUrl(''); setCaption(''); loadPhotos(); toast.success('Added'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: number) => {
    try { await api.adminDeleteGalleryPhoto(coupleSlug, id); loadPhotos(); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-dark mb-6">Gallery Management</h1>
      <form onSubmit={handleAdd} className="glass rounded-xl p-4 mb-6 flex gap-3 flex-wrap">
        <input type="url" placeholder="Image URL *" required value={url} onChange={(e) => setUrl(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gold/20 focus:outline-none focus:border-gold" />
        <input type="text" placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)}
          className="flex-1 min-w-[150px] px-4 py-2 rounded-xl border border-gold/20 focus:outline-none focus:border-gold" />
        <button type="submit" className="btn-gold text-sm !py-2">Add Photo</button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="relative rounded-xl overflow-hidden group">
            <div className="aspect-square bg-gradient-to-br from-gold/20 to-soft-pink flex items-center justify-center">
              {p.url.startsWith('http') ? <img src={p.url} alt={p.caption} className="w-full h-full object-cover" /> : <span className="text-3xl">📷</span>}
            </div>
            {p.caption && <p className="text-dark/50 text-xs mt-1 text-center">{p.caption}</p>}
            <button onClick={() => handleDelete(p.id)}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// MUSIC MANAGEMENT
// ═══════════════════════════════════════════
export const MusicManagement: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const loadTracks = async () => {
    try {
      const active = await api.getMusic(coupleSlug).catch(() => null);
      setTracks(active ? [active] : []);
    } catch {}
  };
  useEffect(() => { loadTracks(); }, [coupleSlug]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTrack = await api.adminAddMusicTrack(coupleSlug, { title, url });
      setTracks([...tracks, newTrack]);
      setTitle(''); setUrl('');
      toast.success('Track added');
    } catch { toast.error('Failed'); }
  };

  const handleActivate = async (id: number) => {
    try {
      await api.adminActivateMusic(coupleSlug, id);
      setTracks(tracks.map((t) => ({ ...t, is_active: t.id === id })));
      toast.success('Activated');
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try { await api.adminDeleteMusic(coupleSlug, id); setTracks(tracks.filter((t) => t.id !== id)); } catch {}
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-dark mb-6">Music Management</h1>
      <form onSubmit={handleAdd} className="glass rounded-xl p-4 mb-6 flex gap-3 flex-wrap">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[150px] px-4 py-2 rounded-xl border border-gold/20 focus:outline-none focus:border-gold" />
        <input type="url" placeholder="MP3 URL *" required value={url} onChange={(e) => setUrl(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gold/20 focus:outline-none focus:border-gold" />
        <button type="submit" className="btn-gold text-sm !py-2">Add Track</button>
      </form>
      {tracks.map((t) => (
        <div key={t.id} className="glass rounded-xl p-4 mb-3 flex justify-between items-center">
          <div>
            <span className="text-dark font-medium">{t.title || 'Untitled'}</span>
            {t.is_active && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>}
          </div>
          <div className="flex gap-2">
            {!t.is_active && <button onClick={() => handleActivate(t.id)} className="text-gold text-sm">Set Active</button>}
            <button onClick={() => handleDelete(t.id)} className="text-red-400 text-sm">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════
// SIMPLE CRUD HELPER
// ═══════════════════════════════════════════
export function SimpleCrud({ title, fields, loadFn, createFn, deleteFn }: {
  title: string;
  fields: { key: string; label: string; type?: string }[];
  loadFn: () => Promise<any[]>;
  createFn: (data: any) => Promise<any>;
  deleteFn: (id: number) => Promise<any>;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = async () => { try { setItems(await loadFn()); } catch {} };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await createFn(form); setForm({}); setShowAdd(false); load(); toast.success('Added'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete?')) return;
    try { await deleteFn(id); load(); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl text-dark">{title}</h1>
        <button onClick={() => setShowAdd(true)} className="btn-gold text-sm">+ Add</button>
      </div>
      {items.map((item, i) => (
        <div key={item.id || i} className="glass rounded-xl p-4 mb-3 flex justify-between items-center">
          <div>{fields.map((f) => <span key={f.key} className="text-dark/70 mr-4">{item[f.key]}</span>)}</div>
          <button onClick={() => handleDelete(item.id)} className="text-red-400 text-sm">Delete</button>
        </div>
      ))}
      {showAdd && (
        <div className="fixed inset-0 bg-dark/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-dark mb-4">Add {title}</h2>
            <form onSubmit={handleSubmit}>
              {fields.map((f) => (
                <input key={f.key} type={f.type || 'text'} placeholder={f.label} required
                  value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gold/20 mb-3 focus:outline-none focus:border-gold" />
              ))}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-gold/20">Cancel</button>
                <button type="submit" className="btn-gold flex-1">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SCHEDULE, LOVE STORY, GIFT PAGES
// ═══════════════════════════════════════════
export const SchedulePage: FC = () => {
  const coupleSlug = useCoupleSlug();
  return (
    <SimpleCrud title="Schedule Events"
      fields={[{ key: 'event_time', label: 'Time (HH:MM)', type: 'time' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }]}
      loadFn={() => api.getSchedule(coupleSlug)}
      createFn={(data) => api.adminCreateScheduleEvent(coupleSlug, data)}
      deleteFn={(id) => api.adminDeleteScheduleEvent(coupleSlug, id)} />
  );
};

export const LoveStoryPage: FC = () => {
  const coupleSlug = useCoupleSlug();
  return (
    <SimpleCrud title="Love Story Events"
      fields={[{ key: 'year', label: 'Year' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }, { key: 'icon', label: 'Icon (emoji)' }]}
      loadFn={() => api.getLoveStory(coupleSlug)}
      createFn={(data) => api.adminCreateLoveStoryEvent(coupleSlug, data)}
      deleteFn={(id) => api.adminDeleteLoveStoryEvent(coupleSlug, id)} />
  );
};

export const GiftPage: FC = () => {
  const coupleSlug = useCoupleSlug();
  return (
    <SimpleCrud title="Gift Information"
      fields={[{ key: 'bank_name', label: 'Bank Name' }, { key: 'account_number', label: 'Account Number' }, { key: 'account_name', label: 'Account Name' }]}
      loadFn={() => api.getGift(coupleSlug)}
      createFn={(data) => api.adminCreateGiftInfo(coupleSlug, data)}
      deleteFn={(id) => api.adminDeleteGiftInfo(coupleSlug, id)} />
  );
};

// ═══════════════════════════════════════════
// RSVP DASHBOARD
// ═══════════════════════════════════════════
export const RSVPPage: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.adminGetRSVPs(coupleSlug).then(setData).catch(() => {}); }, [coupleSlug]);
  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="font-serif text-3xl text-dark mb-6">RSVP Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-serif text-dark">{data.total}</div><div className="text-dark/50 text-sm">Total</div></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-serif text-green-600">{data.attending}</div><div className="text-dark/50 text-sm">Attending</div></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-serif text-red-500">{data.not_attending}</div><div className="text-dark/50 text-sm">Not Attending</div></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-3xl font-serif text-yellow-600">{data.pending}</div><div className="text-dark/50 text-sm">Pending</div></div>
      </div>
      {data.data?.map((r: any) => (
        <div key={r.id} className="glass rounded-xl p-4 mb-3">
          <div className="flex justify-between">
            <span className="font-medium text-dark">{r.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${r.status === 'attending' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
          </div>
          <p className="text-dark/50 text-sm mt-1">{r.attendee_count} guest(s) — {r.message}</p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════
export const SettingsPage: FC = () => {
  const coupleSlug = useCoupleSlug();
  const [settings, setSettings] = useState<Partial<Couple>>({});
  useEffect(() => { api.getCouple(coupleSlug).then(setSettings).catch(() => {}); }, [coupleSlug]);

  const handleSave = async () => {
    try { await api.adminUpdateCouple(coupleSlug, settings); toast.success('Settings saved'); } catch { toast.error('Failed to save'); }
  };

  const fields = [
    { key: 'groom_name', label: 'Groom Name' },
    { key: 'bride_name', label: 'Bride Name' },
    { key: 'quote', label: 'Quote' },
    { key: 'wedding_date', label: 'Wedding Date', type: 'date' },
    { key: 'wedding_time', label: 'Wedding Time', type: 'time' },
    { key: 'venue_name', label: 'Venue Name' },
    { key: 'venue_address', label: 'Venue Address' },
    { key: 'maps_url', label: 'Maps URL' },
    { key: 'maps_embed_url', label: 'Maps Embed URL' },
    { key: 'dress_code', label: 'Dress Code' },
    { key: 'video_url', label: 'Video URL' },
    { key: 'video_type', label: 'Video Type (youtube/vimeo)' },
    { key: 'music_url', label: 'Music URL' },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-dark mb-6">Wedding Settings</h1>
      <div className="glass rounded-2xl p-6 max-w-2xl">
        {fields.map((f) => (
          <div key={f.key} className="mb-4">
            <label className="block text-dark/70 text-sm mb-1">{f.label}</label>
            <input type={f.type || 'text'} value={(settings as any)[f.key] || ''}
              onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:border-gold" />
          </div>
        ))}
        <button onClick={handleSave} className="btn-gold w-full mt-4">Save Settings</button>
      </div>
    </div>
  );
};
