import { useState, useRef, useEffect } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Image as ImageIcon, SmilePlus, Component, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import StoryViewer from './StoryViewer';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Feed = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null); // Story viewing state
  const [isStoryUploading, setIsStoryUploading] = useState(false);

  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch Feed with Infinite Query
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
      const res = await api.get(`/posts/feed?page=${pageParam}&limit=5`);
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

  // Fetch Stories
  const { data: storyGroups, isLoading: isStoriesLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const res = await api.get('/stories/active');
      return res.data;
    }
  });

  // Create Story Mutation
  const createStoryMutation = useMutation({
    mutationFn: (storyData) => api.post('/stories', storyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });

  // Infinite Scroll Observer
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: (postData) => api.post('/posts', postData),
    onSuccess: () => {
      setNewPostContent('');
      setSelectedFile(null);
      setPreviewUrl('');
      setIsComposerFocused(false);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedFile) return;

    let mediaUrl = null;

    if (selectedFile) {
      // 1. Upload the image to Cloudinary via our backend
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        mediaUrl = uploadRes.data.url;
      } catch (err) {
        console.error("Image upload failed", err);
        setIsUploading(false);
        alert("Failed to upload image. Please try again.");
        return;
      }
      setIsUploading(false);
    }

    // 2. Create the post
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
      
      const mediaUrl = uploadRes.data.url;
      createStoryMutation.mutate({ mediaUrl });
    } catch (err) {
      console.error("Story upload failed", err);
      alert("Failed to upload story. Please try again.");
    }
    setIsStoryUploading(false);
  };

  // Mock Stories Data
  const stories = [
    { id: 'me', name: 'Your story', isUser: true, hasUnseen: false },
    { id: 1, name: 'robosoc', hasUnseen: true, image: 'R' },
    { id: 2, name: 'cs_club', hasUnseen: true, image: 'C' },
    { id: 3, name: 'james_k', hasUnseen: true, image: 'J' },
    { id: 4, name: 'sarah.l', hasUnseen: false, image: 'S' },
    { id: 5, name: 'gdt_events', hasUnseen: true, image: 'G' },
    { id: 6, name: 'music_soc', hasUnseen: false, image: 'M' },
  ];

  return (
    <div className="max-w-[600px] mx-auto pb-20 sm:pt-8 flex flex-col items-center">
      
      {/* Modern Stories Bar */}
      <div className="w-full mb-8 overflow-hidden">
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
          {/* Your Story Trigger */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0"
          >
            <div className="relative w-[72px] h-[72px] rounded-3xl p-[3px] bg-slate-200/50 transition-colors hover:bg-slate-300/50">
              <div 
                className="w-full h-full bg-white rounded-[21px] flex items-center justify-center font-bold text-lg text-slate-700 overflow-hidden relative shadow-sm border border-white"
                onClick={() => document.getElementById('story-upload').click()}
              >
                 <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                    alt="me" 
                    className="w-full h-full object-cover"
                  />
                  {isStoryUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white backdrop-blur-[2px]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-[26px] h-[26px] bg-primary-500 rounded-xl border-[3px] border-white flex items-center justify-center text-white shadow-md z-10 transition-transform hover:scale-110">
                <Plus className="w-4 h-4 stroke-[4px]" />
              </div>
              <input 
                id="story-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleStoryFileSelect} 
                disabled={isStoryUploading}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 tracking-tight">
              Add Story
            </span>
          </motion.div>

          {/* Active Stories */}
          {storyGroups?.map((group, index) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={group.user.id} 
              className="flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0"
              onClick={() => setActiveStoryGroup({ groups: storyGroups, index })}
            >
              <div className="relative w-[72px] h-[72px] rounded-3xl p-[3px] bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-sm transition-shadow hover:shadow-md">
                <div className="w-full h-full bg-white rounded-[21px] border-[2px] border-white flex items-center justify-center font-bold text-lg text-slate-700 overflow-hidden relative">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${group.user.name}`} 
                    alt={group.user.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-800 tracking-tight truncate w-[72px] text-center">
                {group.user.name?.split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Post Composer */}
      <motion.div 
        initial={false}
        animate={{ height: isComposerFocused ? 'auto' : '64px' }}
        className={cn(
          "w-full bg-white mb-8 transition-all duration-500 ease-in-out border border-slate-200/60 overflow-hidden shadow-sm",
          isComposerFocused ? "rounded-3xl p-5 border-primary-100 ring-4 ring-primary-50/30" : "rounded-full px-5 py-2.5 flex items-center"
        )}
      >
        <form onSubmit={handlePostSubmit} className="w-full flex flex-col">
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 border border-slate-200/50 overflow-hidden shadow-inner flex items-center justify-center">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                  alt="me" 
                   className="w-full h-full object-cover"
                />
             </div>
             
             <div className="flex-1 min-w-0 pt-2">
               <textarea
                 ref={composerRef}
                 placeholder="What's happening in campus?"
                 className={cn(
                   "w-full bg-transparent border-none focus:ring-0 resize-none text-slate-800 font-medium placeholder:text-slate-400 transition-all",
                   isComposerFocused ? "min-h-[100px] text-lg" : "h-10 text-base"
                 )}
                 value={newPostContent}
                 onChange={(e) => setNewPostContent(e.target.value)}
                 onFocus={() => setIsComposerFocused(true)}
               />
               
               {/* Image Preview */}
               {previewUrl && (
                 <div className="relative mt-4 mb-4 w-full h-[320px] rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-xl backdrop-blur-md transition-all active:scale-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                 </div>
               )}
             </div>

             {!isComposerFocused && (
               <div className="flex items-center gap-1 mb-1">
                 <button 
                   type="button" 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                 >
                   <ImageIcon className="w-5 h-5" />
                 </button>
                 <button 
                   type="submit"
                   disabled={!newPostContent.trim() && !selectedFile}
                   className="bg-primary-500 hover:bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md shadow-primary-500/20 active:scale-90 disabled:opacity-50"
                 >
                    <Plus className="w-6 h-6 stroke-[3px]" />
                 </button>
               </div>
             )}
          </div>

          <AnimatePresence>
            {isComposerFocused && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 text-primary-600 hover:bg-primary-50 rounded-xl font-bold text-sm transition-all"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Media</span>
                  </button>
                  <button type="button" className="flex items-center gap-2 px-3.5 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all">
                    <Component className="w-5 h-5" />
                    <span>Poll</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                   <button 
                    type="button"
                    onClick={() => {
                      setIsComposerFocused(false);
                      setNewPostContent('');
                      handleRemoveImage();
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={(!newPostContent.trim() && !selectedFile) || createPostMutation.isPending || isUploading}
                    className="bg-slate-900 hover:bg-black text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createPostMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : 'Post it'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Feed List */}
      <div className="w-full">
        {isLoading && (
          <div className="flex flex-col w-full gap-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}
        
        {isError && (
          <div className="text-center py-12 text-red-500 font-medium bg-red-50 rounded-xl">
            Could not load feed. Please try again.
          </div>
        )}

        <AnimatePresence>
          {data?.pages?.map((page) => (
            page.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ))}
        </AnimatePresence>
        
        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          {isFetchingNextPage && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        </div>
        
        {data?.pages?.[0]?.posts?.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white border border-slate-200 rounded-2xl"
          >
            <div className="w-20 h-20 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to Uni-Connect</h3>
            <p className="text-slate-500 font-medium">When you follow people, you'll see the photos and videos they post here.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activeStoryGroup && (
          <StoryViewer 
             groupedStories={activeStoryGroup.groups}
             initialUserIndex={activeStoryGroup.index}
             onClose={() => setActiveStoryGroup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;
