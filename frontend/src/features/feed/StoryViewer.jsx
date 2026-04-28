import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvatar } from '../../utils/avatar';

const StoryViewer = ({ groupedStories, initialUserIndex = 0, onClose }) => {
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentUser = groupedStories[userIndex];
  const currentStory = currentUser.stories[storyIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [userIndex, storyIndex]);

  const handleNext = () => {
    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (userIndex < groupedStories.length - 1) {
      setUserIndex(userIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      setUserIndex(userIndex - 1);
      setStoryIndex(groupedStories[userIndex - 1].stories.length - 1);
      setProgress(0);
    } else {
      setStoryIndex(0);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[110]"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center z-[110]">
        <button onClick={handlePrev} className="text-white/30 hover:text-white p-4 transition-colors">
          <ChevronLeft className="w-10 h-10" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center z-[110]">
        <button onClick={handleNext} className="text-white/30 hover:text-white p-4 transition-colors">
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      <motion.div 
        key={`${userIndex}-${storyIndex}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-[450px] aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
          {currentUser.stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: i === storyIndex ? `${progress}%` : i < storyIndex ? '100%' : '0%' }}
                transition={{ duration: i === storyIndex ? 0.05 : 0 }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-8 left-4 right-4 flex items-center gap-3 z-20">
          <div className="w-10 h-10 rounded-full border-2 border-white/50 p-0.5 pointer-events-none">
            <img 
              src={getAvatar(currentUser.user)} 
              alt="avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm shadow-sm">{currentUser.user.name}</span>
            <span className="text-white/60 text-xs shadow-sm">
               {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <img 
          src={currentStory.mediaUrl} 
          alt="Story" 
          className="w-full h-full object-cover select-none pointer-events-none" 
        />
        
        <div className="absolute inset-0 flex">
           <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
           <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </motion.div>
    </div>
  );
};

export default StoryViewer;
