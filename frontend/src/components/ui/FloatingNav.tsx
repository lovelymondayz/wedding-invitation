import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaHeart, FaImage, FaMapMarkerAlt, FaCommentDots, FaGift } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const navItems = [
  { id: 'hero', icon: FaHome, label: 'Home' },
  { id: 'love-story', icon: FaHeart, label: 'Story' },
  { id: 'gallery', icon: FaImage, label: 'Gallery' },
  { id: 'map', icon: FaMapMarkerAlt, label: 'Location' },
  { id: 'rsvp', icon: FaCommentDots, label: 'RSVP' },
  { id: 'wishes', icon: FaCommentDots, label: 'Wishes' },
  { id: 'gift', icon: FaGift, label: 'Gift' },
];

export const FloatingNav: FC = () => {
  const [active, setActive] = useState('hero');
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActive(id);
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 glass rounded-full px-2 py-2 flex items-center gap-1 shadow-lg"
    >
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className={`flex flex-col items-center px-3 py-1.5 rounded-full transition-all ${
            active === id ? 'bg-gold/20 text-gold' : 'text-dark/40 hover:text-dark/70'
          }`}
          title={label}
        >
          <Icon size={16} />
          <span className="text-[10px] mt-0.5 hidden md:block">{label}</span>
        </button>
      ))}
    </motion.div>
  );
};
