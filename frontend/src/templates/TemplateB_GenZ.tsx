import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { HeroSection, CountdownSection, WeddingInfoSection, LoveStorySection, ScheduleSection, GallerySection, RSVPSection, WishesSection, GiftSection, Footer } from '../components/sections';
import { useMusic } from '../hooks/useMusic';
import type { TemplateProps } from './types';

/**
 * Template B: Gen-Z Minimal
 * - White background, Inter sans-serif only
 * - Bold accent colors (indigo/orange)
 * - Instagram-story vibe, big photo hero
 * - No glassmorphism, clean spacing
 */
export const TemplateB_GenZ: FC<TemplateProps> = ({ data }) => {
  const { isPlaying, toggle, setMusicUrl } = useMusic();

  useEffect(() => {
    if (data.music?.url) setMusicUrl(data.music.url);
  }, [data.music]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Toaster position="top-center" />

      {data.music && (
        <button
          onClick={toggle}
          className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      )}

      {/* Hero - Full screen with big photo */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }} />
        
        {data.couple?.couple_photo_url && (
          <div className="absolute inset-0">
            <img src={data.couple.couple_photo_url} alt="" className="w-full h-full object-cover opacity-30" />
          </div>
        )}

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-[0.3em] text-xs md:text-sm mb-6 text-indigo-500 font-medium"
          >
            We're Getting Married
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            {data.couple?.groom_name || 'Alex'} & {data.couple?.bride_name || 'Sam'}
          </motion.h1>
          {data.couple?.wedding_date && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-500 font-light"
            >
              {new Date(data.couple.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </motion.p>
          )}
          {data.couple?.venue_name && (
            <p className="mt-2 text-gray-400 text-sm">{data.couple.venue_name}</p>
          )}
        </div>
      </section>

      {/* Countdown */}
      <CountdownSection countdown={data.countdown ?? undefined} />

      {/* Wedding Info */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">When & Where</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50">
              <p className="text-xs uppercase tracking-wider text-indigo-500 mb-2">Date</p>
              <p className="text-lg font-medium text-gray-900">
                {data.couple?.wedding_date ? new Date(data.couple.wedding_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBA'}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50">
              <p className="text-xs uppercase tracking-wider text-indigo-500 mb-2">Venue</p>
              <p className="text-lg font-medium text-gray-900">{data.couple?.venue_name || 'TBA'}</p>
              {data.couple?.venue_address && <p className="text-sm text-gray-500 mt-1">{data.couple.venue_address}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">Our Moments</h2>
          <GallerySection photos={data.gallery} />
        </div>
      </section>

      {/* RSVP */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Are You Coming?</h2>
          <p className="text-gray-500 mb-8">Let us know by {data.couple?.wedding_date ? new Date(data.couple.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'the wedding day'}</p>
          <RSVPSection />
        </div>
      </section>

      {/* Wishes */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">Wishes</h2>
          <WishesSection wishes={data.wishes} />
        </div>
      </section>

      {/* Gift */}
      {data.gifts.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Gift</h2>
            <GiftSection gifts={data.gifts} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-900 text-white/60 text-center text-sm">
        <p className="font-medium text-white mb-2">{data.couple?.groom_name} & {data.couple?.bride_name}</p>
        <p>Made with ❤️ on WeddingInv</p>
      </footer>
    </div>
  );
};
