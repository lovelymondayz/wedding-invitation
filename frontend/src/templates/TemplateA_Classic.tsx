import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FloatingNav } from '../components/ui/FloatingNav';
import { MusicPlayer } from '../components/ui/MusicPlayer';
import { MusicEmbed } from '../components/ui/MusicEmbed';
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
  const { isPlaying, volume, toggle, changeVolume, setMusicUrl, source } = useMusic();

  useEffect(() => {
    if (data.music?.url) setMusicUrl(data.music.url, data.music.source);
  }, [data.music]);

  return (
    <div className="min-h-screen bg-cream">
      <Toaster position="top-center" toastOptions={{ style: { background: '#FFF8F0', color: '#2C1810' } }} />

      {data.music && source === 'direct' && (
        <MusicPlayer isPlaying={isPlaying} volume={volume} onToggle={toggle} onVolumeChange={changeVolume} />
      )}

      {data.music && source !== 'direct' && (
        <MusicEmbed url={data.music.url} source={source || 'direct'} title={data.music.title} />
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
