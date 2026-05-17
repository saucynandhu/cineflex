import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import MediaRow from '../components/MediaRow';
import * as tmdb from '../lib/tmdb';

export default function Home() {
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          trending,
          trendingTV,
          topRated,
          popularTV,
          action,
          comedy,
          horror,
          documentaries
        ] = await Promise.all([
          tmdb.getTrending('movie'),
          tmdb.getTrending('tv'),
          tmdb.getTopRated('movie'),
          tmdb.getPopular('tv'),
          tmdb.getByGenre('movie', 28), // Action
          tmdb.getByGenre('movie', 35), // Comedy
          tmdb.getByGenre('movie', 27), // Horror
          tmdb.getByGenre('movie', 99), // Documentary
        ]);

        // Randomize hero movie from trending
        const randomHero = trending[Math.floor(Math.random() * trending.length)];
        setHeroMovie(randomHero);

        setSections([
          { title: 'Trending Movies', items: trending, type: 'movie' },
          { title: 'Trending TV Shows', items: trendingTV, type: 'tv' },
          { title: 'Top Rated Movies', items: topRated, type: 'movie' },
          { title: 'Popular TV Shows', items: popularTV, type: 'tv' },
          { title: 'Action Movies', items: action, type: 'movie' },
          { title: 'Comedy Movies', items: comedy, type: 'movie' },
          { title: 'Horror Favourites', items: horror, type: 'movie' },
          { title: 'Documentaries', items: documentaries, type: 'movie' },
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
     return <div className="pt-20 px-12 text-center text-gray-500">Loading CineFlix magic...</div>;
  }

  return (
    <div className="relative pb-32">
      <HeroSection movie={heroMovie} />
      
      <div className="relative -mt-10 md:-mt-32 z-10">
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
