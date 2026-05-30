import axios from 'axios';
import { 
  Movie, 
  TVShow, 
  MediaDetails, 
  Genre, 
  Episode, 
  ExternalIds, 
  MediaBase,
  Cast
} from '../types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const USE_PROXY = import.meta.env.VITE_USE_PROXY === 'true';
const BASE_URL = USE_PROXY ? '/api/tmdb' : 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to attach the API key to every request
api.interceptors.request.use((config) => {
  // Only add api_key if not using proxy (proxy handles it)
  if (!USE_PROXY) {
    config.params = {
      ...config.params,
      api_key: API_KEY,
    };
  }
  
  config.params = {
    ...config.params,
    language: 'en-US',
    include_adult: false,
  };
  return config;
});

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

export const getImageUrl = (path: string | null | undefined, size: 'w92' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${TMDB_IMAGE_BASE}${size}${path}`;
};

export const getTrending = async (type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<MediaBase[]> => {
  const { data } = await api.get(`/trending/${type}/${timeWindow}`);
  return data.results;
};

export const getTopRated = async (type: 'movie' | 'tv'): Promise<MediaBase[]> => {
  const { data } = await api.get(`/${type}/top_rated`);
  return data.results;
};

export const getPopular = async (type: 'movie' | 'tv'): Promise<MediaBase[]> => {
  const { data } = await api.get(`/${type}/popular`);
  return data.results;
};

export const getByGenre = async (type: 'movie' | 'tv', genreId: number): Promise<MediaBase[]> => {
  const { data } = await api.get(`/discover/${type}`, {
    params: { with_genres: genreId },
  });
  return data.results;
};

export const getDetails = async (type: 'movie' | 'tv', id: string | number): Promise<MediaDetails> => {
  const { data } = await api.get(`/${type}/${id}`, {
    params: { append_to_response: 'credits,videos,recommendations,similar' },
  });
  return data;
};

export const getCredits = async (type: 'movie' | 'tv', id: string | number): Promise<Cast[]> => {
  const { data } = await api.get(`/${type}/${id}/credits`);
  return data.cast;
};

export const getSeasons = async (tvId: string | number) => {
  const { data } = await api.get(`/tv/${tvId}`);
  return data.seasons;
};

export const getEpisodes = async (tvId: string | number, seasonNumber: number): Promise<Episode[]> => {
  const { data } = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
  return data.episodes;
};

export const searchMulti = async (query: string): Promise<MediaBase[]> => {
  const { data } = await api.get(`/search/multi`, {
    params: { query },
  });
  return data.results;
};

export const getGenres = async (type: 'movie' | 'tv'): Promise<Genre[]> => {
  const { data } = await api.get(`/genre/${type}/list`);
  return data.genres;
};

export const getExternalIds = async (type: 'movie' | 'tv', id: string | number): Promise<ExternalIds> => {
  const { data } = await api.get(`/${type}/${id}/external_ids`);
  return data;
};

export const getCollection = async (collectionId: number) => {
  const { data } = await api.get(`/collection/${collectionId}`);
  return data; // { id, name, overview, parts: [...movies] }
};


