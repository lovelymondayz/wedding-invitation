import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageSection, SectionTitle, GlassCard } from '../ui/PageSection';
import type { Couple, CountdownInfo } from '../../api/types';
import { submitRSVP, submitWish } from '../../api/services';

// ── Hero Section ──
export const HeroSection: FC<{ couple?: Couple }> = ({ couple }) => {
  const names = `${couple?.groom_name || 'John'} & ${couple?.bride_name || 'Jane'}`;

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5E6E0] via-[#FFF8F0] to-[#F5E6E0]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232C1810'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Decorative florals */}
      <div className="absolute top-1/4 left-[5%] text-gold/10 text-[12rem] font-display select-none animate-float" style={{ animationDelay: '0s' }}>❀</div>
      <div className="absolute bottom-1/4 right-[5%] text-gold/10 text-[10rem] font-display select-none animate-float" style={{ animationDelay: '2s' }}>❀</div>
      <div className="absolute top-[15%] right-[15%] text-gold/5 text-[8rem] font-display select-none animate-float" style={{ animationDelay: '4s' }}>✦</div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="ornament-divider mb-8">
            <span className="text-gold/40 text-sm tracking-[0.4em] uppercase font-light">✦ ✦ ✦</span>
          </div>
          <p className="text-dark/40 uppercase tracking-[0.35em] text-xs md:text-sm mb-8 font-light">
            We're Getting Married
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-dark mb-6 leading-tight"
        >
          {names}
        </motion.h1>

        {couple?.wedding_date && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="w-12 h-px bg-gold/40 mx-auto mb-6" />
            <p className="text-gold font-light text-lg md:text-xl tracking-wider">
              {new Date(couple.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </motion.div>
        )}

        {couple?.quote && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="font-script italic text-xl md:text-2xl text-dark/50 max-w-xl mx-auto mt-8 leading-relaxed"
          >
            "{couple.quote}"
          </motion.p>
        )}

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-12 border border-dark/10 rounded-full mx-auto flex justify-center pt-3"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-gold/60 rounded-full"
            />
          </motion.div>
          <p className="text-dark/20 text-xs mt-3 font-light tracking-wider">SCROLL</p>
        </motion.div>
      </div>
    </section>
  );
};

// ── Countdown Section ──
export const CountdownSection: FC<{ countdown?: CountdownInfo }> = ({ countdown }) => {
  const targetDate = countdown?.wedding_date;
  const targetTime = countdown?.wedding_time;
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const d = targetTime ? `${targetDate}T${targetTime}` : targetDate;
      const diff = new Date(d).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const i = setInterval(calc, 1000);
    return () => clearInterval(i);
  }, [targetDate, targetTime]);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <PageSection id="countdown" alternate>
      <SectionTitle subtitle="Counting down to our special day">Save The Date</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
        {units.map(({ label, value }) => (
          <motion.div
            key={label}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl text-center py-8 px-4 transition-shadow hover:shadow-lg"
          >
            <div className="font-display text-5xl md:text-6xl lg:text-7xl text-gold mb-3 tabular-nums tracking-tight">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-dark/40 text-xs md:text-sm uppercase tracking-[0.2em] font-light">{label}</div>
          </motion.div>
        ))}
      </div>
    </PageSection>
  );
};

// ── Wedding Info Section ──
export const WeddingInfoSection: FC<{ couple?: Couple }> = ({ couple }) => {
  if (!couple) return null;
  const info = [
    { icon: '📅', title: 'Date', value: couple.wedding_date ? new Date(couple.wedding_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD' },
    { icon: '⏰', title: 'Time', value: couple.wedding_time ? couple.wedding_time.substring(0,5) : 'TBD' },
    { icon: '📍', title: 'Venue', value: couple.venue_name || 'TBD' },
    { icon: '🗺️', title: 'Address', value: couple.venue_address || 'TBD' },
    { icon: '👔', title: 'Dress Code', value: couple.dress_code || 'Formal' },
    { icon: '🎉', title: 'Reception', value: 'Dinner reception to follow ceremony' },
  ];

  return (
    <PageSection id="wedding-info">
      <SectionTitle subtitle="Details about our wedding celebration">Wedding Information</SectionTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {info.map(({ icon, title, value }) => (
          <GlassCard key={title} hover>
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="font-display text-xl text-dark mb-2">{title}</h3>
            <p className="text-dark/50 text-sm leading-relaxed">{value}</p>
          </GlassCard>
        ))}
      </div>
    </PageSection>
  );
};

// ── Love Story Section ──
export const LoveStorySection: FC<{ events?: Array<{ year: string; title: string; description: string; icon: string }> }> = ({ events = [] }) => {
  if (events.length === 0) return null;
  return (
    <PageSection id="love-story" alternate>
      <SectionTitle subtitle="Our journey together">Love Story</SectionTitle>
      <div className="max-w-3xl mx-auto relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-gold/5 via-gold/20 to-gold/5 -translate-x-1/2 hidden md:block" />
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            className={`relative flex flex-col md:flex-row items-center mb-16 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
          >
            {/* Content */}
            <div className={`w-full md:w-[42%] ${i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
              <GlassCard hover>
                <span className="text-gold font-display text-3xl md:text-4xl block mb-1">{event.year}</span>
                <h3 className="font-display text-xl md:text-2xl text-dark mb-2">{event.title}</h3>
                <p className="text-dark/50 text-sm leading-relaxed">{event.description}</p>
              </GlassCard>
            </div>
            {/* Center dot */}
            <div className="my-4 md:my-0 md:w-[16%] flex justify-center z-10">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-gold/20 flex items-center justify-center text-xl shadow-sm">
                {event.icon}
              </div>
            </div>
            {/* Spacer */}
            <div className="hidden md:block md:w-[42%]" />
          </motion.div>
        ))}
      </div>
    </PageSection>
  );
};

// ── Schedule Section ──
export const ScheduleSection: FC<{ events?: Array<{ event_time: string; title: string; description: string }> }> = ({ events = [] }) => {
  if (events.length === 0) return null;
  return (
    <PageSection id="schedule">
      <SectionTitle subtitle="What to expect on our wedding day">Event Schedule</SectionTitle>
      <div className="max-w-xl mx-auto">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-5 mb-8 last:mb-0"
          >
            <div className="text-gold font-display text-xl md:text-2xl w-16 text-right shrink-0 pt-1">
              {event.event_time?.substring(0, 5)}
            </div>
            <div className="flex flex-col items-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-gold/30 border-2 border-gold" />
              {i < events.length - 1 && <div className="w-px flex-1 bg-gold/15 my-1 min-h-[24px]" />}
            </div>
            <GlassCard hover className="flex-1 !p-5">
              <h3 className="font-display text-lg text-dark">{event.title}</h3>
              {event.description && <p className="text-dark/45 text-sm mt-2 leading-relaxed">{event.description}</p>}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageSection>
  );
};

// ── Map Section ──
export const MapSection: FC<{ couple?: Couple }> = ({ couple }) => {
  const address = couple?.venue_address || '';
  const mapsUrl = couple?.maps_url || `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  return (
    <PageSection id="map" alternate>
      <SectionTitle subtitle="Find your way to our celebration">Location</SectionTitle>
      <div className="max-w-4xl mx-auto">
        {couple?.maps_embed_url ? (
          <div className="rounded-2xl overflow-hidden shadow-xl mb-8 ring-1 ring-gold/10">
            <iframe src={couple.maps_embed_url} width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Wedding Venue Map" />
          </div>
        ) : (
          <GlassCard className="h-80 flex items-center justify-center mb-8">
            <div className="text-center">
              <p className="text-5xl mb-4">📍</p>
              <p className="text-dark/30 font-light">Map will be available soon</p>
            </div>
          </GlassCard>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-gold text-sm">
            Open in Google Maps
          </a>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
            Navigate
          </a>
          <button onClick={() => { navigator.clipboard.writeText(address); }} className="btn-outline text-sm">
            Copy Address
          </button>
        </div>
      </div>
    </PageSection>
  );
};

// ── Gallery Section ──
export const GallerySection: FC<{ photos?: Array<{ url: string; caption: string }> }> = ({ photos = [] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  if (photos.length === 0) return null;
  return (
    <PageSection id="gallery">
      <SectionTitle subtitle="Moments captured together">Gallery</SectionTitle>
      <div className="masonry max-w-5xl mx-auto">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="masonry-item cursor-pointer group"
            onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}
          >
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gold/10 to-soft-pink/50 aspect-[4/3] flex items-center justify-center ring-1 ring-gold/10 group-hover:ring-gold/30 transition-all">
              {photo.url.startsWith('http') ? (
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              ) : (
                <span className="text-5xl opacity-30">📷</span>
              )}
            </div>
            {photo.caption && <p className="text-dark/40 text-xs mt-2 text-center font-light">{photo.caption}</p>}
          </motion.div>
        ))}
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-6 right-6 text-white/60 hover:text-white text-4xl transition-colors z-10" onClick={() => setLightboxOpen(false)}>✕</button>
          <button className="absolute left-4 md:left-8 text-white/60 hover:text-white text-4xl transition-colors" onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex - 1 + photos.length) % photos.length); }}>‹</button>
          <div className="max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img src={photos[currentIndex]?.url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            {photos[currentIndex]?.caption && <p className="text-white/60 text-center mt-4 text-sm font-light">{photos[currentIndex].caption}</p>}
          </div>
          <button className="absolute right-4 md:right-8 text-white/60 hover:text-white text-4xl transition-colors" onClick={(e) => { e.stopPropagation(); setCurrentIndex((currentIndex + 1) % photos.length); }}>›</button>
        </div>
      )}
    </PageSection>
  );
};

// ── Video Section ──
export const VideoSection: FC<{ videoUrl?: string; videoType?: string }> = ({ videoUrl, videoType }) => {
  if (!videoUrl) return null;
  const getEmbedUrl = () => {
    if (videoType === 'youtube') {
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }
    if (videoType === 'vimeo') {
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : null;
    }
    return null;
  };
  const embedUrl = getEmbedUrl();
  return (
    <PageSection id="video" alternate>
      <SectionTitle subtitle="Our pre-wedding film">Video</SectionTitle>
      <div className="max-w-4xl mx-auto">
        {embedUrl ? (
          <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video ring-1 ring-gold/10">
            <iframe src={embedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen title="Wedding Video" />
          </div>
        ) : (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mx-auto w-fit">
            Watch Our Video
          </a>
        )}
      </div>
    </PageSection>
  );
};

// ── RSVP Section ──
export const RSVPSection: FC<{ coupleSlug?: string }> = ({ coupleSlug = '' }) => {
  const [form, setForm] = useState<{ name: string; status: 'attending' | 'not_attending'; attendee_count: number; message: string }>({ name: '', status: 'attending', attendee_count: 1, message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await submitRSVP(coupleSlug, form);
      setSubmitted(true);
    } catch { alert('Failed to submit RSVP. Please try again.'); }
    setLoading(false);
  };

  if (submitted) {
    return (
      <PageSection id="rsvp">
        <div className="text-center py-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-7xl mb-6">💌</motion.div>
          <h2 className="font-display text-4xl text-dark mb-4">Thank You!</h2>
          <p className="text-dark/50 font-light max-w-md mx-auto">Your RSVP has been received. We can't wait to celebrate with you!</p>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection id="rsvp" alternate>
      <SectionTitle subtitle="Please let us know if you can join us">RSVP</SectionTitle>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <GlassCard>
          <div className="mb-5">
            <label className="block text-dark/60 text-sm mb-2 font-medium">Your Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border border-gold/15 bg-cream/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all text-dark placeholder:text-dark/25" placeholder="Enter your name" />
          </div>
          <div className="mb-5">
            <label className="block text-dark/60 text-sm mb-3 font-medium">Will you attend? *</label>
            <div className="flex gap-4">
              {['attending', 'not_attending'].map((s) => (
                <label key={s} className={`flex items-center gap-3 cursor-pointer px-5 py-3 rounded-xl border transition-all ${form.status === s ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'attending' | 'not_attending' })} className="accent-gold w-4 h-4" />
                  <span className="text-dark/70 text-sm">{s === 'attending' ? '✨ Will Attend' : 'Cannot Attend'}</span>
                </label>
              ))}
            </div>
          </div>
          {form.status === 'attending' && (
            <div className="mb-5">
              <label className="block text-dark/60 text-sm mb-2 font-medium">Number of Guests</label>
              <input type="number" min="1" max="10" value={form.attendee_count}
                onChange={(e) => setForm({ ...form, attendee_count: parseInt(e.target.value) })}
                className="w-full px-4 py-3.5 rounded-xl border border-gold/15 bg-cream/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all" />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-dark/60 text-sm mb-2 font-medium">Message (optional)</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3}
              className="w-full px-4 py-3.5 rounded-xl border border-gold/15 bg-cream/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all resize-none text-dark placeholder:text-dark/25" placeholder="Leave a message for the couple..." />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full text-base">
            {loading ? '⌛ Submitting...' : '💌 Submit RSVP'}
          </button>
        </GlassCard>
      </form>
    </PageSection>
  );
};

// ── Wishes Section ──
export const WishesSection: FC<{ wishes?: Array<{ guest_name: string; message: string; created_at: string }>; coupleSlug?: string }> = ({ wishes = [], coupleSlug = '' }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitWish(coupleSlug, { guest_name: name, message });
      setSubmitted(true); setName(''); setMessage('');
    } catch { alert('Failed to submit wish.'); }
  };

  return (
    <PageSection id="wishes">
      <SectionTitle subtitle="Leave your wishes for the couple">Wedding Wishes</SectionTitle>
      <div className="max-w-xl mx-auto mb-10 space-y-3">
        {wishes.slice(0, 10).map((wish, i) => (
          <GlassCard key={i} hover className="!p-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-display text-dark text-lg">{wish.guest_name}</span>
              <span className="text-dark/25 text-xs">{new Date(wish.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-dark/55 text-sm leading-relaxed">{wish.message}</p>
          </GlassCard>
        ))}
      </div>
      {submitted && <p className="text-center text-gold mb-6 font-light">Thank you for your beautiful wishes! 💕</p>}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <GlassCard>
          <div className="mb-4">
            <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gold/15 bg-cream/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all placeholder:text-dark/25" />
          </div>
          <div className="mb-5">
            <textarea placeholder="Your wishes & prayers..." required value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              className="w-full px-4 py-3.5 rounded-xl border border-gold/15 bg-cream/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all resize-none placeholder:text-dark/25" />
          </div>
          <button type="submit" className="btn-gold w-full">Send Wishes 💕</button>
        </GlassCard>
      </form>
    </PageSection>
  );
};

// ── Gift Section ──
export const GiftSection: FC<{ gifts?: Array<{ bank_name: string; account_number: string; account_name: string; qris_image_url: string }> }> = ({ gifts = [] }) => {
  const [copied, setCopied] = useState('');
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 2000);
  };
  if (gifts.length === 0) return null;
  return (
    <PageSection id="gift" alternate>
      <SectionTitle subtitle="Your presence is the greatest gift, but if you wish to give">Wedding Gift</SectionTitle>
      <div className="max-w-lg mx-auto space-y-4">
        {gifts.map((gift, i) => (
          <GlassCard key={i} hover>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-dark">{gift.bank_name}</h3>
                <p className="text-gold font-mono text-lg tracking-wider mt-1">{gift.account_number}</p>
                <p className="text-dark/40 text-sm mt-1">a.n. {gift.account_name}</p>
              </div>
              <button onClick={() => copyToClipboard(gift.account_number, gift.bank_name)}
                className="btn-outline text-xs shrink-0">
                {copied === gift.bank_name ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </GlassCard>
        ))}
        {gifts.some((g) => g.qris_image_url) && (
          <GlassCard className="text-center">
            <p className="text-dark/50 text-sm mb-4 font-light">Scan QRIS to send gift</p>
            <div className="bg-white rounded-2xl p-4 inline-block shadow-sm">
              {gifts.find(g => g.qris_image_url)?.qris_image_url?.startsWith('http') ? (
                <img src={gifts.find(g => g.qris_image_url)!.qris_image_url} alt="QRIS" className="w-48 h-48 object-contain rounded-lg" />
              ) : (
                <div className="w-48 h-48 bg-gradient-to-br from-gold/5 to-soft-pink rounded-lg flex items-center justify-center">
                  <span className="text-5xl opacity-30">📱</span>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </PageSection>
  );
};

// ── Footer ──
export const Footer: FC<{ couple?: Couple }> = ({ couple }) => (
  <footer className="text-center py-16 px-4 bg-[#2C1810] text-cream/60">
    <div className="ornament-divider mb-8">
      <span className="text-gold/30 text-xs tracking-[0.3em] uppercase">✦ ✦ ✦</span>
    </div>
    <p className="font-display text-3xl md:text-4xl text-cream mb-3">
      {couple?.groom_name || 'John'} & {couple?.bride_name || 'Jane'}
    </p>
    <div className="w-12 h-px bg-gold/30 mx-auto my-4" />
    <p className="text-cream/40 text-sm font-light">Thank you for being part of our love story</p>
    <p className="mt-6 text-cream/25 text-xs">Made with ❤️</p>
  </footer>
);
