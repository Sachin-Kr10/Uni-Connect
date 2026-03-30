import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../../services/api';

const cn = (...inputs) => twMerge(clsx(inputs));

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (err) {
      setIsLiked(isLiked);
      setLikesCount(post.likesCount);
    }
  };

  const getInitials = (name) => name?.charAt(0) || 'U';
  const timeStr = new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white border border-white flex items-center justify-center text-slate-800 font-bold text-xs overflow-hidden">
              {/* Optional: Add img tag here if user has avatar */}
              {getInitials(post.User?.name)}
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-slate-900 text-sm leading-none">
              {post.User?.name?.toLowerCase().replace(/\s/g, '_') || 'unknown_user'}
            </h4>
            {post.Group && (
              <span className="text-[11px] text-slate-500 leading-none mt-0.5">{post.Group.name}</span>
            )}
          </div>
          <span className="text-slate-400 text-xs font-medium">• {timeStr}</span>
        </div>
        <button className="text-slate-900 hover:text-slate-500 p-1 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media / Content Area (IG prioritizes images) */}
      <div className="w-full bg-slate-50 aspect-square sm:aspect-[4/5] flex items-center justify-center border-y border-slate-100 relative group">
        {post.mediaUrl ? (
          <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <h2 className="text-2xl font-bold text-slate-800 whitespace-pre-wrap leading-tight">{post.content}</h2>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3 sm:p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="group transition-transform hover:scale-110 active:scale-95">
              <Heart className={cn("w-6 h-6", isLiked ? "fill-red-500 text-red-500" : "text-slate-900 group-hover:text-slate-600")} />
            </button>
            <button className="transition-transform hover:scale-110 active:scale-95 text-slate-900 hover:text-slate-600">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="transition-transform hover:scale-110 active:scale-95 text-slate-900 hover:text-slate-600">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="transition-transform hover:scale-110 active:scale-95 text-slate-900 hover:text-slate-600">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-slate-900 text-sm mb-1">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </div>

        {/* Caption */}
        {post.mediaUrl && post.content && (
          <div className="text-sm text-slate-900 mb-1 leading-relaxed">
            <span className="font-semibold mr-2">{post.User?.name?.toLowerCase().replace(/\s/g, '_')}</span>
            {post.content}
          </div>
        )}

        {/* Comments Preview */}
        {post.commentsCount > 0 && (
          <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2">
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Add Comment Input */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full text-sm outline-none placeholder:text-slate-500"
          />
          <button className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors">Post</button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

