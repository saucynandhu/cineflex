import { useRef, type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

interface MediaRowProps {
  title: string;
  items: any[];
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

const MediaRow: FC<MediaRowProps> = ({ title, items, type, listType, onRemove }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 md:mb-8 px-4 md:px-12 group overflow-visible relative z-10 hover:z-[100]">
      <h2 className="text-sm sm:text-base md:text-xl font-semibold text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 group/title mt-4 md:mt-8 mb-2 md:mb-4">
        {title}
        <ChevronRight size={18} className="md:opacity-0 md:group-hover/title:opacity-100 transition-opacity md:translate-x-[-10px] md:group-hover/title:translate-x-0" />
      </h2>
      
      <div className="relative overflow-visible z-10">
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-[10000] bg-black/40 w-10 md:w-12 h-[90px] sm:h-[112px] md:h-[135px] items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 rounded-r-md"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="overflow-visible relative">
          <div
            ref={rowRef}
            className="flex items-center gap-2 md:gap-3 overflow-x-auto overflow-y-visible scrollbar-hide snap-x scroll-smooth pb-4 touch-pan-x"
          >
            {items.map((item) => (
              <div key={`${item.tmdbId || item.id}-${item.type || type}`} className="snap-start overflow-visible py-1">
                <MediaCard item={item} type={type} listType={listType} onRemove={onRemove} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-[10000] bg-black/40 w-10 md:w-12 h-[90px] sm:h-[112px] md:h-[135px] items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 rounded-l-md"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default MediaRow;
