import { useState, useEffect } from 'react';
import axios from 'axios';

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

export function useDownloads(tmdbId: string | number | undefined, mediaType: 'movie' | 'tv', season?: number, episode?: number) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId) return;

    async function fetchDownloads() {
      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (mediaType === 'movie') {
          url = `${BASE_URL}/api/downloads/movie/${tmdbId}`;
        } else if (season !== undefined && episode !== undefined) {
          // Following REST pattern for TV as well
          url = `${BASE_URL}/api/downloads/tv/${tmdbId}/${season}/${episode}`;
        } else {
          return; // TV requires season and episode
        }

        const response = await axios.get<DownloadsResponse>(url);
        setDownloads(response.data.downloads || []);
      } catch (err) {
        console.error('Failed to fetch downloads:', err);
        setError('Failed to load download options. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDownloads();
  }, [tmdbId, mediaType, season, episode]);

  return { downloads, loading, error };
}
