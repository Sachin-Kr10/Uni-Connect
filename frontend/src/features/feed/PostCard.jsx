import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAvatar } from '../../utils/avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Loader2, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';

const cn = (...inputs) => twMerge(clsx(inputs));

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isMyPost = post.userId === user.id;

  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount || 0);

  // Double Tap State
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTap = useRef(0);

  const handleLike = async () => {
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

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
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) handleLike();
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this on Uni-Connect', url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showToast(isBookmarked ? 'Removed from saved' : 'Post saved!', isBookmarked ? 'info' : 'success');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post.id}`);
    showToast('Link copied!', 'success');
    setShowMoreMenu(false);
  };

  // Fetch Comments Query
  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const res = await api.get(`/posts/${post.id}/comments`);
      return res.data;
    },
    enabled: showComments,
  });

  // Post Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (content) => api.post(`/posts/${post.id}/comment`, { content }),
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['comments', post.id] });
      const previousComments = queryClient.getQueryData(['comments', post.id]);

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

  // Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/posts/${post.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      showToast('Post deleted', 'success');
    },
    onError: () => showToast('Failed to delete post', 'error')
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const timeStr = new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <article className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-surface-container/30 relative">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface shrink-0 bg-surface-container-high">
            <img
              src={post.User?.profileImage || getAvatar(null)}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-sm leading-none text-on-surface">
              {post.User?.name?.toLowerCase().replace(/\s/g, '_')}
            </h3>
            <span className="text-xs text-on-surface-variant font-medium font-[family-name:var(--font-body)]">
              {post.location || (post.Group ? post.Group.name : 'Global Feed')}
            </span>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {/* More Menu Dropdown */}
          <AnimatePresence>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-full mt-1 bg-surface-lowest rounded-xl shadow-xl border border-surface-container/50 py-2 z-40 w-44"
                >
                  <button onClick={handleCopyLink} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
                    Copy Link
                  </button>
                  {isMyPost && (
                    <button 
                      onClick={() => { deleteMutation.mutate(); setShowMoreMenu(false); }} 
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Post
                    </button>
                  )}
                  {!isMyPost && (
                    <button onClick={() => { showToast('Post reported', 'info'); setShowMoreMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-secondary-600 hover:bg-secondary-50 transition-colors">
                      Report
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Meta / Image */}
      <div 
        className="relative w-full overflow-hidden cursor-pointer"
        onClick={handleDoubleTap}
      >
        {post.mediaUrl ? (
          <div className="flex items-center justify-center w-full max-h-[550px] overflow-hidden bg-black/90">
            <img 
              src={post.mediaUrl} 
              alt="Post Content" 
              className="max-w-full max-h-[550px] object-contain select-none" 
            />
            {/* Double Tap Heart Animation */}
            <AnimatePresence>
              {showHeartAnim && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <Heart className="text-white w-24 h-24 drop-shadow-2xl fill-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-10 bg-gradient-to-br from-surface-container-high to-surface-container-low flex items-center justify-center min-h-[300px]">
             <p className="text-xl md:text-2xl font-black text-on-surface text-center leading-tight font-[family-name:var(--font-display)] tracking-tighter">
               {post.content}
             </p>
          </div>
        )}
      </div>

      {/* Actions & Interaction */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 group transition-transform active:scale-90",
                isLiked ? "text-secondary-500" : "text-on-surface"
              )}
            >
              <Heart className={cn("transition-all group-hover:scale-110 w-5 h-5", isLiked && "fill-secondary-500 text-secondary-500")} />
              <span className="text-sm font-bold">{likesCount}</span>
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-on-surface group transition-transform active:scale-90"
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-all" />
              <span className="text-sm font-bold">{localCommentsCount}</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-on-surface hover:scale-110 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleBookmark}
            className="text-on-surface hover:scale-110 transition-transform"
          >
            <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-on-surface")} />
          </button>
        </div>

        <div className="space-y-1">
          {post.mediaUrl && (
            <p className="text-sm leading-relaxed font-[family-name:var(--font-body)] text-on-surface">
              <span className="font-bold mr-2">{post.User?.name?.toLowerCase().replace(/\s/g, '_')}</span>
              {post.content}
            </p>
          )}
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant block mt-2 opacity-60">
            {timeStr}
          </span>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-4"
            >
              <div className="border-t border-surface-container/50 pt-4 space-y-4">
                {isCommentsLoading ? (
                  <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-primary-500" /></div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <span className="text-xs font-bold text-on-surface shrink-0">
                          {comment.User?.name?.toLowerCase().replace(/\s/g, '_')}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {comment.content}
                        </span>
                      </div>
                    ))}
                    {(!comments || comments.length === 0) && (
                      <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase tracking-widest py-2">No discussion yet</p>
                    )}
                  </div>
                )}

                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-surface-container-lowest border-none focus:ring-0 text-xs font-medium p-2 rounded-lg"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentMutation.isPending}
                    className="text-primary-600 font-bold text-xs uppercase disabled:opacity-30"
                  >
                    Post
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
};

export default PostCard;
