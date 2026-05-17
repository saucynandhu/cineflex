import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import MediaCard from '../components/MediaCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      setLoading(true);
      try {
        const data = await tmdb.searchMulti(query);
        // Filter out people and items without images
        setResults(data.filter((item: any) => 
          (item.media_type === 'movie' || item.media_type === 'tv') && 
          (item.backdrop_path || item.poster_path)
        ));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]);

  return (
    <div className="pt-20 md:pt-24 px-4 md:px-12 pb-32 min-h-screen relative z-0">
      <div className="flex flex-col gap-1 md:gap-2 mb-6 md:mb-8 relative z-[5]">
        <h1 className="text-base md:text-2xl text-gray-400">
          Showing results for <span className="text-white font-black italic">"{query}"</span>
        </h1>
        {results.length > 0 && (
           <p className="text-[10px] md:text-xs text-gray-600 uppercase tracking-widest font-bold">
              Found {results.length} titles matching your search
           </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-x-4 gap-y-12">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-800 animate-pulse rounded-sm" />
            ))}
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-x-4 gap-y-12 md:gap-y-20 overflow-visible">
              {results.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-20 text-center gap-4">
              <p className="text-gray-500 text-lg">Your search for "{query}" did not have any matches.</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Suggestions:</p>
                <ul className="list-disc list-inside">
                  <li>Try different keywords</li>
                  <li>Looking for a movie or TV show?</li>
                  <li>Try using a movie or TV show title</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
