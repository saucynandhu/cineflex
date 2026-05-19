import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { getImageUrl, getTrending } from '../lib/tmdb';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export default function HeroSection({ genreMap = {} }: { genreMap?: Record<number, string> }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHeroMovies() {
      try {
        const trending = await getTrending('all', 'week');
        setMovies(trending.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch hero movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHeroMovies();
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies]);

  if (loading || movies.length === 0) {
    return <div className="h-[85vh] bg-[#141414] animate-pulse" />;
  }

  const currentMovie = movies[currentIndex];
  const type = currentMovie.media_type || (currentMovie.first_air_date ? 'tv' : 'movie');

  const handlePlay = () => {
    if (type === 'movie') {
      navigate(`/watch/movie/${currentMovie.id}`);
    } else {
      navigate(`/watch/tv/${currentMovie.id}/1/1`);
    }
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-[#141414]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(currentMovie.backdrop_path, 'original')}
            alt={currentMovie.title || currentMovie.name}
            className="h-full w-full object-cover object-top"
          />
          
          {/* Refined Overlays */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/50 to-transparent h-full" style={{ background: 'linear-gradient(to top, #141414 0%, rgba(20,20,20,0.5) 20%, transparent 50%)' }} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-[15%] left-6 md:left-[60px] z-10 max-w-lg">
        <motion.div
          key={currentIndex + '-content'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight leading-tight text-shadow-netflix drop-shadow-2xl">
            {currentMovie.title || currentMovie.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-3 items-center">
            {currentMovie.genre_ids?.slice(0, 3).map((id: number, idx: number) => (
              <span key={id} className="flex items-center text-xs text-white/80 font-medium">
                {idx > 0 && <span className="mx-2 text-white/40">•</span>}
                {genreMap[id] || 'Genre'}
              </span>
            ))}
          </div>

          <p className="text-sm md:text-base text-white/80 leading-relaxed mb-6 line-clamp-3 max-w-md drop-shadow-md">
            {currentMovie.overview}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded font-bold text-sm md:text-lg transition-all hover:bg-white/75"
            >
              <Play size={20} fill="black" />
              Play
            </button>
            <button
              onClick={() => navigate(`/${type}/${currentMovie.id}`)}
              className="flex items-center justify-center gap-2 bg-[#6d6d6e]/70 text-white px-6 md:px-8 py-2 md:py-3 rounded font-bold text-sm md:text-lg transition-all hover:bg-[#6d6d6e]/40"
            >
              <Info size={20} />
              More Info
            </button>
          </div>
        </motion.div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "transition-all duration-300 rounded-full",
              currentIndex === idx 
                ? "bg-white w-6 h-[6px] rounded-[3px]" 
                : "bg-white/40 w-[6px] h-[6px]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
