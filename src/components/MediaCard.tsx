import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Check, X } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { isUpcoming } from '../lib/utils';
import { cn } from '../lib/utils';

interface MediaCardProps {
  item: any;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

export default function MediaCard({ item, type, listType, onRemove }: MediaCardProps) {
  const navigate = useNavigate();
  const { toggleWatchLater, isInWatchLater, removeFromContinueWatching } = useUserLists();
  
  const mediaType = (type && type !== 'all') ? type : (item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'));
  const id = Number(item.tmdbId || item.id);
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date || item.year;
  const upcoming = isUpcoming(releaseDate);
  const inList = isInWatchLater(id, mediaType);

  const getWatchPath = useCallback(() => {
    if (mediaType === 'tv') {
      return `/watch/tv/${id}/${item.season || 1}/${item.episode || 1}`;
    }
    return `/watch/movie/${id}`;
  }, [id, mediaType, item.season, item.episode]);

  const getDetailsPath = useCallback(() => `/${mediaType}/${id}`, [id, mediaType]);

  const handleClick = () => {
    if (upcoming) {
      navigate(getDetailsPath());
      return;
    }
    navigate(listType === 'continue_watching' ? getWatchPath() : getDetailsPath());
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
      posterPath: item.poster_path || item.posterPath,
      backdropPath: item.backdrop_path || item.backdropPath,
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

  return (
    <div className="card" onClick={handleClick}>
      <div className="card__image-wrapper">
        <img 
          className="card__image" 
          src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
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
            className={cn("card__action-btn", inList && "active")}
            onClick={handleToggleList}
            title={inList ? "Remove from List" : "Add to List"}
          >
            {inList ? <Check size={18} /> : <Plus size={18} />}
          </button>
          {listType === 'continue_watching' && (
            <button 
              className="card__action-btn"
              onClick={handleRemove}
              title="Remove from Continue Watching"
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
