import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import * as tmdb from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { cn } from '../lib/utils';

export default function Home() {
  const [sections, setSections] = useState<any[]>([]);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const { continueWatching: initialCW, removeFromContinueWatching } = useUserLists();
  const [cwItems, setCwItems] = useState<any[]>([]);
  
  useEffect(() => {
    setCwItems(initialCW);
  }, [initialCW]);

  const handleCWRemove = (id: number, type: string) => {
    removeFromContinueWatching(id, type as 'movie' | 'tv');
    setCwItems(prev => prev.filter(item => 
      !( (Number(item.tmdbId) === Number(id) || Number(item.id) === Number(id)) && item.type === type )
    ));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          movieGenres,
          tvGenres,
          trending,
          trendingTV,
          topRated,
          topRatedTV,
          action,
          comedy,
          horror,
          thriller,
          scifi,
          documentaries,
          anime,
          popularTV
        ] = await Promise.all([
          tmdb.getGenres('movie'),
          tmdb.getGenres('tv'),
          tmdb.getTrending('movie'),
          tmdb.getTrending('tv'),
          tmdb.getTopRated('movie'),
          tmdb.getTopRated('tv'),
          tmdb.getByGenre('movie', 28), // Action
          tmdb.getByGenre('movie', 35), // Comedy
          tmdb.getByGenre('movie', 27), // Horror
          tmdb.getByGenre('movie', 53), // Thriller
          tmdb.getByGenre('movie', 878), // Sci-Fi
          tmdb.getByGenre('movie', 99), // Documentary
          tmdb.getByGenre('tv', 16), // Anime
          tmdb.getPopular('tv'),
        ]);

        const map: Record<number, string> = {};
        movieGenres.forEach((g: any) => map[g.id] = g.name);
        tvGenres.forEach((g: any) => map[g.id] = g.name);
        setGenreMap(map);

        setSections([
          { title: 'Trending Now', items: trending, type: 'movie' },
          { title: 'New on Cineflix', items: trending.slice().reverse(), type: 'movie' }, // Mocking new
          { title: 'Popular TV Shows', items: popularTV, type: 'tv' },
          { title: 'Top Rated Movies', items: topRated, type: 'movie' },
          { title: 'Action & Adventure', items: action, type: 'movie' },
          { title: 'Comedies', items: comedy, type: 'movie' },
          { title: 'Thrillers', items: thriller, type: 'movie' },
          { title: 'Sci-Fi', items: scifi, type: 'movie' },
          { title: 'Horror', items: horror, type: 'movie' },
          { title: 'Anime', items: anime, type: 'tv' },
          { title: 'Documentaries', items: documentaries, type: 'movie' },
          { title: 'Binge-Worthy Series', items: topRatedTV, type: 'tv' },
        ]);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
     return <div className="h-screen bg-[#141414] flex items-center justify-center text-red-600 font-bold text-2xl">CINEFLIX</div>;
  }

  return (
    <div className="relative pb-20 bg-[#141414]">
      <HeroSection genreMap={genreMap} />
      
      <div className="relative z-10 pt-5 space-y-8 md:space-y-12">
        {cwItems.length > 0 && (
          <MediaRow
            title="Continue Watching"
            items={cwItems}
            type="all"
            listType="continue_watching"
            onRemove={handleCWRemove}
          />
        )}

        {sections.map((section, idx) => (
          <MediaRow
            key={section.title + idx}
            title={section.title}
            items={section.items}
            type={section.type as 'movie' | 'tv' | 'all'}
          />
        ))}
      </div>
    </div>
  );
}
