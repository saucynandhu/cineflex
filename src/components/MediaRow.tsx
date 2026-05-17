import { useRef, type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

interface MediaRowProps {
  title: string;
  items: any[];
  type?: 'movie' | 'tv' | 'all';
}

const MediaRow: FC<MediaRowProps> = ({ title, items, type }) => {
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
    <div className="mb-10 md:mb-12 px-4 md:px-12 group overflow-visible relative">
      <h2 className="text-lg md:text-xl font-semibold text-white/90 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 group/title mt-6 md:mt-8 mb-2 md:mb-4">
        {title}
        <ChevronRight size={18} className="opacity-0 group-hover/title:opacity-100 transition-opacity translate-x-[-10px] group-hover/title:translate-x-0" />
      </h2>
      
      <div className="relative overflow-visible">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-[60] bg-black/40 w-10 md:w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <ChevronLeft size={32} />
        </button>

        <div
          ref={rowRef}
          className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide snap-x scroll-smooth pb-4"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start overflow-visible py-2">
              <MediaCard item={item} type={type} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-[60] bg-black/40 w-10 md:w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default MediaRow;
