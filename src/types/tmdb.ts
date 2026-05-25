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
}

export interface ExternalIds {
  imdb_id: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}
