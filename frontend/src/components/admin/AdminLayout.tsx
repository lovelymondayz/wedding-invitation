import { FC, useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../../api/services';
import type { Couple } from '../../api/types';

const sidebarItems = [
  { id: '', label: 'Overview', icon: '📊' },
  { id: 'guests', label: 'Guests', icon: '👥' },
  { id: 'rsvps', label: 'RSVPs', icon: '💌' },
  { id: 'wishes', label: 'Wishes', icon: '💬' },
  { id: 'gallery', label: 'Gallery', icon: '📷' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'love-story', label: 'Love Story', icon: '❤️' },
  { id: 'gift', label: 'Gift', icon: '🎁' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const AdminLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const { coupleSlug } = useParams<{ coupleSlug: string }>();
  const location = useLocation();
  const currentSection = location.pathname.split('/').pop() || '';
  const [couple, setCouple] = useState<Couple | null>(null);

  useEffect(() => {
    if (coupleSlug) {
      api.getCouple(coupleSlug).then(setCouple).catch(() => {});
    }
  }, [coupleSlug]);

  if (!token) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('couple_slug');
    window.location.href = '/admin/login';
  };

  const names = couple ? `${couple.groom_name} & ${couple.bride_name}` : 'Wedding';

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-cream/80 flex flex-col shrink-0">
        <div className="p-6 border-b border-cream/10">
          <a href="/" className="font-display text-lg text-cream hover:text-gold transition-colors">
            Wedding<span className="text-gold">Inv</span>
          </a>
          <p className="text-cream/50 text-xs mt-1 truncate">{names}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <a
              key={item.id}
              href={`/admin/${coupleSlug}/${item.id}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                (currentSection === item.id || (item.id === '' && currentSection === coupleSlug))
                  ? 'bg-gold/20 text-gold'
                  : 'hover:bg-cream/5'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-cream/10 space-y-1">
          <a
            href={`/${coupleSlug}`}
            target="_blank"
            className="flex items-center gap-3 px-4 py-2 text-sm text-cream/40 hover:text-cream/80"
          >
            👁 View Site
          </a>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-cream/40 hover:text-cream/80">
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
