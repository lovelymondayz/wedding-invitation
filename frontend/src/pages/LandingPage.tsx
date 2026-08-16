import { FC, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InvitePopup } from '../components/ui/InvitePopup';
import * as api from '../api/services';
import type { Couple, CountdownInfo, LoveStoryEvent, ScheduleEvent, GalleryPhoto, Wish, GiftInfo, MusicTrack, Guest } from '../api/types';
import { getTemplate } from '../templates/registry';
import type { TemplateProps } from '../templates/types';

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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const slug = coupleSlug || '';
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
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
        if (!c) {
          setNotFound(true);
        } else {
          setData({ couple: c, countdown: cd, loveStory: ls, schedule: sc, gallery: g, wishes: w, gifts: gi, music: m });
        }
      } catch (e) {
        console.error('Failed to load data', e);
        setNotFound(true);
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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="font-display text-3xl text-dark mb-4">Page Not Found</h1>
          <p className="text-dark/50 mb-8">The wedding page you're looking for doesn't exist. The link may be incorrect or the invitation may have been removed.</p>
          <a href="/" className="btn-gold">← Back to Home</a>
        </div>
      </div>
    );
  }

  // Dynamic template dispatch
  const templateId = data.couple?.template_id || 1;
  const Template = getTemplate(templateId).component;

  return <Template data={data} />;
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
