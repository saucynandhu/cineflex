export default function SkeletonRow({ title }: { title?: string }) {
  return (
    <div className="space-y-4 px-4 md:px-12">
      {title && <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />}
      <div className="flex gap-3 sm:gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i}
            className="flex-none rounded-md bg-white/5 animate-pulse w-[160px] sm:w-[200px] lg:w-[240px]"
            style={{ aspectRatio: '16/9' }}
          />
        ))}
      </div>
    </div>
  );
}
