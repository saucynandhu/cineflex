import { Play, Info } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface HeroSectionProps {
  movie: any;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const navigate = useNavigate();

  if (!movie) return <div className="h-[60vh] md:h-[85vh] w-full bg-[#141414] animate-pulse" />;

  const handlePlay = () => {
    navigate(`/watch/${movie.media_type || 'movie'}/${movie.id}`);
  };

  const handleInfo = () => {
    navigate(`/${movie.media_type || 'movie'}/${movie.id}`);
  };

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden z-[1]">
      <div className="absolute inset-0 z-[1]">
        <img
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title || movie.name}
          className="h-full w-full object-cover object-center"
        />
        {/* Gradient overlays to create depth and readability */}
        <div className="absolute inset-x-0 bottom-0 h-48 md:h-64 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent z-[1]" />
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent z-[1]" />
      </div>

      <div className="absolute bottom-[10%] md:bottom-[15%] left-4 md:left-12 max-w-xl flex flex-col gap-3 md:gap-4 z-[2] px-2 md:px-0">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-6xl font-bold drop-shadow-2xl text-white leading-tight"
        >
          {movie.title || movie.name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm md:text-lg text-gray-200 drop-shadow-md line-clamp-3 md:line-clamp-4 max-w-sm md:max-w-lg leading-relaxed md:leading-relaxed"
        >
          {movie.overview}
        </motion.p>

        <div className="flex items-center gap-2 md:gap-3 mt-2">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-white text-black px-4 md:px-8 py-2 md:py-3 rounded-md hover:bg-white/80 transition-all font-bold text-sm md:text-lg min-h-[44px]"
          >
            <Play size={20} className="md:w-6 md:h-6" fill="black" />
            Play
          </button>
          <button
            onClick={handleInfo}
            className="flex items-center gap-2 bg-gray-500/70 text-white px-4 md:px-8 py-2 md:py-3 rounded-md hover:bg-gray-500/50 transition-all font-bold text-sm md:text-lg backdrop-blur-sm min-h-[44px]"
          >
            <Info size={20} className="md:w-6 md:h-6" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
