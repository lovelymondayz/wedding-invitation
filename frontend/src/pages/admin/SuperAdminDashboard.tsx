import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../api/services';

export const SuperAdminDashboard: FC = () => {
  const [couples, setCouples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');
  const role = localStorage.getItem('admin_role');

  useEffect(() => {
    if (!token || role !== 'super') {
      navigate('/admin/login');
      return;
    }
    api.adminGetAllCouples()
      .then(setCouples)
      .catch(() => toast.error('Failed to load couples'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full" />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    navigate('/admin/login');
  };

  const handleDelete = async (couple: any) => {
    if (!confirm(`Delete ${couple.groom_name} & ${couple.bride_name}'s invitation?\n\nThis will permanently remove all guests, RSVPs, wishes, gallery, and settings.`)) return;
    try {
      await api.adminDeleteCouple(couple.slug);
      toast.success('Couple deleted');
      setCouples(couples.filter(c => c.id !== couple.id));
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <a href="/" className="font-display text-lg md:text-xl text-dark">
              Wedding<span className="text-gold">Inv</span>
            </a>
            <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full font-medium">Super Admin</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-dark/40 text-xs md:text-sm">admin</span>
            <button onClick={handleLogout} className="text-dark/40 text-xs md:text-sm hover:text-dark">Logout</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl text-dark mb-1 md:mb-2">Dashboard</h1>
          <p className="text-dark/40 mb-6 md:mb-8 text-sm md:text-base">All wedding invitations</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
            <div className="glass rounded-xl p-4 md:p-5">
              <div className="text-2xl md:text-3xl font-serif text-dark">{couples.length}</div>
              <div className="text-dark/40 text-xs md:text-sm">Total Couples</div>
            </div>
            <div className="glass rounded-xl p-4 md:p-5">
              <div className="text-2xl md:text-3xl font-serif text-dark">{couples.reduce((s, c) => s + c.guest_count, 0)}</div>
              <div className="text-dark/40 text-xs md:text-sm">Total Guests</div>
            </div>
            <div className="glass rounded-xl p-4 md:p-5">
              <div className="text-2xl md:text-3xl font-serif text-green-600">{couples.reduce((s, c) => s + c.attending_count, 0)}</div>
              <div className="text-dark/40 text-xs md:text-sm">Attending</div>
            </div>
            <div className="glass rounded-xl p-4 md:p-5">
              <div className="text-2xl md:text-3xl font-serif text-dark">{couples.filter(c => c.is_published).length}</div>
              <div className="text-dark/40 text-xs md:text-sm">Published</div>
            </div>
          </div>

          {/* Couples list */}
          {couples.length === 0 ? (
            <div className="glass rounded-2xl p-8 md:p-12 text-center">
              <div className="text-4xl md:text-5xl mb-4">💍</div>
              <p className="text-dark/40 text-sm md:text-base">No couples yet. Create the first invitation from the homepage.</p>
              <a href="/" className="btn-gold inline-block mt-6">Go to Homepage</a>
            </div>
          ) : (
            <div className="space-y-3">
              {couples.map((couple, i) => (
                <motion.div
                  key={couple.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-xl p-4 md:p-5 hover:border-gold/30 transition-colors"
                >
                  {/* Top row: avatar + names */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-display text-base md:text-lg shrink-0">
                      {couple.groom_name[0]}{couple.bride_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-dark text-base md:text-lg truncate">
                          {couple.groom_name} & {couple.bride_name}
                        </span>
                        {couple.is_published && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full shrink-0">Live</span>
                        )}
                      </div>
                      <div className="text-dark/40 text-xs md:text-sm truncate">
                        {couple.wedding_date && new Date(couple.wedding_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {couple.venue_name && ` · ${couple.venue_name}`}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: stats + actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4 text-xs md:text-sm">
                      <span className="text-dark/50">{couple.guests_count} guests</span>
                      <span className="text-green-600">{couple.attending_count} attending</span>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      <a
                        href={`/${couple.slug}`}
                        target="_blank"
                        className="px-2.5 md:px-3 py-1.5 rounded-lg border border-gold/20 text-dark/60 text-xs md:text-sm hover:border-gold/40 hover:text-dark transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => navigate(`/admin/${couple.slug}`)}
                        className="px-2.5 md:px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-xs md:text-sm hover:bg-gold/20 transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => handleDelete(couple)}
                        className="px-2.5 md:px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs md:text-sm hover:bg-red-100 transition-colors"
                        title="Delete this couple"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};
