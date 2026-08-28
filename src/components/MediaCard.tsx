import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Check, X } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { isUpcoming } from '../lib/utils';
import { cn } from '../lib/utils';
import { MediaCardItem, StoredMediaItem } from '../types/tmdb';

interface MediaCardProps {
  item: MediaCardItem;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

/** Type-guard: does this item come from the Zustand store (camelCase fields)? */
function isStoredItem(item: MediaCardItem): item is StoredMediaItem {
  return 'tmdbId' in item && 'posterPath' in item;
}

export default function MediaCard({ item, type, listType, onRemove }: MediaCardProps) {
  const navigate = useNavigate();
  const { toggleWatchLater, isInWatchLater, removeFromContinueWatching } = useUserLists();
  
  const mediaType = (type && type !== 'all') ? type : (isStoredItem(item) ? item.type : (item.media_type || (item.first_air_date ? 'tv' : 'movie')));
  const id = Number(isStoredItem(item) ? item.tmdbId : item.id);
  const title = item.title || item.name || '';
  const releaseDate = isStoredItem(item) ? item.year : (item.release_date || item.first_air_date);
  const upcoming = !isStoredItem(item) && isUpcoming(item.release_date || item.first_air_date);
  const inList = isInWatchLater(id, mediaType);

  const getWatchPath = useCallback(() => {
    if (mediaType === 'tv') {
      const season = isStoredItem(item) ? item.season : undefined;
      const episode = isStoredItem(item) ? item.episode : undefined;
      return `/watch/tv/${id}/${season || 1}/${episode || 1}`;
    }
    return `/watch/movie/${id}`;
  }, [id, mediaType, item]);

  const getDetailsPath = useCallback(() => `/${mediaType}/${id}`, [id, mediaType]);

  const handleClick = () => {
    if (upcoming) {
      navigate(getDetailsPath());
      return;
    }
    navigate(listType === 'continue_watching' ? getWatchPath() : getDetailsPath());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleClick();
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upcoming) {
      navigate(getDetailsPath());
      return;
    }
    navigate(getWatchPath());
  };

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchLater({
      id: id,
      tmdbId: id,
      type: mediaType,
      title: title,
      posterPath: isStoredItem(item) ? item.posterPath : item.poster_path,
      backdropPath: isStoredItem(item) ? item.backdropPath : item.backdrop_path,
      year: (releaseDate || '').split('-')[0],
      addedAt: Date.now()
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(id, mediaType);
    } else if (listType === 'continue_watching') {
      removeFromContinueWatching(id, mediaType);
    }
  };

  const backdropOrPoster = isStoredItem(item)
    ? (item.backdropPath || item.posterPath)
    : (item.backdrop_path || item.poster_path);

  return (
    <div
      className="card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
    >
      <div className="card__image-wrapper">
        <img 
          className="card__image" 
          src={getImageUrl(backdropOrPoster, 'w500')}
          alt={title}
          loading="lazy"
        />

        {upcoming && (
          <div className="card__upcoming-badge">
            <Calendar size={10} />
            Upcoming
          </div>
        )}

        <div className="card__action-row">
          <button 
            type="button"
            className={cn("card__action-btn", inList && "active")}
            onClick={handleToggleList}
            title={inList ? "Remove from List" : "Add to List"}
            aria-label={inList ? "Remove from List" : "Add to List"}
          >
            {inList ? <Check size={18} /> : <Plus size={18} />}
          </button>
          {listType === 'continue_watching' && (
            <button 
              type="button"
              className="card__action-btn"
              onClick={handleRemove}
              title="Remove from Continue Watching"
              aria-label="Remove from Continue Watching"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="card__image-overlay">
          <div className="card__overlay-left">
            <span className="card__overlay-title">{title}</span>
          </div>
          <button 
            type="button"
            className="card__overlay-play" 
            aria-label="Play"
            onClick={handlePlayClick}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
