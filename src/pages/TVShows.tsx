import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import MediaCard from '../components/MediaCard';
import * as tmdb from '../lib/tmdb';
import { cn } from '../lib/utils';

export default function TVShows() {
  const [sections, setSections] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [filteredContent, setFilteredContent] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [tvGenres, trending, topRated, animation, drama, scifi, mystery] = await Promise.all([
          tmdb.getGenres('tv'),
          tmdb.getTrending('tv'),
          tmdb.getTopRated('tv'),
          tmdb.getByGenre('tv', 16),
          tmdb.getByGenre('tv', 18),
          tmdb.getByGenre('tv', 10765),
          tmdb.getByGenre('tv', 9648),
        ]);

        setGenres(tvGenres);
        setSections([
          { title: 'Trending Series', items: trending },
          { title: 'Top Rated', items: topRated },
          { title: 'Animation', items: animation },
          { title: 'Drama', items: drama },
          { title: 'Sci-Fi & Fantasy', items: scifi },
          { title: 'Mystery', items: mystery },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      if (selectedGenre) {
        setFiltering(true);
        try {
          const results = await tmdb.getByGenre('tv', selectedGenre);
          setFilteredContent(results);
        } catch (err) {
          console.error(err);
        } finally {
          setFiltering(false);
        }
      } else {
        setFilteredContent(null);
      }
    }
    fetchFiltered();
  }, [selectedGenre]);

  if (loading) return <div className="h-screen bg-[#141414]" />;

  return (
    <div className="pb-20 bg-[#141414] pt-24">
      <div className="px-4 md:px-12 mb-8">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4">
          <button 
            onClick={() => setSelectedGenre(null)}
            className={cn(
              "flex-none px-6 py-1.5 rounded-full text-sm font-bold border transition-all duration-200",
              selectedGenre === null ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white bg-transparent"
            )}
          >
            All
          </button>
          {genres.map(g => (
            <button 
              key={g.id}
              onClick={() => setSelectedGenre(prev => prev === g.id ? null : g.id)}
              className={cn(
                "flex-none px-6 py-1.5 rounded-full text-sm font-bold border transition-all duration-200",
                selectedGenre === g.id ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white bg-transparent"
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {filtering ? (
          <div className="px-4 md:px-12 text-white/60">Loading series...</div>
        ) : filteredContent ? (
          <div className="px-4 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredContent.map((item) => (
                <MediaCard key={item.id} item={item} type="tv" />
              ))}
            </div>
          </div>
        ) : (
          sections.map((section, idx) => (
            <MediaRow key={idx} title={section.title} items={section.items} type="tv" />
          ))
        )}
      </div>
    </div>
  );
}
