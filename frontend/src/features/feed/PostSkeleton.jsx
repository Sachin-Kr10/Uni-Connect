import { motion } from 'framer-motion';

const PostSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-slate-200 rounded-none sm:rounded-2xl mb-6 overflow-hidden w-full"
    >
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="w-24 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-16 h-2 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Media Skeleton */}
      <div className="w-full bg-slate-100 aspect-square sm:aspect-[4/5] animate-pulse" />
      
      {/* Action Bar Skeleton */}
      <div className="p-3 sm:p-4 pb-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="w-16 h-3 bg-slate-200 rounded mb-3 animate-pulse" />
        <div className="w-full h-3 bg-slate-200 rounded mb-2 animate-pulse" />
        <div className="w-4/5 h-3 bg-slate-200 rounded mb-4 animate-pulse" />
        
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <div className="w-full h-4 bg-slate-100 rounded animate-pulse" />
          <div className="w-10 h-4 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

export default PostSkeleton;
