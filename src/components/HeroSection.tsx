import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { getImageUrl, getTrending } from '../lib/tmdb';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export default function HeroSection({ genreMap = {} }: { genreMap?: Record<number, string> }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const transitionTimer = useRef<number | null>(null);

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
    if (movies.length === 0 || isTransitioning) return;
    const interval = setInterval(() => {
      triggerTransition((currentIndex + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies, currentIndex, isTransitioning]);

  const triggerTransition = (targetIndex: number) => {
    if (targetIndex === currentIndex || isTransitioning) return;
    
    setNextIndex(targetIndex);
    setIsTransitioning(true);

    // Preload the image
    const img = new Image();
    img.src = getImageUrl(movies[targetIndex]?.backdrop_path, 'original');
    img.onload = () => {
      // Small delay to ensure browser is ready to render
      transitionTimer.current = window.setTimeout(() => {
        setCurrentIndex(targetIndex);
        setNextIndex(null);
        setIsTransitioning(false);
      }, 50);
    };
  };

  if (loading || movies.length === 0) {
    return <div className="h-[85vh] bg-[#141414] animate-pulse" />;
  }

  const currentMovie = movies[currentIndex];

  const handlePlay = (movie: any) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    if (type === 'movie') {
      navigate(`/watch/movie/${movie.id}`);
    } else {
      navigate(`/watch/tv/${movie.id}/1/1`);
    }
  };

  const handleInfo = (movie: any) => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    navigate(`/${type}/${movie.id}`);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-[#141414] hero-container">
      {/* Global CSS transition override for this container to prevent flicker */}
      <style>{`
        .hero-container * { transition: none !important; }
      `}</style>

      <AnimatePresence initial={true}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={getImageUrl(currentMovie?.backdrop_path, 'original')}
              alt={currentMovie?.title || currentMovie?.name}
              className="h-full w-full object-cover object-top"
              loading="eager"
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent h-full" 
              style={{ background: 'linear-gradient(to top, #141414 0%, rgba(20,20,20,0.4) 25%, transparent 60%)' }} 
            />
          </div>

          {/* Content Layer */}
          <div className="absolute bottom-[20%] left-6 md:left-[60px] z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-[0.9] drop-shadow-2xl">
                {currentMovie?.title || currentMovie?.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4 items-center">
                {currentMovie?.genre_ids?.slice(0, 3).map((id: number, idx: number) => (
                  <span key={id} className="flex items-center text-sm text-white font-semibold">
                    {idx > 0 && <span className="mx-2 text-white/40 font-normal">•</span>}
                    {genreMap[id] || 'Genre'}
                  </span>
                ))}
              </div>

              <p className="text-base md:text-lg text-white/90 leading-snug mb-8 line-clamp-3 max-w-xl drop-shadow-md font-medium">
                {currentMovie?.overview}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePlay(currentMovie)}
                  className="flex items-center justify-center gap-3 bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-[4px] font-bold text-lg md:text-xl transition-all hover:bg-white/80 active:scale-95"
                >
                  <Play size={24} fill="black" />
                  Play
                </button>
                <button
                  onClick={() => handleInfo(currentMovie)}
                  className="flex items-center justify-center gap-3 bg-[#6d6d6e]/70 text-white px-8 md:px-10 py-3 md:py-4 rounded-[4px] font-bold text-lg md:text-xl transition-all hover:bg-[#6d6d6e]/40 active:scale-95"
                >
                  <Info size={24} />
                  More Info
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => triggerTransition(idx)}
            className={cn(
              "transition-all duration-500 rounded-full cursor-pointer",
              currentIndex === idx 
                ? "bg-white w-8 h-[6px]" 
                : "bg-white/30 w-[6px] h-[6px] hover:bg-white/60",
              nextIndex === idx && "animate-pulse bg-white/50 w-8"
            )}
            title={idx === currentIndex ? "Current Slide" : `Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
