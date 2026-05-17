import { useState, useEffect } from 'react';
import * as tmdb from '../lib/tmdb';
import MediaCard from '../components/MediaCard';
import { getImageUrl } from '../lib/tmdb';

export default function Movies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGenres() {
      const g = await tmdb.getGenres('movie');
      setGenres(g);
    }
    loadGenres();
  }, []);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const results = selectedGenre 
          ? await tmdb.getByGenre('movie', selectedGenre)
          : await tmdb.getTrending('movie');
        setMovies(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [selectedGenre]);

  return (
    <div className="pt-20 md:pt-24 px-4 md:px-12 pb-32 relative z-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 relative z-[5]">
        <h1 className="text-2xl md:text-3xl font-bold">Movies</h1>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 md:px-4 py-1 rounded-full text-xs md:text-sm border whitespace-nowrap min-h-[32px] ${!selectedGenre ? 'bg-white text-black border-white' : 'border-gray-600 hover:border-white'}`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-3 md:px-4 py-1 rounded-full text-xs md:text-sm border whitespace-nowrap min-h-[32px] ${selectedGenre === genre.id ? 'bg-white text-black border-white' : 'border-gray-600 hover:border-white'}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-800 animate-pulse rounded-sm" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-20 overflow-visible">
          {movies.map((movie) => (
            <MediaCard key={movie.id} item={movie} type="movie" />
          ))}
        </div>
      )}
    </div>
  );
}
