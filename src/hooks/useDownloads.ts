import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchRapidDownloads } from '../lib/downloads';

export interface DownloadItem {
  url: string;
  quality: string;
  size: string | null;
  format: string;
  server?: string;
}

export interface DownloadsResponse {
  downloads: DownloadItem[];
}

const BASE_URL = 'https://missourimonster-vyla.hf.space';

export interface UseDownloadsOptions {
  genres?: string[];
  year?: number;
}

export function useDownloads(
  tmdbId: string | number | undefined,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number,
  options?: UseDownloadsOptions,
) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId) return;

    let cancelled = false;

    async function fetchDownloads() {
      setLoading(true);
      setError(null);

      // 1️⃣ Try the primary Vyla API first
      try {
        let url = '';
        if (mediaType === 'movie') {
          url = `${BASE_URL}/api/downloads/movie/${tmdbId}`;
        } else if (season !== undefined && episode !== undefined) {
          url = `${BASE_URL}/api/downloads/tv/${tmdbId}/${season}/${episode}`;
        }

        if (url) {
          const response = await axios.get<DownloadsResponse>(url, { timeout: 6000 });
          if (!cancelled && response.data.downloads?.length) {
            setDownloads(response.data.downloads);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Primary API failed — continue to fallback
      }

      // 2️⃣ Fallback: RapidAPI search by genre/year
      if (!options?.genres?.length) {
        if (!cancelled) {
          setDownloads([]);
          setError('No download links available for this title.');
          setLoading(false);
        }
        return;
      }

      try {
        const rapidDownloads = await fetchRapidDownloads({
          title: '', // Will be fuzzy-matched loosely; could pass title from Detail
          genres: options.genres,
          year: options.year,
          type: mediaType,
        });

        if (!cancelled) {
          if (rapidDownloads.length > 0) {
            setDownloads(rapidDownloads);
          } else {
            setDownloads([]);
            setError('No download links available for this title yet.');
          }
        }
      } catch {
        if (!cancelled) {
          setDownloads([]);
          setError('Failed to load download options. Please try again later.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDownloads();
    return () => { cancelled = true; };
  }, [tmdbId, mediaType, season, episode, options?.genres?.join(','), options?.year]);

  return { downloads, loading, error };
}
