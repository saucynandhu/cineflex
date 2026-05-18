import { useState, useEffect } from 'react';
import { useUserLists } from '../hooks/useUserLists';
import MediaCard from '../components/MediaCard';
import { Check } from 'lucide-react';

export default function Watched() {
  const { watched, removeFromWatched } = useUserLists();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(watched);
  }, [watched]);

  const handleRemove = (id: number, type: string) => {
    removeFromWatched(id, type as 'movie' | 'tv');
    setItems(prev => prev.filter(item => !(Number(item.tmdbId || item.id) === Number(id) && item.type === type)));
  };

  return (
    <div className="pt-24 md:pt-32 px-4 md:px-12 pb-20 min-h-screen">
      <h1 className="text-2xl md:text-4xl font-bold mb-8">Watched</h1>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
          <p className="text-xl">Your watch history is empty.</p>
          <p className="text-sm">Browse and watch titles to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 md:gap-x-4 md:gap-y-12">
          {items.map((item) => (
            <div key={`${item.tmdbId || item.id}-${item.type}`} className="flex flex-col gap-2 relative group">
              <MediaCard item={item} type={item.type} listType="watched" onRemove={handleRemove} />
              <div className="px-1">
                 <p className="text-xs font-bold truncate text-white/90">{item.title}</p>
                 <div className="flex items-center gap-2 mt-1">
                    <div className="bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check size={10} className="text-green-500" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {item.type === 'tv' && item.season && item.episode 
                          ? `S${item.season} E${item.episode}` 
                          : 'Watched'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">{item.year}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
