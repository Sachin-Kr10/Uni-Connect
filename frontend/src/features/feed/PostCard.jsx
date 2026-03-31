import { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Loader2, MapPin, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const cn = (...inputs) => twMerge(clsx(inputs));

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  
  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount || 0);

  // Double Tap State
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTap = useRef(0);

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
    
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (err) {
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    }
  };

  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) handleLike();
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 1000);
    }
    lastTap.current = now;
  };

  // Fetch Comments Query
  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const res = await api.get(`/posts/${post.id}/comments`);
      return res.data;
    },
    enabled: showComments, // Only fetch if section is open
  });

  // Post Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (content) => api.post(`/posts/${post.id}/comment`, { content }),
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['comments', post.id] });
      const previousComments = queryClient.getQueryData(['comments', post.id]);

      // Optimistic update
      queryClient.setQueryData(['comments', post.id], (old) => [
        {
          id: Math.random(),
          content: newContent,
          User: { name: user.name },
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);
      setLocalCommentsCount(prev => prev + 1);
      setShowComments(true);
      setNewComment('');

      return { previousComments };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['comments', post.id], context.previousComments);
      setLocalCommentsCount(prev => prev - 1);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
    },
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const getInitials = (name) => name?.charAt(0) || 'U';
  const timeStr = new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white border border-slate-200/60 rounded-3xl mb-8 overflow-hidden w-full shadow-sm hover:shadow-md transition-shadow group/card"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl p-[2px] bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <div className="w-full h-full rounded-[14px] bg-white border border-white flex items-center justify-center overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.User?.name}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-slate-900 text-[14px] leading-none tracking-tight hover:text-primary-600 transition-colors cursor-pointer capitalize">
                {post.User?.name || 'unknown_user'}
              </h4>
              {post.Group && <span className="text-slate-300 font-black text-xs leading-none">·</span>}
              {post.Group && (
                <span className="text-[12px] text-primary-600 font-bold hover:underline cursor-pointer tracking-tight">{post.Group.name}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{timeStr}</span>
               {post.location && (
                  <>
                    <span className="text-slate-300 font-black text-[8px]">·</span>
                    <div className="flex items-center gap-0.5 text-slate-400 text-[10px] font-bold">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{post.location}</span>
                    </div>
                  </>
               )}
            </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-50 transition-all active:scale-90">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media / Content Area */}
      <div 
        className="w-full bg-slate-50 aspect-square sm:aspect-[4/5] flex items-center justify-center border-y border-slate-100 relative group overflow-hidden cursor-pointer"
        onClick={handleDoubleTap}
      >
        {post.mediaUrl ? (
          <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover select-none" />
        ) : (
          <div className="text-center p-8 max-w-sm select-none">
            <h2 className="text-2xl font-bold text-slate-800 whitespace-pre-wrap leading-tight">{post.content}</h2>
          </div>
        )}

        {/* Double Tap Heart Animation */}
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, times: [0, 0.2, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 fill-white text-white drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="p-4 px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">
            <motion.button 
              onClick={handleLike} 
              whileTap={{ scale: 0.8 }}
              className="group flex items-center gap-2"
            >
              <Heart className={cn("w-6 h-6 transition-all duration-300", isLiked ? "fill-red-500 text-red-500 scale-110" : "text-slate-900 group-hover:text-red-500")} />
              {likesCount > 0 && <span className={cn("text-xs font-black tracking-tight transition-colors", isLiked ? "text-red-500" : "text-slate-900")}>{likesCount}</span>}
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 group text-slate-900 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {localCommentsCount > 0 && <span className="text-xs font-black tracking-tight">{localCommentsCount}</span>}
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="group text-slate-900 hover:text-slate-600 transition-colors">
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.8 }} className="text-slate-300 hover:text-slate-900 transition-colors">
            <Bookmark className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Caption Area */}
        <div className="space-y-1.5">
          {(post.mediaUrl || post.content) && (
            <div className="text-[14px] text-slate-800 leading-snug">
              <span className="font-black mr-2 text-slate-900 cursor-pointer hover:text-primary-600 transition-colors capitalize">
                {post.User?.name}
              </span>
              <span className="font-medium whitespace-pre-wrap">
                {post.content}
              </span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-400 font-medium uppercase mb-2">
          {timeStr}
        </div>

        {/* Interaction Bar (optimized) */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-3">
           {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1.5 pl-4 group focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-50 transition-all">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-400"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || commentMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600 text-white font-black px-4 py-1.5 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-30 flex items-center gap-1.5"
            >
              {commentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 stroke-[4.5px]" />}
              <span>Post</span>
            </button>
          </form>

          {/* Comments Preview Toggle */}
          {localCommentsCount > 0 && (
            <button 
              onClick={() => setShowComments(!showComments)}
              className="text-[12px] font-black text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest pl-1"
            >
              {showComments ? 'Hide comments' : `Show all ${localCommentsCount} comments`}
            </button>
          )}
        </div>

        {/* Interactive Comments Drawer */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto pr-2 scrollbar-hide space-y-3 mt-4">
                {isCommentsLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary-200" /></div>
                ) : (
                  comments?.map((comment) => (
                    <motion.div 
                      key={comment.id} 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-[13px] flex gap-3 group/comment"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-500">
                        {comment.User?.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 leading-tight">
                          {comment.User?.name?.toLowerCase().replace(/\s/g, '_')}
                        </span>
                        <span className="text-slate-600 leading-relaxed font-medium">{comment.content}</span>
                      </div>
                    </motion.div>
                  ))
                )}
                {comments?.length === 0 && !isCommentsLoading && (
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-1">No comments yet</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PostCard;
