import { useState, useRef, useEffect } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, Image as ImageIcon, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import StoryViewer from './StoryViewer';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAvatar } from '../../utils/avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Feed = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [isStoryUploading, setIsStoryUploading] = useState(false);

  const composerRef = useRef(null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Fetch Feed
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/posts/feed?page=${pageParam}&limit=10`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Stories
  const { data: storyGroups } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const res = await api.get('/stories/active');
      return res.data;
    }
  });

  const createStoryMutation = useMutation({
    mutationFn: (storyData) => api.post('/stories', storyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      showToast('Story published!', 'success');
    }
  });

  const sentinelRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Create Post
  const createPostMutation = useMutation({
    mutationFn: (postData) => api.post('/posts', postData),
    onSuccess: () => {
      setNewPostContent('');
      setSelectedFile(null);
      setPreviewUrl('');
      setIsComposerFocused(false);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      showToast('Post published!', 'success');
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsComposerFocused(true);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedFile) return;

    let mediaUrl = null;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaUrl = uploadRes.data.url;
      } catch (err) {
        setIsUploading(false);
        showToast('Failed to upload image', 'error');
        return;
      }
      setIsUploading(false);
    }
    createPostMutation.mutate({ content: newPostContent, mediaUrl });
  };

  const handleStoryFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsStoryUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      createStoryMutation.mutate({ mediaUrl: uploadRes.data.url });
    } catch (err) {
      showToast('Failed to upload story', 'error');
    }
    setIsStoryUploading(false);
  };

  const handleFabClick = () => {
    setIsComposerFocused(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => composerRef.current?.focus(), 300);
  };

  return (
    <div className="w-full flex-1 max-w-[600px] space-y-8 animate-in fade-in duration-700">
      
      {/* ═══ Story Bar ═══ */}
      <section className="bg-surface-lowest/85 backdrop-blur-xl rounded-2xl p-6 border border-surface-container/30 shadow-sm flex gap-6 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Your Story */}
        <div className="flex flex-col items-center flex-shrink-0 gap-2 group cursor-pointer" onClick={() => document.getElementById('story-upload').click()}>
          <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-primary-600 to-tertiary-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md">
            <div className="w-full h-full rounded-full border-4 border-surface overflow-hidden bg-surface-container flex items-center justify-center relative">
                <Plus className="text-primary-500 w-8 h-8" />
            </div>
          </div>
          <span className="text-xs font-bold font-[family-name:var(--font-body)] text-on-surface-variant truncate w-16 text-center">Your Story</span>
          <input id="story-upload" type="file" accept="image/*" className="hidden" onChange={handleStoryFileSelect} disabled={isStoryUploading} />
        </div>

        {/* Existing Stories */}
        {storyGroups?.map((group, index) => (
          <div 
            key={group.user.id} 
            className="flex flex-col items-center flex-shrink-0 gap-2 cursor-pointer group"
            onClick={() => setActiveStoryGroup({ groups: storyGroups, index })}
          >
            <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-primary-600 to-secondary-500 hover:scale-105 transition-all duration-300">
              <div className="w-full h-full rounded-full border-4 border-surface overflow-hidden bg-surface-container">
                <img 
                  src={getAvatar(group.user)} 
                  alt={group.user.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
            </div>
            <span className="text-xs font-bold font-[family-name:var(--font-body)] text-on-surface truncate w-16 text-center">
              {group.user.name?.split(' ')[0].toLowerCase()}
            </span>
          </div>
        ))}
      </section>

      {/* ═══ Composer ═══ */}
      <div className={cn(
        "bg-surface-container-low rounded-2xl overflow-hidden transition-all duration-500 border border-surface-container/30",
        isComposerFocused ? "shadow-xl ring-2 ring-primary-500/10" : "shadow-sm"
      )}>
        <form onSubmit={handlePostSubmit}>
          <div className="p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0 overflow-hidden">
                <img src={getAvatar(user)} alt="me" className="w-full h-full object-cover" />
              </div>
              <textarea
                ref={composerRef}
                placeholder="Share something with the community..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-on-surface-variant font-[family-name:var(--font-body)] min-h-[60px] py-2 resize-none"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onFocus={() => setIsComposerFocused(true)}
              />
            </div>

            {previewUrl && (
              <div className="relative mt-4 rounded-xl overflow-hidden aspect-video border border-surface-container">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                <button type="button" onClick={() => { setPreviewUrl(''); setSelectedFile(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 active:scale-90 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isComposerFocused && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">
                <div className="flex items-center justify-between pt-4 border-t border-surface-container/50">
                  <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors active:scale-90">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => showToast('Polls coming soon!', 'info')} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:scale-90">
                      <BarChart2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => { setIsComposerFocused(false); setPreviewUrl(''); setNewPostContent(''); setSelectedFile(null); }} className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                      Discard
                    </button>
                    <button type="submit" disabled={(!newPostContent.trim() && !selectedFile) || createPostMutation.isPending || isUploading} className="px-6 py-2 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white text-xs font-bold rounded-full shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                      {(createPostMutation.isPending || isUploading) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Publish
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* ═══ Main Feed ═══ */}
      <div className="space-y-8 pb-32">
        {isLoading && <><PostSkeleton /><PostSkeleton /></>}
        {data?.pages.map((page) => (
          page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ))}
        <div ref={sentinelRef} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary-500 opacity-50" />}
        </div>
      </div>

      <FloatingActionButton onClick={handleFabClick} />

      {/* Story Viewer */}
      <AnimatePresence>
        {activeStoryGroup && (
          <StoryViewer groupedStories={activeStoryGroup.groups} initialUserIndex={activeStoryGroup.index} onClose={() => setActiveStoryGroup(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;
