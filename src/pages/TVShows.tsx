import { useMemo, useCallback } from 'react';
import BrowsePage from '../components/BrowsePage';
import * as tmdb from '../lib/tmdb';

export default function TVShows() {
  const sections = useMemo(() => [
    { title: 'Trending Series', fetchFn: () => tmdb.getTrending('tv') },
    { title: 'Top Rated', fetchFn: () => tmdb.getTopRated('tv') },
    { title: 'Animation', fetchFn: () => tmdb.getByGenre('tv', 16) },
    { title: 'Drama', fetchFn: () => tmdb.getByGenre('tv', 18) },
    { title: 'Sci-Fi & Fantasy', fetchFn: () => tmdb.getByGenre('tv', 10765) },
    { title: 'Mystery', fetchFn: () => tmdb.getByGenre('tv', 9648) },
  ], []);

  const getGenres = useCallback(() => tmdb.getGenres('tv'), []);
  const getByGenre = useCallback((genreId: number) => tmdb.getByGenre('tv', genreId), []);

  return (
    <BrowsePage
      type="tv"
      sections={sections}
      getGenres={getGenres}
      getByGenre={getByGenre}
      loadingLabel="Loading series..."
    />
  );
}
