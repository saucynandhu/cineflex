import { useUserLists } from '../hooks/useUserLists';
import MediaCard from '../components/MediaCard';

export default function MyList() {
  const { watchLater, removeFromWatchLater } = useUserLists();

  return (
    <div className="pt-24 min-h-screen bg-[#141414] px-4 md:px-12 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">My List</h1>
      
      {watchLater.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {watchLater.map((item) => (
            <MediaCard 
              key={item.id || item.tmdbId} 
              item={item} 
              listType="watch_later"
              onRemove={removeFromWatchLater}
            />
          ))}
        </div>
      ) : (
        <div className="text-white/60 text-center py-20">
          You haven't added anything to your list yet.
        </div>
      )}
    </div>
  );
}
