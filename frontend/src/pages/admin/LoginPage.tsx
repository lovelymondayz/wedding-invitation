import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../api/services';

export const LoginPage: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.loginAdmin(username, password);
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_role', res.role);
      toast.success('Logged in successfully');

      if (res.role === 'super') {
        // Super admin — redirect to first couple or a dashboard list
        // For now, redirect to the first known couple
        navigate('/admin/john-jane-a0eebc99');
      } else {
        // Couple admin — need to get their couple slug from the couple_id
        // We'll fetch /api/auth/me to get couple info, but for now use stored slug
        const slug = localStorage.getItem('couple_slug');
        if (slug) {
          navigate(`/admin/${slug}`);
        } else {
          // Fallback: redirect to home, they can figure it out
          navigate('/');
        }
      }
    } catch {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <a href="/" className="font-display text-2xl text-dark">
            Wedding<span className="text-gold">Inv</span>
          </a>
        </div>
        <h1 className="font-serif text-3xl text-dark text-center mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark/70 text-sm mb-2">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold" />
          </div>
          <div className="mb-6">
            <label className="block text-dark/70 text-sm mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-cream/50 focus:outline-none focus:border-gold" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-dark/30 text-xs text-center mt-4">
          <a href="/" className="hover:text-gold">← Back to home</a>
        </p>
      </motion.div>
    </div>
  );
};
