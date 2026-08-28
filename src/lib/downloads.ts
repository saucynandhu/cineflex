/**
 * RapidAPI Movies & Download Links integration.
 *
 * The API only supports browsing by genre/tag/year, not lookup by TMDB ID.
 * We search with the movie's genre + year and fuzzy-match the title.
 */

import axios from 'axios';
import type { DownloadItem } from '../hooks/useDownloads';

const RAPIDAPI_KEY = '9a503cfccfmsha0aa5857945c286p1d6c52jsnc0178834dc9e';
const RAPIDAPI_HOST = 'movies-download-links-api.p.rapidapi.com';
const API_URL = `https://${RAPIDAPI_HOST}/filters`;

/** Map TMDB genre names to the API's genre strings (lowercase). */
const GENRE_MAP: Record<string, string> = {
  'Action': 'action',
  'Adventure': 'adventure',
  'Animation': 'animation',
  'Comedy': 'comedy',
  'Crime': 'crime',
  'Documentary': 'documentary',
  'Drama': 'drama',
  'Family': 'family',
  'Fantasy': 'fantasy',
  'History': 'history',
  'Horror': 'horror',
  'Music': 'music',
  'Mystery': 'mystery',
  'Romance': 'romance',
  'Science Fiction': 'sci-fi',
  'Sci-Fi': 'sci-fi',
  'TV Movie': 'tv movie',
  'Thriller': 'thriller',
  'War': 'war',
  'Western': 'western',
  'Action & Adventure': 'action',
  'Kids': 'family',
  'News': 'documentary',
  'Reality': 'reality',
  'Sci-Fi & Fantasy': 'sci-fi',
  'Soap': 'drama',
  'Talk': 'talk',
  'War & Politics': 'war',
};

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[:\-–—!?.',]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simple fuzzy match: check if normalized query is contained in the target.
 * Returns a score (higher = better match). 0 means no match.
 */
function titleMatchScore(query: string, target: string): number {
  const nq = normalizeTitle(query);
  const nt = normalizeTitle(target);

  if (nt === nq) return 100;            // exact match
  if (nt.includes(nq)) return 80;       // target contains query
  if (nq.includes(nt)) return 70;       // query contains target

  // word overlap
  const queryWords = nq.split(' ');
  const targetWords = nt.split(' ');
  const overlap = queryWords.filter(w => targetWords.includes(w)).length;
  if (overlap > 0) return (overlap / queryWords.length) * 60;

  return 0;
}

interface RapidApiResult {
  id: number;
  name: string | null;
  description: string | null;
  duration: string | null;
  quality: string | null;
  rating: string | null;
  release_date: string | null;
  language: string | null;
  iframe_src: string | null;
  poster: string | null;
  poster_alt: string | null;
  url: string;
  year: number | null;
  backdrop_path: string | null;
}

export interface RapidDownloadParams {
  title: string;
  genres: string[];
  year?: number;
  type: 'movie' | 'tv';
}

/**
 * Fetch download links from the RapidAPI by searching with genre/year
 * and fuzzy-matching the title.
 */
export async function fetchRapidDownloads({
  title,
  genres,
  year,
  type,
}: RapidDownloadParams): Promise<DownloadItem[]> {
  const apiGenre = GENRE_MAP[genres[0]] || 'action';
  const tag = type === 'tv' ? 'TV Show' : 'Movie';

  // Try up to 3 pages (60 results) to find a good match
  const allResults: RapidApiResult[] = [];
  for (let start = 0; start < 60; start += 20) {
    try {
      const response = await axios.post<RapidApiResult[]>(
        API_URL,
        { start, limit: 20, genre: apiGenre, tag, ...(year ? { year } : {}) },
        {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        },
      );
      const results = response.data;
      if (!results || results.length === 0) break;
      allResults.push(...results);
    } catch {
      break; // API error — stop paginating
    }
  }

  if (allResults.length === 0) return [];

  // Score and sort results by title match
  const scored = allResults
    .map(r => ({
      result: r,
      score: titleMatchScore(title, r.name || ''),
    }))
    .filter(s => s.score > 20)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];

  // Take the best match and also include a few close alternatives
  const bestScore = scored[0].score;
  const topMatches = scored.filter(s => s.score >= bestScore - 20).slice(0, 5);

  return topMatches.map(({ result }) => ({
    url: result.url,
    quality: result.quality || 'WEB-DL',
    size: result.duration || null,
    format: 'MKV',
    server: 'RapidAPI',
  }));
}
