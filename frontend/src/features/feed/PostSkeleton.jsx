const PostSkeleton = () => {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-surface-container/30 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-surface-container-high rounded-full" />
            <div className="h-2 w-20 bg-surface-container rounded-full" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-container" />
      </div>

      {/* Media Skeleton */}
      <div className="w-full aspect-[4/5] bg-surface-container" />

      {/* Action Bar Skeleton */}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-6 h-6 rounded-full bg-surface-container-high" />
            <div className="w-6 h-6 rounded-full bg-surface-container-high" />
            <div className="w-6 h-6 rounded-full bg-surface-container-high" />
          </div>
          <div className="w-6 h-6 rounded-full bg-surface-container-high" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-40 bg-surface-container-high rounded-full" />
          <div className="h-3 w-full bg-surface-container rounded-full" />
          <div className="h-3 w-2/3 bg-surface-container rounded-full" />
        </div>
        
        <div className="h-2 w-16 bg-surface-container rounded-full opacity-50 mt-4" />
      </div>
    </div>
  );
};

export default PostSkeleton;
