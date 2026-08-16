import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FloatingNav } from '../components/ui/FloatingNav';
import { HeroSection, CountdownSection, WeddingInfoSection, LoveStorySection, ScheduleSection, MapSection, GallerySection, VideoSection, RSVPSection, WishesSection, GiftSection, Footer } from '../components/sections';
import { useMusic } from '../hooks/useMusic';
import type { TemplateProps } from './types';

/**
 * Template A: Classic Elegance
 * - Cream/gold/dark palette
 * - Glassmorphism cards
 * - Playfair Display serif headings
 */
export const TemplateA_Classic: FC<TemplateProps> = ({ data }) => {
  const { isPlaying, toggle, setMusicUrl } = useMusic();

  useEffect(() => {
    if (data.music?.url) setMusicUrl(data.music.url);
  }, [data.music]);

  return (
    <div className="min-h-screen bg-cream">
      <Toaster position="top-center" toastOptions={{ style: { background: '#FFF8F0', color: '#2C1810' } }} />

      {data.music && (
        <button
          onClick={toggle}
          className="fixed top-4 right-4 z-40 glass rounded-full w-10 h-10 flex items-center justify-center text-gold hover:bg-gold/10"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      )}

      <HeroSection couple={data.couple ?? undefined} />
      <CountdownSection countdown={data.countdown ?? undefined} />
      <WeddingInfoSection couple={data.couple ?? undefined} />
      <LoveStorySection events={data.loveStory} />
      <ScheduleSection events={data.schedule} />
      <GallerySection photos={data.gallery} />
      {(data.couple?.video_url) && <VideoSection videoUrl={data.couple.video_url} videoType={data.couple.video_type} />}
      <MapSection couple={data.couple ?? undefined} />
      <RSVPSection />
      <WishesSection wishes={data.wishes} />
      <GiftSection gifts={data.gifts} />
      <Footer couple={data.couple ?? undefined} />
      <FloatingNav />
    </div>
  );
};
