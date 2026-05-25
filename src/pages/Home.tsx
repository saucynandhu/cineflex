import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import SkeletonRow from '../components/SkeletonRow';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';
import * as tmdb from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';
import { MediaBase, Genre } from '../types/tmdb';

interface Section {
  title: string;
  items: MediaBase[];
  type: 'movie' | 'tv' | 'all';
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
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
      movieGenres.forEach((g: Genre) => map[g.id] = g.name);
      tvGenres.forEach((g: Genre) => map[g.id] = g.name);
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
      setError("Failed to load content. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && sections.length === 0) {
     return <LoadingScreen />;
  }

  if (error && sections.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#141414] px-6">
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
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

        {loading && sections.length === 0 ? (
           <>
             <SkeletonRow title="Trending Now" />
             <SkeletonRow title="Popular TV Shows" />
             <SkeletonRow title="Top Rated Movies" />
           </>
        ) : (
          sections.map((section, idx) => (
            <MediaRow
              key={section.title + idx}
              title={section.title}
              items={section.items}
              type={section.type}
            />
          ))
        )}
      </div>
    </div>
  );
}
