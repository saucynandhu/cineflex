import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import * as tmdb from '../lib/tmdb';
import { useUserLists } from '../hooks/useUserLists';

export default function Home() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { continueWatching, removeFromContinueWatching } = useUserLists();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
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
      <HeroSection />
      
      <div className="relative -mt-32 md:-mt-48 z-10 space-y-8 md:space-y-12">
        {continueWatching.length > 0 && (
          <MediaRow
            title="Continue Watching"
            items={continueWatching}
            type="all"
            listType="continue_watching"
            onRemove={removeFromContinueWatching}
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
