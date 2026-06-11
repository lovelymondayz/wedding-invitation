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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const role = localStorage.getItem('admin_role');
  const isSuper = role === 'super';

  const names = couple ? `${couple.groom_name} & ${couple.bride_name}` : 'Wedding';

  const navItems = sidebarItems.map((item) => ({
    ...item,
    href: `/admin/${coupleSlug}/${item.id}`,
    active: currentSection === item.id || (item.id === '' && currentSection === coupleSlug),
  }));

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark text-cream/80 flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-6 border-b border-cream/10">
          <a href="/" className="font-display text-lg text-cream hover:text-gold transition-colors">
            Wedding<span className="text-gold">Inv</span>
          </a>
          {isSuper && <span className="text-gold text-xs ml-1">⚡</span>}
          <p className="text-cream/50 text-xs mt-1 truncate">{names}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isSuper && (
            <a
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gold/70 hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <span>⚡</span>
              <span>All Couples</span>
            </a>
          )}
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
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

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-dark text-cream">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <a href="/" className="font-display text-base text-cream">
              Wedding<span className="text-gold">Inv</span>
            </a>
            {isSuper && <span className="text-gold text-xs">⚡</span>}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-cream/80 p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-t border-cream/10 max-h-[60vh] overflow-y-auto">
            <nav className="p-2 space-y-0.5">
              {isSuper && (
                <a
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gold/70 hover:bg-gold/10"
                >
                  <span>⚡</span><span>All Couples</span>
                </a>
              )}
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
                    item.active ? 'bg-gold/20 text-gold' : 'text-cream/70 hover:bg-cream/5'
                  }`}
                >
                  <span>{item.icon}</span><span>{item.label}</span>
                </a>
              ))}
            </nav>
            <div className="border-t border-cream/10 p-2 space-y-0.5">
              <a
                href={`/${coupleSlug}`}
                target="_blank"
                className="flex items-center gap-3 px-4 py-2 text-sm text-cream/40"
              >
                👁 View Site
              </a>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-cream/40">
                ← Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark border-t border-cream/10 z-50">
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.slice(0, 5).map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg min-w-0 ${
                item.active ? 'text-gold' : 'text-cream/50'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] truncate max-w-[60px]">{item.label}</span>
            </a>
          ))}
          {/* More button for remaining items */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg text-cream/50"
          >
            <span className="text-lg leading-none">⋯</span>
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
