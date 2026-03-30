import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import api from '../../services/api';
import PostCard from './PostCard';
import { useAuth } from '../../context/AuthContext';

const Feed = () => {
  const [newPostContent, setNewPostContent] = useState('');
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
    mutationFn: (content) => api.post('/posts', { content }),
    onSuccess: () => {
      setNewPostContent('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    createPostMutation.mutate(newPostContent);
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
      <div className="w-full bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 p-4 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer snap-start shrink-0">
              <div className={`relative w-16 h-16 rounded-full p-[2px] ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-slate-200'}`}>
                <div className="w-full h-full bg-white rounded-full border-2 border-white flex items-center justify-center font-bold text-xl text-slate-700 overflow-hidden relative">
                  {story.isUser && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="https://ui-avatars.com/api/?name=You&background=f1f5f9&color=334155" alt="user" className="w-full h-full object-cover" />
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
            </div>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="w-full">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
          </div>
        )}
        
        {isError && (
          <div className="text-center py-12 text-red-500 font-medium bg-red-50 rounded-xl">
            Could not load feed. Please try again.
          </div>
        )}

        {/* Temporary Quick Post (Since we don't have a separate create post modal right now) */}
        {!isLoading && !isError && (
          <div className="w-full bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 p-4">
            <form onSubmit={handlePostSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="What's on your mind?"
                className="w-full p-2 outline-none text-sm border-b border-transparent focus:border-slate-200 transition-colors"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              {newPostContent && (
                <button 
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="self-end text-blue-500 font-bold text-sm hover:text-blue-700 disabled:opacity-50"
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Share'}
                </button>
              )}
            </form>
          </div>
        )}

        {data?.posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {data?.posts?.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <div className="w-20 h-20 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-slate-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to Uni-Connect</h3>
            <p className="text-slate-500 font-medium">When you follow people, you'll see the photos and videos they post here.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Feed;
