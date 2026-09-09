import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../api/services';
import type { CreateCoupleResponse } from '../api/types';
import { getAllTemplates } from '../templates/registry';
import { SAMPLE_DATA } from '../templates/sampleData';

export const HomePage: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [createdPassword, setCreatedPassword] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [form, setForm] = useState({
    groom_name: '',
    bride_name: '',
    wedding_date: '',
    wedding_time: '',
    venue_name: '',
    venue_address: '',
    username: '',
    password: '',
    template_id: 1,
  });

  const templates = getAllTemplates();
  const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplate)?.component || templates[0].component;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: CreateCoupleResponse = await api.createCouple(form);
      setCreatedSlug(res.slug);
      setCreatedPassword(res.password);
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create invitation');
    }
    setLoading(false);
  };

  const features = [
    { title: 'Digital Invitations', desc: 'Beautiful personalized invitation pages for every guest' },
    { title: 'RSVP Management', desc: 'Track attendance, meal preferences, and guest counts' },
    { title: 'Guest Wishes', desc: 'Let guests leave heartfelt messages on your wall' },
    { title: 'Photo Gallery', desc: 'Share your favorite moments in a stunning gallery' },
    { title: 'Background Music', desc: 'Set the mood with your favorite song' },
    { title: 'Gift Registry', desc: 'Receive gifts via bank transfer or e-wallet' },
    { title: 'Event Schedule', desc: 'Keep guests informed with timeline & venue details' },
    { title: 'Love Story', desc: 'Share your journey together with a beautiful timeline' },
  ];

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-display text-2xl text-text">
            Wedding<span className="text-primary">Inv</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/admin/login" className="text-text-muted text-sm hover:text-text transition-colors">
              Admin Login
            </a>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm !py-2 !px-5">
              Create Invitation
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-surface-alt" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232C1810'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-[8%] text-primary/10 text-[15rem] font-display select-none animate-float">❀</div>
        <div className="absolute bottom-1/3 right-[8%] text-primary/10 text-[12rem] font-display select-none animate-float" style={{ animationDelay: '3s' }}>❀</div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="ornament-divider mb-8">
              <span className="text-primary/40 text-sm tracking-[0.4em] uppercase">✦ ✦ ✦</span>
            </div>
            <p className="text-text-muted uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-light">
              Create Your Dream Wedding Invitation
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-text mb-6 leading-tight"
          >
            Beautiful Invitations,<br />
            <span className="text-primary">Unforgettable Moments</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
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
            <button onClick={() => setShowForm(true)} className="btn-primary text-lg !py-4 !px-10">
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
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl text-text mb-16">Three Simple Steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose a Template', desc: 'Pick from beautiful designs that match your style. Preview before committing.' },
              { step: '02', title: 'Fill in Your Details', desc: 'Enter the bride & groom names, wedding date, and venue. Takes less than 2 minutes.' },
              { step: '03', title: 'Share with Guests', desc: 'Share the link with guests. They can view details, RSVP, and leave wishes.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-surface border border-border rounded-xl p-8 hover:border-border-strong"
              >
                <div className="font-display text-5xl text-primary/30 mb-4">{item.step}</div>
                <h3 className="font-display text-xl text-text mb-3">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-surface-alt">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4">Features</p>
            <h2 className="font-display text-4xl md:text-5xl text-text mb-4">Everything You Need</h2>
            <p className="text-text-muted max-w-xl mx-auto">A complete wedding invitation platform with all the features to make your special day unforgettable.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface border border-border rounded-xl p-6 hover:border-border-strong text-center"
              >
                <h3 className="font-display text-text text-lg mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl text-text mb-6">Ready to Create Your Invitation?</h2>
            <p className="text-text-muted text-lg mb-10">Join couples who trust us for their most important day.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-lg !py-4 !px-12">
              Create Your Invitation Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl text-text">
            Wedding<span className="text-primary">Inv</span>
          </div>
          <p className="text-text/30 text-sm">© {new Date().getFullYear()} WeddingInv. All rights reserved.</p>
        </div>
      </footer>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-text">Create Your Invitation</h2>
              <button onClick={() => setShowForm(false)} className="text-text/30 hover:text-text text-2xl">&times;</button>
            </div>

            {/* Template Selector with Live Preview */}
            <div className="mb-6">
              <label className="block text-text/70 text-sm mb-3 font-medium">Choose a Template *</label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(t.id);
                      setForm({ ...form, template_id: t.id });
                    }}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                      selectedTemplate === t.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg bg-primary/10 to-surface-alt mb-2 flex items-center justify-center text-2xl">
                      {t.id === 1 ? '💎' : t.id === 2 ? '⚡' : '🌙'}
                    </div>
                    <p className="text-text text-sm font-medium">{t.name}</p>
                    <p className="text-text-muted text-xs">{t.description}</p>
                    {selectedTemplate === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-surface text-xs">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="mb-6">
              <label className="block text-text/70 text-sm mb-3 font-medium">Live Preview</label>
              <div className="rounded-xl border border-border-strong overflow-hidden bg-surface" style={{ height: '320px' }}>
                <div className="transform scale-[0.35] origin-top-left" style={{ width: '285%', height: '285%' }}>
                  <SelectedTemplateComponent data={SAMPLE_DATA} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted text-sm mb-1">Groom Name *</label>
                  <input type="text" required value={form.groom_name}
                    onChange={(e) => setForm({ ...form, groom_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
                </div>
                <div>
                  <label className="block text-text-muted text-sm mb-1">Bride Name *</label>
                  <input type="text" required value={form.bride_name}
                    onChange={(e) => setForm({ ...form, bride_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted text-sm mb-1">Wedding Date *</label>
                  <input type="date" required value={form.wedding_date}
                    onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
                </div>
                <div>
                  <label className="block text-text-muted text-sm mb-1">Wedding Time</label>
                  <input type="time" value={form.wedding_time}
                    onChange={(e) => setForm({ ...form, wedding_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-1">Venue Name</label>
                <input type="text" value={form.venue_name}
                  onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                  placeholder="e.g. Grand Ballroom Hotel"
                  className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-1">Venue Address</label>
                <textarea value={form.venue_address}
                  onChange={(e) => setForm({ ...form, venue_address: e.target.value })}
                  placeholder="Full address of the venue"
                  className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm resize-none" rows={2} />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-text-muted text-xs mb-3">Create an admin account to manage your invitation later.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-text-muted text-sm mb-1">Admin Username *</label>
                    <input type="text" required value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
                  </div>
                  <div>
                    <label className="block text-text-muted text-sm mb-1">Admin Password *</label>
                    <input type="password" required value={form.password} minLength={6}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border-strong bg-surface-alt/50 focus:outline-none focus:border-primary text-sm" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Creating...' : '✨ Create My Invitation'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-dark/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-display text-2xl text-text mb-2">You're All Set!</h2>
            <p className="text-text-muted text-sm mb-6">Your wedding invitation is live. Save these credentials — you'll need them to login.</p>
            
            <div className="bg-surface-alt/80 rounded-xl p-4 mb-4 text-left">
              <div className="mb-3">
                <p className="text-text-muted text-xs mb-1">Your Page</p>
                <p className="text-text font-medium text-sm">wedding.arjism.com/{createdSlug}</p>
              </div>
              <div className="mb-3">
                <p className="text-text-muted text-xs mb-1">Login URL</p>
                <p className="text-text font-medium text-sm">wedding.arjism.com/admin/login</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-text-muted text-xs mb-1">Username</p>
                  <p className="text-text font-bold text-sm">{form.username}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs mb-1">Password</p>
                  <p className="text-text font-bold text-sm">{createdPassword}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <a href={`/${createdSlug}`} target="_blank" className="btn-outline flex-1 text-sm !py-3">
                View Page
              </a>
              <a href="/admin/login" className="btn-primary flex-1 text-sm !py-3">
                Go to Login
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
