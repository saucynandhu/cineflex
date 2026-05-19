import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, Check, X } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';

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
  const rafRef = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const { isInWatchLater, toggleWatchLater, removeFromWatchLater, removeFromContinueWatching, removeFromWatched } = useUserLists();
  
  const mediaType = (type && type !== 'all') ? type : (item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'));
  const id = Number(item.tmdbId || item.id);

  const handleMouseEnter = () => {
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
        let left = rect.left;
        if (left + rect.width > vw - 8) left = vw - rect.width - 8;
        if (left < 8) left = 8;
        setPopupPos({ x: left, y: rect.bottom, width: rect.width });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleMouseLeave = () => {
    if (currentHoveredId === cardId.current) {
      currentHoveredId = null;
    }
    setHovered(false);
    setPopupReady(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handleClick = () => {
    navigate(`/${mediaType}/${id}`);
  };

  const handleRemoveAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(id, mediaType);
      return;
    }
    if (listType === 'continue_watching') removeFromContinueWatching(id, mediaType);
    else if (listType === 'watch_later') removeFromWatchLater(id, mediaType);
    else if (listType === 'watched') removeFromWatched(id, mediaType);
  };

  return (
    <>
      {/* OUTER — handles hover detection, position reference, z-index */}
      <div
        ref={cardRef}
        className="relative flex-none cursor-pointer"
        style={{
          width: 'clamp(160px, 20vw, 240px)',
          aspectRatio: '16/9',
          zIndex: hovered ? 50 : 1,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* X REMOVE BUTTON — child of outer, never affected by scale */}
        {(listType === 'continue_watching' || listType === 'watch_later' || listType === 'watched') && (
          <button
            onClick={handleRemoveAction}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 30,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229,9,20,0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
          >
            <X size={14} />
          </button>
        )}

        {/* INNER SCALE WRAPPER — ONLY this element scales */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: '4px',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
            backgroundColor: '#141414',
          }}
        >
          <img
            src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
            alt={item.title || item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Progress Bar (Continue Watching) */}
          {listType === 'continue_watching' && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.3)' }}>
              <div 
                style={{ height: '100%', background: '#E50914', width: `${item.progress || 30}%`, transition: 'width 0.3s ease' }} 
              />
            </div>
          )}
        </div>

        {/* EPISODE LABEL for Continue Watching TV shows */}
        {listType === 'continue_watching' && item.type === 'tv' && item.season && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            zIndex: 20,
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
          }}>
            S{item.season}E{item.episode}
          </div>
        )}
      </div>

      {/* PORTAL POPUP — completely outside the card DOM tree */}
      {popupReady && currentHoveredId === cardId.current && createPortal(
        <div
          style={{
            position: 'fixed',
            top: popupPos.y,
            left: popupPos.x,
            width: popupPos.width,
            zIndex: 9999,
            background: '#181818',
            borderRadius: '0 0 6px 6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
            padding: '12px',
            animation: 'fadeInUp 0.2s ease-out forwards',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (mediaType === 'tv') {
                    navigate(`/watch/tv/${id}/${item.season || 1}/${item.episode || 1}`);
                  } else {
                    navigate(`/watch/movie/${id}`);
                  }
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Play size={18} fill="black" style={{ marginLeft: '2px' }} />
              </button>
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
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {isInWatchLater(id, mediaType) ? <Check size={18} /> : <Plus size={18} />}
              </button>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white',
                marginLeft: 'auto',
                cursor: 'pointer'
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: '#46d369', fontSize: '12px', fontWeight: 'bold' }}>98% Match</span>
            <span style={{ color: 'white', fontSize: '12px' }}>
              {(item.release_date || item.first_air_date || item.year || '').split('-')[0]}
            </span>
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', padding: '0 4px', fontSize: '10px', color: 'white' }}>HD</span>
          </div>

          <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title || item.name}
          </h3>
        </div>,
        document.body
      )}
    </>
  );
}
