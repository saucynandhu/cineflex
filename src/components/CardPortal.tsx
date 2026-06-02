import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown, Check, X } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { cn } from '../lib/utils';

interface PortalData {
  item: any;
  rect: DOMRect;
  mediaType: string;
  id: number;
  upcoming: boolean;
  year: string;
  getWatchPath: string;
  getDetailsPath: string;
  isInWatchLater: boolean;
  listType?: string;
  onToggleWatchLater: () => void;
  onRemove?: () => void;
  onClose: () => void;
}

export default function CardPortal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleHover = (e: any) => {
      const detail = e.detail as PortalData;
      setData(detail);
      setIsExpanding(false);
      
      // Double rAF is essential for the browser to register the initial 1:1 position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsExpanding(true);
        });
      });
    };

    const handleTeardown = () => {
      if (data) closePortal();
    };

    window.addEventListener('media-card-hover', handleHover);
    window.addEventListener('resize', handleTeardown);
    window.addEventListener('scroll', handleTeardown, { passive: true });
    window.addEventListener('wheel', handleTeardown, { passive: true });
    window.addEventListener('popstate', handleTeardown);

    return () => {
      window.removeEventListener('media-card-hover', handleHover);
      window.removeEventListener('resize', handleTeardown);
      window.removeEventListener('scroll', handleTeardown);
      window.removeEventListener('wheel', handleTeardown);
      window.removeEventListener('popstate', handleTeardown);
    };
  }, [data]);

  const closePortal = () => {
    setIsExpanding(false);
    if (data) {
      data.onClose();
      setData(null);
    }
  };

  if (!data) return null;

  const { rect, item, upcoming, year, getWatchPath, getDetailsPath, isInWatchLater, onToggleWatchLater, onRemove, listType } = data;

  const widthScale = 1.3;
  const targetWidth = rect.width * widthScale;
  const targetLeft = Math.max(10, Math.min(window.innerWidth - targetWidth - 10, rect.left - (targetWidth - rect.width) / 2));
  
  const expandedImageHeight = targetWidth / (16 / 9);
  const contentHeight = 130; 
  const targetHeight = expandedImageHeight + contentHeight;

  let targetTop = rect.top - (targetHeight - rect.height) / 2;
  if (targetTop < 10) targetTop = 10;
  if (targetTop + targetHeight > window.innerHeight - 10) targetTop = window.innerHeight - targetHeight - 10;

  return (
    <div
      ref={portalRef}
      id="card-portal"
      className={cn(
        "fixed z-[9999] bg-[#181818] rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto",
        "transition-[top,left,width,height] duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[top,left,width,height]"
      )}
      style={{
        top: isExpanding ? targetTop : rect.top,
        left: isExpanding ? targetLeft : rect.left,
        width: isExpanding ? targetWidth : rect.width,
        height: isExpanding ? targetHeight : rect.height,
      }}
      onMouseLeave={closePortal}
      onClick={() => navigate(getDetailsPath)}
    >
      <div className="relative aspect-video w-full h-auto overflow-hidden">
        <img
          src={getImageUrl((item.backdrop_path || item.backdropPath) || (item.poster_path || item.posterPath), 'w500')}
          alt={item.title || item.name}
          className="w-full h-full object-cover transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
      </div>

      <div className={cn(
        "p-4 space-y-4 transition-opacity duration-300 ease-in-out",
        isExpanding ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!upcoming && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(getWatchPath);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-white/80 transition-colors"
                title="Play"
              >
                <Play size={20} fill="black" stroke="black" className="ml-0.5" />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchLater();
              }}
              className="w-9 h-9 rounded-full bg-[#2a2a2a] border-2 border-white/50 flex items-center justify-center text-white hover:border-white transition-colors"
              title={isInWatchLater ? "Remove from My List" : "Add to My List"}
            >
              {isInWatchLater ? <Check size={20} /> : <Plus size={20} />}
            </button>
            {onRemove && (listType === 'continue_watching' || listType === 'watch_later' || listType === 'watched') && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                  closePortal();
                }}
                className="w-9 h-9 rounded-full bg-[#2a2a2a] border-2 border-white/50 flex items-center justify-center text-white hover:border-white hover:bg-red-600/20 transition-colors"
                title="Remove from list"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(getDetailsPath);
            }}
            className="w-9 h-9 rounded-full bg-[#2a2a2a] border-2 border-white/50 flex items-center justify-center text-white hover:border-white transition-colors"
            title="More info"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold", upcoming ? "text-white/60" : "text-[#46d369]")}>
            {upcoming ? 'Coming Soon' : '98% Match'}
          </span>
          <span className="text-white text-xs font-semibold">{year}</span>
          {!upcoming && <span className="border border-white/40 px-1.5 py-0.5 text-[9px] text-white rounded-[2px] font-bold">HD</span>}
        </div>

        <h3 className="text-white text-base font-bold truncate">
          {item.title || item.name}
        </h3>
      </div>
    </div>
  );
}
