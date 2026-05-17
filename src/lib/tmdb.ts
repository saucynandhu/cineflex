import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const api = axios.create({
  baseURL: '/api/tmdb',
});

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${TMDB_IMAGE_BASE}${size}${path}`;
};

export const getTrending = async (type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  const { data } = await api.get(`/trending/${type}/${timeWindow}`);
  return data.results;
};

export const getTopRated = async (type: 'movie' | 'tv') => {
  const { data } = await api.get(`/${type}/top_rated`);
  return data.results;
};

export const getPopular = async (type: 'movie' | 'tv') => {
  const { data } = await api.get(`/${type}/popular`);
  return data.results;
};

export const getByGenre = async (type: 'movie' | 'tv', genreId: number) => {
  const { data } = await api.get(`/discover/${type}`, {
    params: { with_genres: genreId },
  });
  return data.results;
};

export const getDetails = async (type: 'movie' | 'tv', id: string) => {
  const { data } = await api.get(`/${type}/${id}`, {
    params: { append_to_response: 'credits,videos,recommendations,similar' },
  });
  return data;
};

export const getCredits = async (type: 'movie' | 'tv', id: string) => {
  const { data } = await api.get(`/${type}/${id}/credits`);
  return data.cast;
};

export const getSeasons = async (tvId: string) => {
  const { data } = await api.get(`/tv/${tvId}`);
  return data.seasons;
};

export const getEpisodes = async (tvId: string, seasonNumber: number) => {
  const { data } = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
  return data.episodes;
};

export const searchMulti = async (query: string) => {
  const { data } = await api.get(`/search/multi`, {
    params: { query },
  });
  return data.results;
};

export const getGenres = async (type: 'movie' | 'tv') => {
  const { data } = await api.get(`/genre/${type}/list`);
  return data.genres;
};

export const getExternalIds = async (type: 'movie' | 'tv', id: string) => {
  const { data } = await api.get(`/${type}/${id}/external_ids`);
  return data;
};
