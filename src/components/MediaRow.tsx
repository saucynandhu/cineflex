import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import SkeletonRow from './SkeletonRow';
import { cn } from '../lib/utils';

interface MediaRowProps {
  title: string;
  items?: any[];
  fetchFn?: () => Promise<any[]>;
  type?: 'movie' | 'tv' | 'all';
  listType?: 'continue_watching' | 'watch_later' | 'watched';
  onRemove?: (id: number, type: string) => void;
}

export default function MediaRow({ title, items: initialItems, fetchFn, type, listType, onRemove }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems && !!fetchFn);
  const [hasLoaded, setHasLoaded] = useState(!!initialItems);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      setHasLoaded(true);
      setLoading(false);
    }
  }, [initialItems]);

  useEffect(() => {
    if (hasLoaded || !fetchFn || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadData();
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasLoaded, fetchFn]);

  const loadData = async () => {
    if (!fetchFn) return;
    setLoading(true);
    try {
      const data = await fetchFn();
      setItems(data);
      setHasLoaded(true);
    } catch (err) {
      console.error(`Failed to fetch items for row: ${title}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        
        // If it's a vertical scroll, convert to horizontal
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 2;
        }
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);

  if (!loading && hasLoaded && items.length === 0 && !initialItems) return null;
  
  if (loading && !hasLoaded) {
    return <div ref={containerRef}><SkeletonRow title={title} /></div>;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative space-y-2 md:space-y-4 px-4 md:px-12 group/section"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <div className="flex items-center gap-2 group cursor-pointer w-fit">
        <h2 className="text-sm md:text-xl font-semibold text-[#e5e5e5] group-hover:text-white transition-colors">
          {title}
        </h2>
        <span className="text-[#E50914] text-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          ›
        </span>
      </div>

      <div className="relative">
        {/* Edge Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#141414] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#141414] to-transparent z-10 pointer-events-none" />

        {/* Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-0 top-0 bottom-0 w-10 md:w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center z-20 transition-opacity duration-300 opacity-0 group-hover/section:opacity-100",
            "hidden md:flex"
          )}
        >
          <ChevronLeft size={32} className="text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {items.map((item, idx) => (
            <MediaCard 
              key={item.id || idx} 
              item={item} 
              type={type} 
              listType={listType} 
              onRemove={onRemove}
            />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-0 top-0 bottom-0 w-10 md:w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center z-20 transition-opacity duration-300 opacity-0 group-hover/section:opacity-100",
            "hidden md:flex"
          )}
        >
          <ChevronRight size={32} className="text-white" />
        </button>
      </div>
    </div>
  );
}
