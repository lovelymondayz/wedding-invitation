import { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { HomePage } from './pages/HomePage';
import { LandingPage, InvitePage } from './pages/LandingPage';
import { LoginPage } from './pages/admin/LoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { Overview, GuestManagement, RSVPPage, WishesManagement, GalleryManagement, MusicManagement, SchedulePage, LoveStoryPage, GiftPage, SettingsPage } from './components/admin/AdminPages';

const AdminRoutes: FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/guests" element={<GuestManagement />} />
        <Route path="/rsvps" element={<RSVPPage />} />
        <Route path="/wishes" element={<WishesManagement />} />
        <Route path="/gallery" element={<GalleryManagement />} />
        <Route path="/music" element={<MusicManagement />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/love-story" element={<LoveStoryPage />} />
        <Route path="/gift" element={<GiftPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
};

const App: FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#FFF8F0', color: '#2C1810', border: '1px solid rgba(212,165,116,0.2)' } }} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/:coupleSlug/*" element={<AdminRoutes />} />
        <Route path="/:coupleSlug/invite/:guestSlug" element={<InvitePage />} />
        <Route path="/:coupleSlug" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
