import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, Check, X, Calendar } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { cn, isUpcoming } from '../lib/utils';

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

export default function MediaCard({ item, type, listType, onRemove }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const { isInWatchLater, toggleWatchLater, removeFromWatchLater, removeFromContinueWatching, removeFromWatched } = useUserLists();
  
  const mediaType = (type && type !== 'all') ? type : (item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'));
  const id = Number(item.tmdbId || item.id);
  
  const releaseDate = item.release_date || item.first_air_date || item.year;
  const upcoming = isUpcoming(releaseDate);
  const year = (releaseDate || '').split('-')[0];

  const getWatchPath = useCallback(() => {
    if (mediaType === 'tv') {
      return `/watch/tv/${id}/${item.season || 1}/${item.episode || 1}`;
    }
    return `/watch/movie/${id}`;
  }, [id, mediaType, item.season, item.episode]);

  const getDetailsPath = useCallback(() => `/${mediaType}/${id}`, [id, mediaType]);

  const handleMouseEnter = () => {
    // Check if it's desktop (pointer: fine)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      openPortal();
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const openPortal = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setIsHovered(true);
    
    // Custom event to communicate with the global portal
    window.dispatchEvent(new CustomEvent('media-card-hover', {
      detail: {
        item,
        rect,
        mediaType,
        id,
        upcoming,
        year,
        getWatchPath: getWatchPath(),
        getDetailsPath: getDetailsPath(),
        isInWatchLater: isInWatchLater(id, mediaType),
        listType,
        onToggleWatchLater: () => toggleWatchLater({
          id: id,
          tmdbId: id,
          type: mediaType,
          title: item.title || item.name,
          posterPath: item.poster_path || item.posterPath,
          backdropPath: item.backdrop_path || item.backdropPath,
          year: year,
          addedAt: Date.now()
        }),
        onClose: () => setIsHovered(false)
      }
    }));
  };

  const handleClick = () => {
    navigate(listType === 'continue_watching' ? getWatchPath() : getDetailsPath());
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

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative flex-none cursor-pointer transition-opacity duration-300",
        isHovered ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{
        width: 'clamp(160px, 20vw, 240px)',
        aspectRatio: '16/9',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="w-full h-full overflow-hidden rounded-[4px] bg-[#141414] relative">
        <img
          src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
          alt={item.title || item.name}
          className="w-full h-full object-cover block"
          loading="lazy"
        />

        {/* Mobile Title Overlay (md:hidden as per plan) */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:hidden">
          <h3 className="text-white text-[11px] font-bold truncate">
            {item.title || item.name}
          </h3>
          <p className="text-gray-300 text-[9px] font-medium">
            {year}
          </p>
        </div>

        {upcoming && (
          <div className="absolute top-2 left-2 z-10 bg-[#E50914] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
            <Calendar size={10} />
            Upcoming
          </div>
        )}

        {listType === 'continue_watching' && item.type === 'tv' && item.season && (
          <div className="absolute bottom-2 left-2 z-10 text-[11px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] md:hidden">
            S{item.season}E{item.episode}
          </div>
        )}
      </div>

      {(listType === 'continue_watching' || listType === 'watch_later' || listType === 'watched') && (
        <button
          onClick={handleRemoveAction}
          className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/70 border border-white/30 text-white flex items-center justify-center cursor-pointer opacity-100 hover:bg-red-600/80 md:hidden"
          title="Remove from list"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
