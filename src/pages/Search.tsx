import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import MediaCard from '../components/MediaCard';
import SkeletonRow from '../components/SkeletonRow';
import { Search as SearchIcon, X } from 'lucide-react';
import { MediaBase } from '../types/tmdb';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<MediaBase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    async function fetchResults() {
      setLoading(true);
      try {
        const data = await tmdb.searchMulti(query);
        setResults(data.filter((item: MediaBase) => (item.media_type as string) !== 'person' && (item.poster_path || item.backdrop_path)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchResults, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="pt-24 min-h-screen bg-[#141414] px-4 md:px-12">
      <div className="flex items-center bg-[#181818] border border-white/10 rounded-md mb-8 transition-all focus-within:border-white/30 shadow-xl">
        <SearchIcon className="ml-4 text-white/40" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setSearchParams({ q: e.target.value })}
          placeholder="Titles, people, genres"
          className="w-full bg-transparent text-white text-base md:text-lg p-4 outline-none placeholder:text-white/20"
          autoFocus
        />
        {query && (
          <button 
            onClick={() => setSearchParams({})} 
            className="mr-4 text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-12">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 pb-20">
          {results.map((item) => (
            <div key={item.id} className="group relative">
              <MediaCard item={item} />
              <div className="mt-2 px-1">
                <p className="text-white text-[11px] font-black uppercase tracking-tighter truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.title || item.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="text-white/40 text-center py-40 space-y-4">
          <p className="text-lg">Your search for "{query}" did not have any matches.</p>
          <ul className="text-sm list-inside space-y-1">
            <li>Try different keywords</li>
            <li>Looking for a movie or TV show?</li>
            <li>Try using a title, or an actor</li>
          </ul>
        </div>
      ) : (
        <div className="text-white/20 text-center py-40">
          <p className="text-xl font-black uppercase tracking-[0.2em]">Explore Cineflix</p>
        </div>
      )}
    </div>
  );
}
