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

// ─── In-memory response cache ───────────────────────────────────────
// Caches GET responses by URL + params for deduplication and fast
// re-navigation.  Search endpoints are excluded (results change per
// keystroke).  TTL: 5 minutes.
const CACHE_TTL_MS = 5 * 60 * 1000;
const responseCache = new Map<string, { data: unknown; expiry: number }>();

function getCacheKey(url: string, params?: Record<string, unknown>): string {
  return `${url}?${JSON.stringify(params ?? {})}`;
}

function isCacheable(url: string): boolean {
  // Don't cache search, external_ids, or images (large blobs)
  if (url.includes('/search/') || url.includes('/external_ids') || url.includes('/images')) return false;
  return true;
}

function getCached(key: string): unknown | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  // Cap cache size at 100 entries to prevent memory leaks
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

/** Clear the entire cache (useful after mutations that affect list data) */
export function clearTmdbCache(): void {
  responseCache.clear();
}

const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to attach the API key and handle caching
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

  // Check cache for GET requests
  if (config.method === 'get' && isCacheable(config.url || '')) {
    const cacheKey = getCacheKey(config.url || '', config.params as Record<string, unknown>);
    const cached = getCached(cacheKey);
    if (cached !== null) {
      // Return cached data directly by aborting the request and
      // attaching the cached response
      config.adapter = () => {
        return Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };
    }
  }

  return config;
});

// Response interceptor to populate cache
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && isCacheable(response.config.url || '')) {
      const cacheKey = getCacheKey(response.config.url || '', response.config.params as Record<string, unknown>);
      setCache(cacheKey, response.data);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

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

export const getUpcoming = async (): Promise<MediaBase[]> => {
  const { data } = await api.get('/movie/upcoming');
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

export const searchMulti = async (query: string, page: number = 1): Promise<{results: MediaBase[], total_pages: number}> => {
  const { data } = await api.get(`/search/multi`, {
    params: { query, page },
  });
  return { results: data.results, total_pages: data.total_pages };
};

export const searchType = async (type: 'movie' | 'tv', query: string, page: number = 1): Promise<{results: MediaBase[], total_pages: number}> => {
  const { data } = await api.get(`/search/${type}`, {
    params: { query, page },
  });
  return { results: data.results, total_pages: data.total_pages };
};

export const getGenres = async (type: 'movie' | 'tv'): Promise<Genre[]> => {
  const { data } = await api.get(`/genre/${type}/list`);
  return data.genres;
};

export const getExternalIds = async (type: 'movie' | 'tv', id: string | number): Promise<ExternalIds> => {
  const { data } = await api.get(`/${type}/${id}/external_ids`);
  return data;
};

export const getImages = async (type: 'movie' | 'tv', id: string | number) => {
  const { data } = await api.get(`/${type}/${id}/images`, {
    params: { include_image_language: 'en,null' }
  });
  return data;
};

export const getCollection = async (collectionId: number) => {
  const { data } = await api.get(`/collection/${collectionId}`);
  return data; // { id, name, overview, parts: [...movies] }
};
