import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import LoadingScreen from '../components/LoadingScreen';
import * as tmdb from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { Genre } from '../types/tmdb';

interface SectionConfig {
  title: string;
  fetchFn: () => Promise<any[]>;
  type: 'movie' | 'tv' | 'all';
}

export default function Home() {
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [loadingGenres, setLoadingGenres] = useState(true);
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
    async function fetchGenres() {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          tmdb.getGenres('movie'),
          tmdb.getGenres('tv')
        ]);
        const map: Record<number, string> = {};
        movieGenres.forEach((g: Genre) => map[g.id] = g.name);
        tvGenres.forEach((g: Genre) => map[g.id] = g.name);
        setGenreMap(map);
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setLoadingGenres(false);
      }
    }
    fetchGenres();
  }, []);

  const sections: SectionConfig[] = [
    { title: 'Trending Now', fetchFn: () => tmdb.getTrending('movie'), type: 'movie' },
    { title: 'Popular TV Shows', fetchFn: () => tmdb.getPopular('tv'), type: 'tv' },
    { title: 'Top Rated Movies', fetchFn: () => tmdb.getTopRated('movie'), type: 'movie' },
    { title: 'Action & Adventure', fetchFn: () => tmdb.getByGenre('movie', 28), type: 'movie' },
    { title: 'Comedies', fetchFn: () => tmdb.getByGenre('movie', 35), type: 'movie' },
    { title: 'Thrillers', fetchFn: () => tmdb.getByGenre('movie', 53), type: 'movie' },
    { title: 'Sci-Fi', fetchFn: () => tmdb.getByGenre('movie', 878), type: 'movie' },
    { title: 'Horror', fetchFn: () => tmdb.getByGenre('movie', 27), type: 'movie' },
    { title: 'Anime', fetchFn: () => tmdb.getByGenre('tv', 16), type: 'tv' },
    { title: 'Documentaries', fetchFn: () => tmdb.getByGenre('movie', 99), type: 'movie' },
    { title: 'Binge-Worthy Series', fetchFn: () => tmdb.getTopRated('tv'), type: 'tv' },
  ];

  if (loadingGenres) {
     return <LoadingScreen />;
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
            fetchFn={section.fetchFn}
            type={section.type}
          />
        ))}
      </div>
    </div>
  );
}
