import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import MediaCard from '../components/MediaCard';
import SkeletonRow from '../components/SkeletonRow';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { MediaBase, Genre } from '../types/tmdb';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'framer-motion';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeFilter = (searchParams.get('type') as 'all' | 'movie' | 'tv') || 'all';
  
  const [results, setResults] = useState<MediaBase[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (isNextPage = false) => {
    if (!query) return;
    
    const currentPage = isNextPage ? page + 1 : 1;
    if (isNextPage) setLoadingMore(true);
    else setLoading(true);

    try {
      let data;
      if (typeFilter === 'all') {
        data = await tmdb.searchMulti(query, currentPage);
      } else {
        data = await tmdb.searchType(typeFilter, query, currentPage);
      }

      const filtered = data.results.filter((item: MediaBase) => 
        (item.media_type as string) !== 'person' && 
        (item.poster_path || item.backdrop_path)
      );

      if (isNextPage) {
        setResults(prev => [...prev, ...filtered]);
        setPage(currentPage);
      } else {
        setResults(filtered);
        setPage(1);
        setTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, typeFilter, page]);

  // Initial search or filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) fetchResults(false);
      else setResults([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, typeFilter]);

  // Infinite scroll
  useEffect(() => {
    if (loading || loadingMore || page >= totalPages) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchResults(true);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages, fetchResults]);

  const handleTypeChange = (type: string) => {
    setSearchParams(prev => {
      if (type === 'all') prev.delete('type');
      else prev.set('type', type);
      return prev;
    });
  };

  return (
    <div className="pt-24 min-h-screen bg-[#141414] px-4 md:px-12">
      {/* Search Bar & Filter Toggle */}
      <div className="sticky top-[80px] z-30 flex flex-col gap-4 mb-8">
        <div className="flex items-center bg-[#181818]/90 backdrop-blur-md border border-white/10 rounded-md transition-all focus-within:border-white/30 shadow-2xl">
          <SearchIcon className="ml-4 text-white/40" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setSearchParams(prev => {
              if (e.target.value) prev.set('q', e.target.value);
              else prev.delete('q');
              return prev;
            })}
            placeholder="Titles, people, genres"
            className="w-full bg-transparent text-white text-base md:text-lg p-4 outline-none placeholder:text-white/20"
            autoFocus
          />
          <div className="flex items-center gap-2 mr-4">
            {query && (
              <button 
                onClick={() => setSearchParams({})} 
                className="text-white/40 hover:text-white transition-colors p-1"
                title="Clear search"
              >
                <X size={20} />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-full transition-all",
                showFilters ? "bg-[#E50914] text-white" : "text-white/40 hover:text-white hover:bg-white/10"
              )}
              title="Filters"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-[#181818] border border-white/10 rounded-md shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Type:</span>
                {['all', 'movie', 'tv'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-tighter",
                      typeFilter === t 
                        ? "bg-white text-black" 
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {t === 'all' ? 'Everything' : t === 'movie' ? 'Movies' : 'TV Shows'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {loading && results.length === 0 ? (
        <div className="space-y-12">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-3 gap-y-10 pb-10">
            {results.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="group relative">
                <MediaCard item={item} />
                <div className="mt-2 px-1">
                  <p className="text-white text-[11px] font-black uppercase tracking-tighter truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title || item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Infinite Scroll Loader */}
          <div 
            ref={loaderRef} 
            className="h-20 flex items-center justify-center pb-20"
          >
            {loadingMore && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#E50914] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-[#E50914] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-[#E50914] rounded-full animate-bounce" />
              </div>
            )}
            {!loadingMore && page >= totalPages && results.length > 0 && (
              <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">End of results</p>
            )}
          </div>
        </>
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
        <div className="text-white/20 text-center py-40 flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <SearchIcon size={40} className="text-white/10" />
          </div>
          <p className="text-xl font-black uppercase tracking-[0.3em]">Explore Cineflex</p>
        </div>
      )}
    </div>
  );
}
