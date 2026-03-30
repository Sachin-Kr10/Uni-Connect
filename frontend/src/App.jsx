import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import Home from './pages/Home';
import AppLayout from './components/layout/AppLayout';
import Feed from './features/feed/Feed';
import ChatLayout from './features/chat/ChatLayout';
import GroupDirectory from './features/groups/GroupDirectory';
import Profile from './features/profile/Profile';

function App() {
  return (
    <div className="min-h-screen font-sans text-slate-900 selection:bg-primary-200 selection:text-primary-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes inside AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/chat/*" element={<ChatLayout />} />
          <Route path="/groups" element={<GroupDirectory />} />
          <Route path="/profile/:id" element={<Profile />} />
          {/* Default redirect inside app */}
          <Route path="/app" element={<Navigate to="/feed" replace />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;

