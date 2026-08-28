import { useMemo, useCallback } from 'react';
import BrowsePage from '../components/BrowsePage';
import * as tmdb from '../lib/tmdb';

export default function Movies() {
  const sections = useMemo(() => [
    { title: 'Trending Movies', fetchFn: () => tmdb.getTrending('movie') },
    { title: 'Top Rated', fetchFn: () => tmdb.getTopRated('movie') },
    { title: 'Action', fetchFn: () => tmdb.getByGenre('movie', 28) },
    { title: 'Comedy', fetchFn: () => tmdb.getByGenre('movie', 35) },
    { title: 'Horror', fetchFn: () => tmdb.getByGenre('movie', 27) },
    { title: 'Thriller', fetchFn: () => tmdb.getByGenre('movie', 53) },
    { title: 'Sci-Fi', fetchFn: () => tmdb.getByGenre('movie', 878) },
  ], []);

  const getGenres = useCallback(() => tmdb.getGenres('movie'), []);
  const getByGenre = useCallback((genreId: number) => tmdb.getByGenre('movie', genreId), []);

  return (
    <BrowsePage
      type="movie"
      sections={sections}
      getGenres={getGenres}
      getByGenre={getByGenre}
      loadingLabel="Loading movies..."
    />
  );
}
