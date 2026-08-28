export interface Genre {
  id: number;
  name: string;
}

export interface MediaBase {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  media_type?: 'movie' | 'tv';
  /** Present on movie results from mixed endpoints (trending, search) */
  release_date?: string;
  /** Present on TV results from mixed endpoints (trending, search) */
  first_air_date?: string;
}

export interface Movie extends MediaBase {
  release_date: string;
  original_title: string;
  adult: boolean;
  video: boolean;
}

export interface TVShow extends MediaBase {
  first_air_date: string;
  original_name: string;
  origin_country: string[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_count: number;
  poster_path: string;
  season_number: number;
}

export interface MediaDetails extends MediaBase {
  genres: Genre[];
  homepage: string;
  status: string;
  tagline: string;
  credits?: {
    cast: Cast[];
    crew: Crew[];
  };
  videos?: {
    results: Video[];
  };
  recommendations?: {
    results: MediaBase[];
  };
  similar?: {
    results: MediaBase[];
  };
  // TV specific
  number_of_episodes?: number;
  number_of_seasons?: number;
  seasons?: Season[];
  // Movie specific
  runtime?: number;
  budget?: number;
  revenue?: number;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path?: string;
    backdrop_path?: string;
  } | null;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official?: boolean;
}

export interface ExternalIds {
  imdb_id: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}

/**
 * Shape of items stored in Zustand user lists (camelCase fields).
 * Used by MediaCard when rendering continue-watching / watch-later rows.
 */
export interface StoredMediaItem {
  id: number;
  name?: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  backdropPath?: string;
  year: string;
  addedAt: number;
  season?: number;
  episode?: number;
  episodeName?: string;
  watchedAt?: number;
}

/**
 * Union type accepted by MediaCard — covers both TMDB API results
 * (snake_case) and Zustand store items (camelCase).
 */
export type MediaCardItem = MediaBase | StoredMediaItem;

/** Tab keys used on the Detail page */
export type DetailTab = 'overview' | 'episodes' | 'more';
