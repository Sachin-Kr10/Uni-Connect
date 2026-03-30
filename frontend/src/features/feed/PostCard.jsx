import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Loader2 } from 'lucide-react';
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
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 overflow-hidden w-full shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white border border-white flex items-center justify-center text-slate-800 font-bold text-xs overflow-hidden">
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

      {/* Media / Content Area */}
      <div className="w-full bg-slate-50 aspect-square sm:aspect-[4/5] flex items-center justify-center border-y border-slate-100 relative group overflow-hidden">
        {post.mediaUrl ? (
          <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <h2 className="text-2xl font-bold text-slate-800 whitespace-pre-wrap leading-tight">{post.content}</h2>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3 sm:p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={handleLike} 
              whileTap={{ scale: 0.8 }}
              className="group"
            >
              <Heart className={cn("w-6 h-6 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-slate-900 group-hover:text-slate-600")} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="text-slate-900 hover:text-slate-600"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="text-slate-900 hover:text-slate-600">
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} className="text-slate-900 hover:text-slate-600">
            <Bookmark className="w-6 h-6" />
          </motion.button>
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

        {/* Comments Preview Toggle */}
        {localCommentsCount > 0 && (
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            {showComments ? 'Hide comments' : `View all ${localCommentsCount} comments`}
          </button>
        )}

        {/* Interactive Comments Drawer */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-2"
            >
              <div className="max-h-48 overflow-y-auto pr-2 scrollbar-hide space-y-2 mt-2">
                {isCommentsLoading ? (
                  <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
                ) : (
                  comments?.map((comment) => (
                    <div key={comment.id} className="text-sm flex gap-2">
                      <span className="font-semibold text-slate-900 shrink-0">
                        {comment.User?.name?.toLowerCase().replace(/\s/g, '_')}
                      </span>
                      <span className="text-slate-800 break-words">{comment.content}</span>
                    </div>
                  ))
                )}
                {comments?.length === 0 && !isCommentsLoading && (
                  <div className="text-sm text-slate-400 italic">No comments yet. Be the first!</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Comment Input */}
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full text-sm outline-none placeholder:text-slate-500 text-slate-900"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || commentMutation.isPending}
            className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default PostCard;
