import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, ThumbsUp } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
}

export default function MediaCard({ item, type }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const mediaType = type || item.media_type || (item.first_air_date ? 'tv' : 'movie');

  const handleClick = () => {
    navigate(`/${mediaType}/${item.id}`);
  };

  return (
    <div
      className="relative flex-none w-[160px] sm:w-[200px] md:w-[240px] h-[90px] sm:h-[112px] md:h-[135px] cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: isHovered ? 100 : 1 }}
    >
      <img
        src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
        alt={item.title || item.name}
        className="w-full h-full object-cover rounded-sm shadow-md transition-transform duration-300 group-hover:scale-105"
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 w-full bg-[#181818] rounded-md shadow-2xl overflow-hidden z-[100] origin-bottom"
          >
            <div className="relative h-24 sm:h-32">
              <img
                src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                alt={item.title || item.name}
                className="w-full h-full object-cover"
                onClick={handleClick}
              />
            </div>
            
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/watch/${mediaType}/${item.id}`);
                    }}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Play size={14} fill="black" className="ml-0.5" />
                  </button>
                  <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                  onClick={handleClick}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold">
                <span className="text-green-500">{(item.vote_average * 10).toFixed(0)}% Match</span>
                <span className="text-gray-400">
                  {item.release_date || item.first_air_date ? (item.release_date || item.first_air_date).split('-')[0] : 'N/A'}
                </span>
                <span className="uppercase text-[8px] text-gray-300 border border-gray-500 px-1">
                  HD
                </span>
              </div>

              <h3 className="text-[10px] md:text-xs font-bold truncate">
                {item.title || item.name}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
