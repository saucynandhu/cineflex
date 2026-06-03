import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Play, X } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { cn, isUpcoming } from '../lib/utils';

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  layout?: 'row' | 'grid';
  onRemove?: (id: number, type: string) => void;
}

function getProgressPercent(item: any): number {
  const explicitProgress = Number(item.progress);
  if (Number.isFinite(explicitProgress) && explicitProgress > 0) {
    return Math.max(0, Math.min(100, explicitProgress));
  }

  const currentTime = Number(item.currentTime);
  const duration = Number(item.duration);
  if (Number.isFinite(currentTime) && Number.isFinite(duration) && duration > 0) {
    return Math.max(0, Math.min(100, (currentTime / duration) * 100));
  }

  return 0;
}

export default function MediaCard({ item, type, listType, layout = 'row', onRemove }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const { isInWatchLater, toggleWatchLater, removeFromWatchLater, removeFromContinueWatching, removeFromWatched } = useUserLists();
  
  const mediaType = ((type && type !== 'all') ? type : (item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'))) as 'movie' | 'tv';
  const id = Number(item.tmdbId || item.id);
  const title = item.title || item.name;
  const imagePath = (item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath);
  
  const releaseDate = item.release_date || item.first_air_date || item.year;
  const upcoming = isUpcoming(releaseDate);
  const year = (releaseDate || '').split('-')[0];
  const progressPercent = getProgressPercent(item);
  const hasProgress = listType === 'continue_watching' && progressPercent > 0;
  const episodeLabel = mediaType === 'tv' && item.season && item.episode ? `S${item.season}:E${item.episode}` : null;
  const showTitleOverlay = layout === 'grid' || listType === 'continue_watching';

  const getWatchPath = useCallback(() => {
    if (mediaType === 'tv') {
      return `/watch/tv/${id}/${item.season || 1}/${item.episode || 1}`;
    }
    return `/watch/movie/${id}`;
  }, [id, mediaType, item.season, item.episode]);

  const getDetailsPath = useCallback(() => `/${mediaType}/${id}`, [id, mediaType]);

  const handleMouseEnter = () => {
    if (layout !== 'row') return;
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
        progressPercent,
        episodeLabel,
        getWatchPath: getWatchPath(),
        getDetailsPath: getDetailsPath(),
        isInWatchLater: isInWatchLater(id, mediaType),
        listType,
        onToggleWatchLater: () => toggleWatchLater({
          id: id,
          tmdbId: id,
          type: mediaType,
          title,
          posterPath: item.poster_path || item.posterPath,
          backdropPath: item.backdrop_path || item.backdropPath,
          year: year,
          addedAt: Date.now()
        }),
        onRemove: () => {
          if (onRemove) {
            onRemove(id, mediaType);
            return;
          }
          if (listType === 'continue_watching') removeFromContinueWatching(id, mediaType);
          else if (listType === 'watch_later') removeFromWatchLater(id, mediaType);
          else if (listType === 'watched') removeFromWatched(id, mediaType, item.season, item.episode);
        },
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
        'relative cursor-pointer transition-opacity duration-300 group/card',
        layout === 'row' ? 'flex-none' : 'w-full',
        isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      style={layout === 'row' ? { width: 'clamp(160px, 20vw, 248px)', aspectRatio: '16/9' } : { aspectRatio: '16/9' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative w-full h-full overflow-hidden rounded-[4px] bg-[#181818] shadow-[0_8px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] transition-all duration-300 group-hover/card:ring-white/20 group-hover/card:brightness-110">
        <img
          src={getImageUrl(imagePath, 'w500')}
          alt={title}
          className="w-full h-full object-cover block transition-transform duration-500 group-hover/card:scale-[1.04]"
          loading="lazy"
        />

        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300',
          showTitleOverlay ? 'opacity-100' : 'opacity-70 md:opacity-0 md:group-hover/card:opacity-100'
        )} />

        {!upcoming && (
          <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl">
              <Play size={18} fill="black" className="ml-0.5" />
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 right-10 flex flex-wrap gap-1.5 z-10">
          {upcoming && (
            <div className="bg-[#E50914] text-white text-[9px] font-black px-2 py-0.5 rounded-sm shadow-lg flex items-center gap-1 uppercase tracking-wider">
              <Calendar size={10} />
              Upcoming
            </div>
          )}
          {episodeLabel && (
            <div className="bg-black/70 text-white text-[9px] font-black px-2 py-0.5 rounded-sm shadow-lg uppercase tracking-wider backdrop-blur-sm">
              {episodeLabel}
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 md:p-3">
          <h3 className={cn(
            'text-white font-black leading-tight truncate [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]',
            layout === 'grid' ? 'text-xs md:text-sm' : 'text-[11px] md:text-xs',
            !showTitleOverlay && 'md:opacity-0 md:group-hover/card:opacity-100 transition-opacity'
          )}>
            {title}
          </h3>
          <div className={cn(
            'mt-1 flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-white/70',
            !showTitleOverlay && 'md:opacity-0 md:group-hover/card:opacity-100 transition-opacity'
          )}>
            {year && <span>{year}</span>}
            {!upcoming && <span className="rounded-[2px] border border-white/30 px-1 text-white/80">HD</span>}
            {listType === 'continue_watching' && hasProgress && <span>{Math.round(progressPercent)}%</span>}
          </div>
        </div>

        {hasProgress && (
          <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/20">
            <div className="h-full bg-[#E50914]" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {(listType === 'continue_watching' || listType === 'watch_later' || listType === 'watched') && (
        <button
          onClick={handleRemoveAction}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/75 border border-white/20 text-white flex items-center justify-center cursor-pointer opacity-100 hover:bg-[#E50914] hover:border-[#E50914] transition-colors"
          title="Remove from list"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
