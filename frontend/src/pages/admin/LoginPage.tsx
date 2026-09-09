import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../api/services';

export const LoginPage: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const res = await api.loginAdmin(username, password);
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_role', res.role);
      if (res.couple_id) localStorage.setItem('couple_id', res.couple_id);
      toast.success('Logged in successfully');

      if (res.role === 'super') {
        navigate('/admin/dashboard');
      } else if (res.couple_slug) {
        navigate(`/admin/${res.couple_slug}`);
      } else {
        toast.success('Logged in! Use your wedding admin link to access the dashboard.');
        navigate('/');
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.error;
      const message = err?.response?.data?.message;

      if (errorCode === 'invalid_credentials') {
        setError(message || 'Invalid username or password');
      } else if (errorCode === 'wrong_password') {
        setError(message || 'Incorrect password. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <a href="/" className="font-display text-2xl text-text">
            Wedding<span className="text-primary">Inv</span>
          </a>
        </div>
        <h1 className="font-display text-3xl text-text text-center mb-6">Admin Login</h1>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2"
            >
              <span className="text-red-500 text-sm mt-0.5">⚠️</span>
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text/70 text-sm mb-2">Username</label>
            <input type="text" required value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }}
              className={`w-full px-4 py-3 rounded-xl border bg-surface-alt/50 focus:outline-none transition-colors ${error?.toLowerCase().includes('username') ? 'border-red-300 focus:border-red-400' : 'border-border-strong focus:border-primary'}`} />
          </div>
          <div className="mb-6">
            <label className="block text-text/70 text-sm mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className={`w-full px-4 py-3 rounded-xl border bg-surface-alt/50 focus:outline-none transition-colors ${error?.toLowerCase().includes('password') ? 'border-red-300 focus:border-red-400' : 'border-border-strong focus:border-primary'}`} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-text/30 text-xs text-center mt-4">
          <a href="/" className="hover:text-primary">← Back to home</a>
        </p>
      </motion.div>
    </div>
  );
};
