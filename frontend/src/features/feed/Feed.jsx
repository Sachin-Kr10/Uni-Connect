import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Image as ImageIcon, SmilePlus, Component, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import { useAuth } from '../../context/AuthContext';

const Feed = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch Feed
  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await api.get('/posts/feed');
      return res.data;
    }
  });

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
    <div className="max-w-[600px] mx-auto pb-20 pt-4 sm:pt-8 flex flex-col items-center">
      
      {/* Stories Section */}
      <div className="w-full bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 p-4 overflow-hidden shadow-sm">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {stories.map((story) => (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={story.id} 
              className="flex flex-col items-center gap-1 cursor-pointer snap-start shrink-0"
            >
              <div className={`relative w-16 h-16 rounded-full p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-slate-200'}`}>
                <div className="w-full h-full bg-white rounded-full border-2 border-white flex items-center justify-center font-bold text-xl text-slate-700 overflow-hidden relative">
                  {story.isUser && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                      {user?.name?.charAt(0) || 'Y'}
                    </div>
                  )}
                  {!story.isUser && story.image}
                </div>
                {story.isUser && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-600 truncate w-16 text-center">
                {story.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upgraded Composer */}
      <motion.div 
        layout
        className={`w-full bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 p-4 shadow-sm transition-all duration-300 ${isComposerFocused ? 'ring-2 ring-blue-500/20 border-blue-200' : ''}`}
      >
        <form onSubmit={handlePostSubmit} className="flex flex-col">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                ref={composerRef}
                placeholder="What's happening?"
                className="w-full placeholder:text-slate-500 text-slate-900 text-lg outline-none resize-none pt-2 bg-transparent"
                style={{ minHeight: isComposerFocused ? '80px' : '40px' }}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onFocus={() => setIsComposerFocused(true)}
              />

              {/* Image Preview */}
              {previewUrl && (
                <div className="relative mt-2 mb-2 w-full max-h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                   <img src={previewUrl} alt="Preview" className="max-h-80 object-contain" />
                   <button 
                     type="button" 
                     onClick={handleRemoveImage}
                     className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {isComposerFocused && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 overflow-hidden"
              >
                <div className="flex items-center gap-1 text-blue-500">
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
                    className="p-2 hover:bg-blue-50 rounded-full transition-colors cursor-pointer" 
                    title="Add Image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 hover:bg-blue-50 rounded-full transition-colors cursor-pointer" title="Add Poll">
                    <Component className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 hover:bg-blue-50 rounded-full transition-colors cursor-pointer" title="Feeling/Activity">
                    <SmilePlus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                    type="button"
                    onClick={() => {
                      setIsComposerFocused(false);
                      setNewPostContent('');
                      handleRemoveImage();
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit"
                    disabled={(!newPostContent.trim() && !selectedFile) || createPostMutation.isPending || isUploading}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-5 rounded-full text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {(createPostMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : 'Post'}
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
          {data?.posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </AnimatePresence>
        
        {data?.posts?.length === 0 && !isLoading && (
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

    </div>
  );
};

export default Feed;
