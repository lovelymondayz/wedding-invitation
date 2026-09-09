import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, Image, MapPin, MessageCircle, Gift } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const navItems = [
  { id: 'hero', icon: Home, label: 'Home' },
  { id: 'love-story', icon: Heart, label: 'Story' },
  { id: 'gallery', icon: Image, label: 'Gallery' },
  { id: 'map', icon: MapPin, label: 'Location' },
  { id: 'rsvp', icon: MessageCircle, label: 'RSVP' },
  { id: 'wishes', icon: MessageCircle, label: 'Wishes' },
  { id: 'gift', icon: Gift, label: 'Gift' },
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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-surface/80 backdrop-blur-sm border border-border rounded-full px-2 py-2 flex items-center gap-1 shadow-md"
    >
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className={`flex flex-col items-center px-3 py-1.5 rounded-full transition-all ${
            active === id ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'
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
