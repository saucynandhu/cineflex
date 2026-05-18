import { useState, useEffect } from 'react';
import { useUserLists } from '../hooks/useUserLists';
import MediaCard from '../components/MediaCard';

export default function MyList() {
  const { watchLater, removeFromWatchLater } = useUserLists();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(watchLater);
  }, [watchLater]);

  const handleRemove = (id: number, type: string) => {
    removeFromWatchLater(id, type as 'movie' | 'tv');
    setItems(prev => prev.filter(item => !(Number(item.tmdbId || item.id) === Number(id) && item.type === type)));
  };

  return (
    <div className="pt-24 md:pt-32 px-4 md:px-12 pb-20 min-h-screen">
      <h1 className="text-2xl md:text-4xl font-bold mb-8">My List</h1>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
          <p className="text-xl">Your list is empty.</p>
          <p className="text-sm">Browse and add titles to your list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 md:gap-x-4 md:gap-y-12">
          {items.map((item) => (
            <div key={`${item.tmdbId || item.id}-${item.type}`} className="flex flex-col gap-2">
              <MediaCard item={item} type={item.type} listType="watch_later" onRemove={handleRemove} />
              <div className="px-1">
                 <p className="text-xs font-bold truncate text-white/90">{item.title}</p>
                 <p className="text-[10px] text-gray-500">{item.year}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
