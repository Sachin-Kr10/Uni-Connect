import { useAuth } from '../../context/AuthContext';
import { Mail, Calendar, Edit3, Award } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cover Image & Avatar */}
      <div className="relative mb-16">
        <div className="h-48 rounded-3xl bg-gradient-to-r from-blue-400 to-indigo-500 w-full object-cover shadow-sm"></div>
        <div className="absolute -bottom-12 left-8 md:left-12 flex items-end">
          <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-lg border border-slate-100 flex items-center justify-center">
             <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-black">
               {user?.name?.charAt(0) || 'U'}
             </div>
          </div>
          <button className="ml-4 mb-2 p-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-colors">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="glass-card bg-white/70 p-8 rounded-3xl shadow-sm mb-8 relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{user?.name}</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl mb-6">
            Computer Science student deeply interested in AI, web development, and large-scale distributed systems. Always building something new.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <span className="capitalize">{user?.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span>Joined {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="flex gap-4 border-b border-slate-200/50 mb-6 px-4">
        <button className="py-3 px-2 border-b-2 border-primary-500 text-primary-600 font-bold">Recent Posts</button>
        <button className="py-3 px-2 border-b-2 border-transparent text-slate-500 font-semibold hover:text-slate-800 transition-colors">Clubs</button>
      </div>

      <div className="text-center py-20 glass-card bg-white/40 rounded-3xl">
        <h3 className="text-xl font-bold text-slate-700 mb-2">No active posts</h3>
        <p className="text-slate-500 font-medium">Head over to the feed to share your thoughts!</p>
      </div>

    </div>
  );
};

export default Profile;
