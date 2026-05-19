import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown, Bookmark, BookmarkCheck, Check, X, Info } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { cn } from '../lib/utils';

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
        
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setIsHovered(false);
          return;
        }

        setPopupPos({
          top: rect.top,
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
    navigate(`/${mediaType}/${item.id || item.tmdbId}`);
  };

  return (
    <>
      <div
        className="relative flex-none w-[160px] sm:w-[200px] md:w-[240px] aspect-video cursor-pointer transition-all duration-300 group/card"
        onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <img
          ref={cardRef}
          src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
          alt={item.title || item.name}
          className="w-full h-full object-cover rounded-sm shadow-md"
        />
        
        {/* Continue Watching Label */}
        {listType === 'continue_watching' && item.type === 'tv' && item.season && item.episode && (
          <div className="absolute bottom-2 left-2 text-[10px] md:text-xs font-medium text-white drop-shadow-lg">
            S{item.season}:E{item.episode}
          </div>
        )}

        {/* Progress Bar (Continue Watching) */}
        {listType === 'continue_watching' && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/30">
            <div 
              className="h-full bg-[#E50914]" 
              style={{ width: `${item.progress || 30}%` }} 
            />
          </div>
        )}

        {/* List Page Remove Button */}
        {(listType === 'watch_later' || listType === 'watched') && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-black/70 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover/card:opacity-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Hover Portal */}
      {!isTouchDevice && isHovered && createPortal(
        <div
          className="fixed z-[9999] transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            top: popupPos.top - 50,
            left: popupPos.left - 20,
            width: popupPos.width + 40,
            transformOrigin: 'center center',
          }}
        >
          <div className="bg-[#181818] rounded-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="aspect-video w-full relative">
              <img
                src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
                alt={item.title || item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (mediaType === 'tv') {
                        navigate(`/watch/tv/${item.tmdbId || item.id}/${item.season || 1}/${item.episode || 1}`);
                      } else {
                        navigate(`/watch/movie/${item.tmdbId || item.id}`);
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <Play size={18} fill="black" className="ml-0.5" />
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
                    className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white transition-colors"
                  >
                    {isInWatchLater(item.tmdbId || item.id, mediaType) ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
                <button 
                  onClick={() => navigate(`/${mediaType}/${item.tmdbId || item.id}`)}
                  className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold">
                  <span className="text-green-500">98% Match</span>
                  <span className="text-white">{(item.release_date || item.first_air_date || item.year || '').split('-')[0]}</span>
                  <span className="border border-white/40 px-1 text-[8px] uppercase">HD</span>
                </div>
                <h3 className="text-sm font-bold text-white truncate">{item.title || item.name}</h3>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
