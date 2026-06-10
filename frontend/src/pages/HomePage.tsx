import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../api/services';
import type { CreateCoupleResponse } from '../api/types';

export const HomePage: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    groom_name: '',
    bride_name: '',
    wedding_date: '',
    wedding_time: '',
    venue_name: '',
    venue_address: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: CreateCoupleResponse = await api.createCouple(form);
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('couple_slug', res.slug);
      localStorage.setItem('admin_role', res.role);
      toast.success('Wedding invitation created!');
      // Redirect to their new site
      window.location.href = `/${res.slug}`;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create invitation');
    }
    setLoading(false);
  };

  const features = [
    { icon: '💌', title: 'Digital Invitations', desc: 'Beautiful personalized invitation pages for every guest' },
    { icon: '✅', title: 'RSVP Management', desc: 'Track attendance, meal preferences, and guest counts' },
    { icon: '💬', title: 'Guest Wishes', desc: 'Let guests leave heartfelt messages on your wall' },
    { icon: '📷', title: 'Photo Gallery', desc: 'Share your favorite moments in a stunning gallery' },
    { icon: '🎵', title: 'Background Music', desc: 'Set the mood with your favorite song' },
    { icon: '🎁', title: 'Gift Registry', desc: 'Receive gifts via bank transfer or e-wallet' },
    { icon: '📅', title: 'Event Schedule', desc: 'Keep guests informed with timeline & venue details' },
    { icon: '❤️', title: 'Love Story', desc: 'Share your journey together with a beautiful timeline' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-display text-2xl text-dark">
            Wedding<span className="text-gold">Inv</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/admin/login" className="text-dark/60 text-sm hover:text-dark transition-colors">
              Admin Login
            </a>
            <button onClick={() => setShowForm(true)} className="btn-gold text-sm !py-2 !px-5">
              Create Invitation
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5E6E0] via-[#FFF8F0] to-[#F5E6E0]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232C1810'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-[8%] text-gold/10 text-[15rem] font-display select-none animate-float">❀</div>
        <div className="absolute bottom-1/3 right-[8%] text-gold/10 text-[12rem] font-display select-none animate-float" style={{ animationDelay: '3s' }}>❀</div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="ornament-divider mb-8">
              <span className="text-gold/40 text-sm tracking-[0.4em] uppercase">✦ ✦ ✦</span>
            </div>
            <p className="text-dark/40 uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-light">
              Create Your Dream Wedding Invitation
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-dark mb-6 leading-tight"
          >
            Beautiful Invitations,<br />
            <span className="text-gold">Unforgettable Moments</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-dark/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          >
            Create stunning, personalized wedding invitations in minutes. 
            Manage RSVPs, share your love story, and collect wishes — all in one beautiful place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button onClick={() => setShowForm(true)} className="btn-gold text-lg !py-4 !px-10">
              Get Started — It's Free
            </button>
            <a href="#features" className="btn-outline text-lg !py-4 !px-10">
              See Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl text-dark mb-16">Three Simple Steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Fill in Your Details', desc: 'Enter the bride & groom names, wedding date, and venue. Takes less than 2 minutes.' },
              { step: '02', title: 'Get Your Unique Link', desc: 'Instantly receive a beautiful wedding page with a unique URL for your celebration.' },
              { step: '03', title: 'Share with Guests', desc: 'Share the link with guests. They can view details, RSVP, and leave wishes.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-8 glass-hover"
              >
                <div className="font-display text-5xl text-gold/30 mb-4">{item.step}</div>
                <h3 className="font-serif text-xl text-dark mb-3">{item.title}</h3>
                <p className="text-dark/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 section-alt">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">Features</p>
            <h2 className="font-display text-4xl md:text-5xl text-dark mb-4">Everything You Need</h2>
            <p className="text-dark/50 max-w-xl mx-auto">A complete wedding invitation platform with all the features to make your special day unforgettable.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-6 glass-hover text-center"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-serif text-dark text-lg mb-2">{f.title}</h3>
                <p className="text-dark/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl text-dark mb-6">Ready to Create Your Invitation?</h2>
            <p className="text-dark/50 text-lg mb-10">Join couples who trust us for their most important day.</p>
            <button onClick={() => setShowForm(true)} className="btn-gold text-lg !py-4 !px-12">
              Create Your Invitation Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gold/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl text-dark">
            Wedding<span className="text-gold">Inv</span>
          </div>
          <p className="text-dark/30 text-sm">© {new Date().getFullYear()} WeddingInv. All rights reserved.</p>
        </div>
      </footer>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-dark">Create Your Invitation</h2>
              <button onClick={() => setShowForm(false)} className="text-dark/30 hover:text-dark text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark/60 text-sm mb-1">Groom Name *</label>
                  <input type="text" required value={form.groom_name}
                    onChange={(e) => setForm({ ...form, groom_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
                </div>
                <div>
                  <label className="block text-dark/60 text-sm mb-1">Bride Name *</label>
                  <input type="text" required value={form.bride_name}
                    onChange={(e) => setForm({ ...form, bride_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark/60 text-sm mb-1">Wedding Date *</label>
                  <input type="date" required value={form.wedding_date}
                    onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
                </div>
                <div>
                  <label className="block text-dark/60 text-sm mb-1">Wedding Time</label>
                  <input type="time" value={form.wedding_time}
                    onChange={(e) => setForm({ ...form, wedding_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-dark/60 text-sm mb-1">Venue Name</label>
                <input type="text" value={form.venue_name}
                  onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                  placeholder="e.g. Grand Ballroom Hotel"
                  className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
              </div>

              <div>
                <label className="block text-dark/60 text-sm mb-1">Venue Address</label>
                <textarea value={form.venue_address}
                  onChange={(e) => setForm({ ...form, venue_address: e.target.value })}
                  placeholder="Full address of the venue"
                  className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm resize-none" rows={2} />
              </div>

              <div className="border-t border-gold/10 pt-4 mt-4">
                <p className="text-dark/40 text-xs mb-3">Create an admin account to manage your invitation later.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-dark/60 text-sm mb-1">Admin Username *</label>
                    <input type="text" required value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
                  </div>
                  <div>
                    <label className="block text-dark/60 text-sm mb-1">Admin Password *</label>
                    <input type="password" required value={form.password} minLength={6}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
                {loading ? 'Creating...' : '✨ Create My Invitation'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
