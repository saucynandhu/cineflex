import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import * as tmdb from '../lib/tmdb';
import { cn } from '../lib/utils';

export default function Movies() {
  const [sections, setSections] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [movieGenres, trending, topRated, action, comedy, horror, thriller, scifi] = await Promise.all([
          tmdb.getGenres('movie'),
          tmdb.getTrending('movie'),
          tmdb.getTopRated('movie'),
          tmdb.getByGenre('movie', 28),
          tmdb.getByGenre('movie', 35),
          tmdb.getByGenre('movie', 27),
          tmdb.getByGenre('movie', 53),
          tmdb.getByGenre('movie', 878),
        ]);

        setGenres(movieGenres);
        setSections([
          { title: 'Trending Movies', items: trending },
          { title: 'Top Rated', items: topRated },
          { title: 'Action', items: action },
          { title: 'Comedy', items: comedy },
          { title: 'Horror', items: horror },
          { title: 'Thriller', items: thriller },
          { title: 'Sci-Fi', items: scifi },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="h-screen bg-[#141414]" />;

  return (
    <div className="pb-20 bg-[#141414]">
      <div className="relative h-[60vh] overflow-hidden">
        <HeroSection />
      </div>

      <div className="relative z-10 -mt-20 md:-mt-32 px-4 md:px-12 mb-8">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-4">
          <button 
            onClick={() => setSelectedGenre(null)}
            className={cn(
              "flex-none px-6 py-1.5 rounded-full text-sm font-bold border transition-all",
              selectedGenre === null ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white"
            )}
          >
            All Movies
          </button>
          {genres.map(g => (
            <button 
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={cn(
                "flex-none px-6 py-1.5 rounded-full text-sm font-bold border transition-all",
                selectedGenre === g.id ? "bg-white text-black border-white" : "text-white border-white/20 hover:border-white"
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <MediaRow key={idx} title={section.title} items={section.items} type="movie" />
        ))}
      </div>
    </div>
  );
}
