import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import MediaCard from '../components/MediaCard';
import { Search as SearchIcon, X } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
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
        setResults(data.filter((item: any) => item.media_type !== 'person'));
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
      <div className="flex items-center bg-[#222] border-b border-white/10 mb-8 sticky top-20 z-30">
        <SearchIcon className="ml-4 text-white/40" size={24} />
        <input
          type="text"
          value={query}
          onChange={(e) => setSearchParams({ q: e.target.value })}
          placeholder="Search for movies, TV shows..."
          className="w-full bg-transparent text-white text-xl p-4 outline-none"
          autoFocus
        />
        {query && (
          <button onClick={() => setSearchParams({})} className="mr-4 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-white/60 text-center py-20">Searching...</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pb-20">
          {results.map((item) => (
            <div key={item.id} className="group relative">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="text-white/60 text-center py-20">
          Your search for "{query}" did not have any matches.
        </div>
      ) : (
        <div className="text-white/60 text-center py-20">
          Start typing to search Cineflix
        </div>
      )}
    </div>
  );
}
