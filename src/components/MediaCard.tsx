import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, ThumbsUp } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
}

export default function MediaCard({ item, type }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const mediaType = type || item.media_type || (item.first_air_date ? 'tv' : 'movie');

  const isTouchDevice = typeof window !== 'undefined' && (window.matchMedia('(hover: none)').matches || window.innerWidth < 768);

  const handleClick = () => {
    navigate(`/${mediaType}/${item.id}`);
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        ref={cardRef}
        className="relative flex-none w-[130px] sm:w-[160px] md:w-[220px] h-[73px] sm:h-[90px] md:h-[124px] cursor-pointer group transition-all duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <img
          src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
          alt={item.title || item.name}
          className="w-full h-full object-cover rounded-sm shadow-md transition-transform duration-300 md:group-hover:scale-105"
        />
      </div>

      {!isTouchDevice && isHovered && createPortal(
        <div
          className="fixed z-[9999]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            top: popupPos.top,
            left: popupPos.left,
            width: popupPos.width,
            transformOrigin: 'top center',
            animation: 'scaleYEntrance 0.2s ease-out forwards'
          }}
        >
          <div className="bg-[#181818] rounded-b-md shadow-2xl overflow-hidden">
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
                  <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors text-white">
                    <Plus size={14} />
                  </button>
                  <button className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors text-white">
                    <ThumbsUp size={14} />
                  </button>
                </div>
                <button 
                  onClick={handleClick}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white transition-colors text-white"
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

              <h3 className="text-[10px] md:text-xs font-bold truncate text-white">
                {item.title || item.name}
              </h3>
            </div>
          </div>
          
          <style>{`
            @keyframes scaleYEntrance {
              from { transform: scaleY(0.8); opacity: 0; }
              to { transform: scaleY(1); opacity: 1; }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}
