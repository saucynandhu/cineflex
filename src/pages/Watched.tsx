import { useUserLists } from '../hooks/useUserLists';
import MediaCard from '../components/MediaCard';

export default function Watched() {
  const { previouslyWatched, removeFromWatched } = useUserLists();

  return (
    <div className="pt-24 min-h-screen bg-[#141414] px-4 md:px-12 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Watched</h1>
      
      {previouslyWatched.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {previouslyWatched.map((item) => (
            <div key={item.id || item.tmdbId} className="relative group">
              <MediaCard 
                item={item} 
                listType="watched"
                onRemove={removeFromWatched}
              />
              <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase pointer-events-none">
                ✓ Watched {item.type === 'tv' && item.season && `S${item.season}:E${item.episode}`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white/60 text-center py-20">
          You haven't watched anything yet.
        </div>
      )}
    </div>
  );
}
