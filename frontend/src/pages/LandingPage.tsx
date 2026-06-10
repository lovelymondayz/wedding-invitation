import { FC, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { InvitePopup } from '../components/ui/InvitePopup';
import { FloatingNav } from '../components/ui/FloatingNav';
import { HeroSection, CountdownSection, WeddingInfoSection, LoveStorySection, ScheduleSection, MapSection, GallerySection, VideoSection, RSVPSection, WishesSection, GiftSection, Footer } from '../components/sections';
import { useCountdown } from '../hooks/useCountdown';
import { useMusic } from '../hooks/useMusic';
import * as api from '../api/services';
import type { Couple, CountdownInfo, LoveStoryEvent, ScheduleEvent, GalleryPhoto, Wish, GiftInfo, MusicTrack, Guest } from '../api/types';

interface LandingPageData {
  couple: Couple | null;
  countdown: CountdownInfo | null;
  loveStory: LoveStoryEvent[];
  schedule: ScheduleEvent[];
  gallery: GalleryPhoto[];
  wishes: Wish[];
  gifts: GiftInfo[];
  music: MusicTrack | null;
}

export const LandingPage: FC = () => {
  const { coupleSlug } = useParams<{ coupleSlug: string }>();
  const [data, setData] = useState<LandingPageData>({
    couple: null,
    countdown: null,
    loveStory: [],
    schedule: [],
    gallery: [],
    wishes: [],
    gifts: [],
    music: null,
  });
  const [loading, setLoading] = useState(true);

  const { isPlaying, volume, toggle, changeVolume, setMusicUrl } = useMusic();

  useEffect(() => {
    const slug = coupleSlug || 'john-jane-a0eebc99';
    const fetchAll = async () => {
      try {
        const [c, cd, ls, sc, g, w, gi, m] = await Promise.all([
          api.getCouple(slug).catch(() => null),
          api.getCountdown(slug).catch(() => null),
          api.getLoveStory(slug).catch(() => []),
          api.getSchedule(slug).catch(() => []),
          api.getGallery(slug).catch(() => []),
          api.getWishes(slug).catch(() => []),
          api.getGift(slug).catch(() => []),
          api.getMusic(slug).catch(() => null),
        ]);
        setData({ couple: c, countdown: cd, loveStory: ls, schedule: sc, gallery: g, wishes: w, gifts: gi, music: m });
        if (m?.url) { setMusicUrl(m.url); }
      } catch (e) {
        console.error('Failed to load data', e);
      }
      setLoading(false);
    };
    fetchAll();
  }, [coupleSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full"
        />
      </div>
    );
  }

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
      <RSVPSection coupleSlug={coupleSlug || ''} />
      <WishesSection wishes={data.wishes} coupleSlug={coupleSlug || ''} />
      <GiftSection gifts={data.gifts} />
      <Footer couple={data.couple ?? undefined} />
      <FloatingNav />
    </div>
  );
};

export const InvitePage: FC = () => {
  const { coupleSlug, guestSlug } = useParams<{ coupleSlug: string; guestSlug: string }>();
  const [searchParams] = useSearchParams();
  const queryName = searchParams.get('to');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    if (coupleSlug && guestSlug) {
      api.getGuest(coupleSlug, guestSlug).then(setGuest).catch(() => {});
    }
  }, [coupleSlug, guestSlug]);

  const guestName = guest?.full_name || queryName || 'Beloved Guest';

  const handleOpen = async () => {
    if (coupleSlug && guestSlug) {
      try { await api.markOpened(coupleSlug, guestSlug); } catch {}
    }
    setShowPopup(false);
  };

  if (showPopup && (guestSlug || queryName)) {
    return <InvitePopup guestName={guestName} onOpen={handleOpen} />;
  }

  return <LandingPage />;
};
