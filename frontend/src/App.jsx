import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import Home from './features/home/Home';
import AppLayout from './components/layout/AppLayout';
import Feed from './features/feed/Feed';
import ChatLayout from './features/chat/ChatLayout';
import GroupDirectory from './features/groups/GroupDirectory';
import GroupChat from './features/groups/GroupChat';
import GroupSettings from './features/groups/GroupSettings';
import Profile from './features/profile/Profile';
import Settings from './features/settings/Settings';
import SearchUsers from './features/search/SearchUsers';
import Announcements from './features/announcements/Announcements';

function App() {
  return (
    <div className="min-h-screen font-sans text-on-surface selection:bg-primary-200 selection:text-primary-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes inside AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/chat/*" element={<ChatLayout />} />
          <Route path="/groups" element={<GroupDirectory />} />
          <Route path="/groups/:groupId/chat" element={<GroupChat />} />
          <Route path="/groups/:groupId/settings" element={<GroupSettings />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<SearchUsers />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/app" element={<Navigate to="/feed" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
