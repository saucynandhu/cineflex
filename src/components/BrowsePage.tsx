import { useEffect, useState, useCallback } from 'react';
import MediaCard from './MediaCard';
import MediaRow from './MediaRow';
import ErrorMessage from './ErrorMessage';
import { cn } from '../lib/utils';
import { Genre, MediaBase } from '../types/tmdb';

interface BrowseSectionConfig {
  title: string;
  fetchFn: () => Promise<MediaBase[]>;
}

interface BrowseSection {
  title: string;
  items: MediaBase[];
}

interface BrowsePageProps {
  type: 'movie' | 'tv';
  sections: BrowseSectionConfig[];
  getGenres: () => Promise<Genre[]>;
  getByGenre: (genreId: number) => Promise<MediaBase[]>;
  loadingLabel: string;
}

export default function BrowsePage({ type, sections: sectionConfigs, getGenres, getByGenre, loadingLabel }: BrowsePageProps) {
  const [sections, setSections] = useState<BrowseSection[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [filteredContent, setFilteredContent] = useState<MediaBase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);
      setError(null);
      const [genreList, ...sectionItems] = await Promise.all([
        getGenres(),
        ...sectionConfigs.map(section => section.fetchFn()),
      ]);

      if (!mounted) return;

      setGenres(genreList);
      setSections(sectionConfigs.map((section, index) => ({
        title: section.title,
        items: sectionItems[index],
      })));
    } catch (err) {
      console.error(err);
      if (mounted) setError('Failed to load content. Please check your connection and try again.');
    } finally {
      if (mounted) setLoading(false);
    }
  }, [getGenres, sectionConfigs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let mounted = true;

    async function fetchFiltered() {
      if (!selectedGenre) {
        setFilteredContent(null);
        return;
      }

      setFiltering(true);
      setFilterError(null);
      try {
        const results = await getByGenre(selectedGenre);
        if (mounted) setFilteredContent(results);
      } catch (err) {
        console.error(err);
        if (mounted) setFilterError('Failed to load genre results.');
      } finally {
        if (mounted) setFiltering(false);
      }
    }

    fetchFiltered();
    return () => {
      mounted = false;
    };
  }, [selectedGenre, getByGenre]);

  if (loading) return <div className="h-screen bg-[#141414]" />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] pt-24 px-4 md:px-12">
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="pb-20 bg-[#141414] pt-24">
      <div className="px-4 md:px-12 mb-8">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4">
          <button
            type="button"
            onClick={() => setSelectedGenre(null)}
            className={cn(
              "flex-none px-6 py-1.5 rounded-full text-sm font-bold border transition-all duration-200",
              selectedGenre === null ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white bg-transparent"
            )}
          >
            All
          </button>
          {genres.map(genre => (
            <button
              type="button"
              key={genre.id}
              onClick={() => setSelectedGenre(prev => prev === genre.id ? null : genre.id)}
              className={cn(
                "flex-none px-6 py-1.5 rounded-full text-sm font-bold border transition-all duration-200",
                selectedGenre === genre.id ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white bg-transparent"
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {filtering ? (
          <div className="px-4 md:px-12 text-white/60">{loadingLabel}</div>
        ) : filterError ? (
          <div className="px-4 md:px-12">
            <ErrorMessage message={filterError} onRetry={() => { setFilterError(null); setSelectedGenre(null); setSelectedGenre(selectedGenre); }} />
          </div>
        ) : filteredContent ? (
          <div className="px-4 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredContent.map((item) => (
                <MediaCard key={item.id} item={item} type={type} />
              ))}
            </div>
          </div>
        ) : (
          sections.map((section) => (
            <MediaRow key={section.title} title={section.title} items={section.items} type={type} />
          ))
        )}
      </div>
    </div>
  );
}
