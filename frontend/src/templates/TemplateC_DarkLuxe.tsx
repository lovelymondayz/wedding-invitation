import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { GallerySection, RSVPSection, WishesSection, CountdownSection } from '../components/sections';
import { MusicPlayer } from '../components/ui/MusicPlayer';
import { MusicEmbed } from '../components/ui/MusicEmbed';
import { useMusic } from '../hooks/useMusic';
import type { TemplateProps } from './types';

/**
 * Template C: Dark Luxe
 * - Dark (#111) background
 * - Gold serif text, cinematic sections
 * - Elegant and moody
 */
export const TemplateC_DarkLuxe: FC<TemplateProps> = ({ data }) => {
  const { isPlaying, volume, toggle, changeVolume, setMusicUrl, source } = useMusic();

  useEffect(() => {
    if (data.music?.url) setMusicUrl(data.music.url, data.music.source);
  }, [data.music]);

  return (
    <div className="min-h-screen bg-[#111] text-surface">
      <Toaster position="top-center" toastOptions={{ style: { background: '#222', color: '#fff', border: '1px solid #333' } }} />

      {data.music && source === 'direct' && (
        <MusicPlayer isPlaying={isPlaying} volume={volume} onToggle={toggle} onVolumeChange={changeVolume} />
      )}

      {data.music && source !== 'direct' && (
        <MusicEmbed url={data.music.url} source={source || 'direct'} title={data.music.title} />
      )}

      {/* Hero - Cinematic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {data.couple?.couple_photo_url && (
          <div className="absolute inset-0">
            <img src={data.couple.couple_photo_url} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-[#111]/60" />
          </div>
        )}

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-[0.5em] text-xs md:text-sm mb-6 text-amber-400/70 font-light"
          >
            Save the Date
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-surface mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {data.couple?.groom_name || 'Groom'}<span className="text-amber-400 italic"> & </span>{data.couple?.bride_name || 'Bride'}
          </motion.h1>
          {data.couple?.wedding_date && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-16 h-px bg-amber-400/40 mx-auto mb-6" />
              <p className="text-amber-400/80 font-light tracking-widest text-sm md:text-base">
                {new Date(data.couple.wedding_date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </motion.div>
          )}
          {data.couple?.venue_name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-surface/30 text-sm mt-4 tracking-wider uppercase"
            >
              {data.couple.venue_name}
            </motion.p>
          )}
        </div>
      </section>

      {/* Countdown - Minimal dark */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display text-surface mb-10">Counting Down</h2>
          <CountdownSection countdown={data.countdown ?? undefined} />
        </div>
      </section>

      {/* Wedding Info */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display text-surface mb-10">The Celebration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-surface/5 border border-white/10">
              <p className="text-xs uppercase tracking-wider text-amber-400/70 mb-3">When</p>
              <p className="text-xl font-display text-surface">
                {data.couple?.wedding_date ? new Date(data.couple.wedding_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBA'}
              </p>
              {data.couple?.wedding_time && <p className="text-surface/50 text-sm mt-1">at {data.couple.wedding_time}</p>}
            </div>
            <div className="p-6 rounded-xl bg-surface/5 border border-white/10">
              <p className="text-xs uppercase tracking-wider text-amber-400/70 mb-3">Where</p>
              <p className="text-xl font-display text-surface">{data.couple?.venue_name || 'TBA'}</p>
              {data.couple?.venue_address && <p className="text-surface/50 text-sm mt-1">{data.couple.venue_address}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {data.gallery.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display text-surface text-center mb-10">Gallery</h2>
            <GallerySection photos={data.gallery} />
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display text-surface mb-4">Join Us</h2>
          <p className="text-surface/40 mb-8">Your presence is the only gift we need</p>
          <RSVPSection />
        </div>
      </section>

      {/* Wishes */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display text-surface text-center mb-10">Wishes</h2>
          <WishesSection wishes={data.wishes} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5 text-center">
        <p className="text-surface/40 text-sm">
          <span className="text-amber-400/60 font-display">{data.couple?.groom_name}</span>
          {' & '}
          <span className="text-amber-400/60 font-display">{data.couple?.bride_name}</span>
        </p>
        <p className="text-surface/20 text-xs mt-2 tracking-widest uppercase">WeddingInv</p>
      </footer>
    </div>
  );
};
