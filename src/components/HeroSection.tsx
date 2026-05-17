import { Play, Info } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface HeroSectionProps {
  movie: any;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const navigate = useNavigate();

  if (!movie) return <div className="h-[85vh] w-full bg-[#141414] animate-pulse" />;

  const handlePlay = () => {
    navigate(`/watch/${movie.media_type || 'movie'}/${movie.id}`);
  };

  const handleInfo = () => {
    navigate(`/${movie.media_type || 'movie'}/${movie.id}`);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title || movie.name}
          className="h-full w-full object-cover"
        />
        {/* Gradient overlays to create depth and readability */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#141414] to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
      </div>

      <div className="absolute bottom-[15%] left-4 md:left-12 max-w-xl flex flex-col gap-4 z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold drop-shadow-2xl text-white"
        >
          {movie.title || movie.name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-lg text-gray-200 drop-shadow-md line-clamp-3 md:line-clamp-4 max-w-lg leading-relaxed"
        >
          {movie.overview}
        </motion.p>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-md hover:bg-white/80 transition-all font-bold text-lg"
          >
            <Play size={24} fill="black" />
            Play
          </button>
          <button
            onClick={handleInfo}
            className="flex items-center gap-2 bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded-md hover:bg-gray-500/50 transition-all font-bold text-lg backdrop-blur-sm"
          >
            <Info size={24} />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}
