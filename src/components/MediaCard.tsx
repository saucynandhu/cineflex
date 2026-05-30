import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, Check, X, Calendar } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { cn, isUpcoming } from '../lib/utils';

let currentHoveredId: string | null = null;

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

export default function MediaCard({ item, type, listType, onRemove }: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const [popupReady, setPopupReady] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, width: 0 });
  const cardId = useRef(Math.random().toString(36));
  
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const { isInWatchLater, toggleWatchLater, removeFromWatchLater, removeFromContinueWatching, removeFromWatched } = useUserLists();
  
  const mediaType = (type && type !== 'all') ? type : (item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'));
  const id = Number(item.tmdbId || item.id);
  
  const releaseDate = item.release_date || item.first_air_date || item.year;
  const upcoming = isUpcoming(releaseDate);

  const getWatchPath = useCallback(() => {
    if (mediaType === 'tv') {
      return `/watch/tv/${id}/${item.season || 1}/${item.episode || 1}`;
    }
    return `/watch/movie/${id}`;
  }, [id, mediaType, item.season, item.episode]);

  const getDetailsPath = useCallback(() => `/${mediaType}/${id}`, [id, mediaType]);

  const clearTimers = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const closePopup = useCallback(() => {
    if (currentHoveredId === cardId.current) {
      currentHoveredId = null;
    }
    setHovered(false);
    setPopupReady(false);
    clearTimers();
  }, []);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    currentHoveredId = cardId.current;
    setHovered(true);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      if (currentHoveredId === cardId.current) {
        setPopupReady(true);
      }
    }, 150);

    const loop = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = rect.left;
        let top = rect.bottom;
        
        // Horizontal adjustment
        if (left + rect.width > vw - 8) left = vw - rect.width - 8;
        if (left < 8) left = 8;
        
        // Vertical adjustment (if too close to bottom, show above)
        if (top + 160 > vh - 20) {
          top = rect.top - 160;
        }

        setPopupPos({ x: left, y: top, width: rect.width });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleMouseLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(closePopup, 120);
  };

  const handleClick = () => {
    navigate(listType === 'continue_watching' ? getWatchPath() : getDetailsPath());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape') {
      closePopup();
    }
  };

  const handleRemoveAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(id, mediaType);
      return;
    }
    if (listType === 'continue_watching') removeFromContinueWatching(id, mediaType);
    else if (listType === 'watch_later') removeFromWatchLater(id, mediaType);
    else if (listType === 'watched') removeFromWatched(id, mediaType, item.season, item.episode);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`${item.title || item.name} details`}
        className={cn(
          "relative flex-none cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          hovered ? "z-[50]" : "z-[1]"
        )}
        style={{
          width: 'clamp(160px, 20vw, 240px)',
          aspectRatio: '16/9',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        {upcoming && (
          <div className="absolute top-2 left-2 z-[30] bg-[#E50914] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
            <Calendar size={10} />
            Upcoming
          </div>
        )}
        {(listType === 'continue_watching' || listType === 'watch_later' || listType === 'watched') && (
          <button
            onClick={handleRemoveAction}
            className={cn(
              "absolute top-2 right-2 z-[30] w-6 h-6 rounded-full bg-black/70 border border-white/30 text-white flex items-center justify-center cursor-pointer transition-all hover:bg-red-600/80",
              hovered ? "opacity-100" : "opacity-0"
            )}
            title="Remove from list"
          >
            <X size={14} />
          </button>
        )}

        <div
          className={cn(
            "w-full h-full overflow-hidden rounded-[4px] bg-[#141414] transition-transform duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
            hovered ? "scale-105" : "scale-100"
          )}
        >
          <img
            src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
            alt={item.title || item.name}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        </div>

        {listType === 'continue_watching' && item.type === 'tv' && item.season && (
          <div className="absolute bottom-2 left-2 z-[20] text-[11px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none">
            S{item.season}E{item.episode}
          </div>
        )}
      </div>

      {popupReady && currentHoveredId === cardId.current && createPortal(
        <div
          className="fixed z-[9999] bg-[#181818] rounded-b-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.8)] p-3 animate-[fadeInUp_0.2s_ease-out_forwards]"
          style={{
            top: popupPos.y,
            left: popupPos.x,
            width: popupPos.width,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              {!upcoming && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(getWatchPath());
                  }}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-none cursor-pointer hover:bg-white/80 transition-colors"
                  title="Play"
                >
                  <Play size={18} fill="black" className="ml-0.5" />
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchLater({
                    id: id,
                    tmdbId: id,
                    type: mediaType,
                    title: item.title || item.name,
                    posterPath: item.poster_path || item.posterPath,
                    backdropPath: item.backdrop_path || item.backdropPath,
                    year: (item.release_date || item.first_air_date || item.year || '').split('-')[0],
                    addedAt: Date.now()
                  });
                }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/50 text-white cursor-pointer hover:border-white transition-colors"
                title={isInWatchLater(id, mediaType) ? "Remove from My List" : "Add to My List"}
              >
                {isInWatchLater(id, mediaType) ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(getDetailsPath());
              }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/50 text-white cursor-pointer hover:border-white transition-colors ml-auto"
              title="More info"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-xs font-bold", upcoming ? "text-white/60" : "text-[#46d369]")}>
              {upcoming ? 'Coming Soon' : '98% Match'}
            </span>
            <span className="text-white text-xs">
              {(item.release_date || item.first_air_date || item.year || '').split('-')[0]}
            </span>
            {!upcoming && <span className="border border-white/40 px-1 text-[10px] text-white rounded-[2px]">HD</span>}
          </div>

          <h3 className="text-white text-sm font-bold truncate">
            {item.title || item.name}
          </h3>
          {listType === 'continue_watching' && item.episodeName && (
             <p className="text-gray-400 text-[10px] font-medium mt-1 truncate">
               {item.episodeName}
             </p>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
