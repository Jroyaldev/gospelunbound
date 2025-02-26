export function ResourceCardSkeleton() {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/[0.04] overflow-hidden animate-pulse">
      <div className="relative aspect-[16/9] bg-white/[0.02]" />
      
      <div className="flex flex-col flex-1 p-6">
        <div className="h-4 w-2/3 bg-white/[0.02] rounded mb-2" />
        <div className="h-4 w-1/2 bg-white/[0.02] rounded mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/[0.02] rounded" />
          <div className="h-3 w-5/6 bg-white/[0.02] rounded" />
        </div>
        <div className="flex items-center gap-1.5 mt-4">
          <div className="h-3 w-24 bg-white/[0.02] rounded" />
        </div>
      </div>
    </div>
  );
}
