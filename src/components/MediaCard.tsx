import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, ThumbsUp, Bookmark, BookmarkCheck, Check, X } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

export default function MediaCard({ item, type, listType, onRemove }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });
  const cardRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const mediaType = (type && type !== 'all') ? type : (item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'));

  const { isInWatchLater, toggleWatchLater, removeFromWatchLater, removeFromContinueWatching, removeFromWatched, isWatched } = useUserLists();

  const isTouchDevice = typeof window !== 'undefined' && (window.matchMedia('(hover: none)').matches || window.innerWidth < 768);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = Number(item.tmdbId || item.id);
    
    if (onRemove) {
      onRemove(id, mediaType);
      return;
    }

    if (listType === 'continue_watching') {
      removeFromContinueWatching(id, mediaType);
    } else if (listType === 'watch_later') {
      removeFromWatchLater(id, mediaType);
    } else if (listType === 'watched') {
      removeFromWatched(id, mediaType);
    }
  };

  useEffect(() => {
    if (!isHovered || isTouchDevice) return;

    let frameId: number;
    const updatePosition = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        
        // Hide popup if card scrolls out of viewport
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setIsHovered(false);
          return;
        }

        setPopupPos({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
      frameId = requestAnimationFrame(updatePosition);
    };

    frameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered, isTouchDevice]);

  const handleClick = () => {
    navigate(`/${mediaType}/${item.id}`);
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        className="relative flex-none w-[130px] sm:w-[160px] md:w-[220px] h-[73px] sm:h-[90px] md:h-[124px] cursor-pointer group transition-all duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <img
          ref={cardRef}
          src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
          alt={item.title || item.name}
          className="w-full h-full object-cover rounded-sm shadow-md transition-transform duration-300 md:group-hover:scale-105"
        />
        {isWatched(item.tmdbId || item.id, mediaType) && (
          <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 z-20">
            <Check size={10} className="text-green-500" />
            <span className="text-[8px] font-bold text-white uppercase">Watched</span>
          </div>
        )}
        {item.season && item.episode && (
          <div className="absolute bottom-1 left-1 bg-[#E50914] px-1.5 py-0.5 rounded text-[8px] font-black text-white shadow-lg z-20">
            S{item.season} E{item.episode}
          </div>
        )}
        {(listType === 'continue_watching' || listType === 'watch_later' || listType === 'watched') && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-black/70 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-[#E50914] transition-all z-30 opacity-0 group-hover:opacity-100"
            title="Remove"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
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
                      if (mediaType === 'tv') {
                        const s = item.season || 1;
                        const ep = item.episode || 1;
                        navigate(`/watch/tv/${item.tmdbId || item.id}/${s}/${ep}`);
                      } else {
                        navigate(`/watch/movie/${item.tmdbId || item.id}`);
                      }
                    }}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Play size={14} fill="black" className="ml-0.5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchLater({
                        id: item.tmdbId || item.id,
                        tmdbId: item.tmdbId || item.id,
                        type: mediaType,
                        title: item.title || item.name,
                        posterPath: item.poster_path || item.posterPath,
                        backdropPath: item.backdrop_path || item.backdropPath,
                        year: (item.release_date || item.first_air_date || item.year || '').split('-')[0],
                        addedAt: Date.now()
                      });
                    }}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#333] border border-gray-600 flex items-center justify-center hover:border-white transition-colors"
                  >
                    {isInWatchLater(item.tmdbId || item.id, mediaType) ? (
                      <BookmarkCheck size={14} fill="white" />
                    ) : (
                      <Bookmark size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold">
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
