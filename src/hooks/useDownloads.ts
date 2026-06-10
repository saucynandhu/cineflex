import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  buildDownloadRequestUrl,
  normalizeDownloadsResponse,
  DownloadItem,
  DownloadsResponse
} from '../lib/downloads';

export type { DownloadItem, DownloadsResponse } from '../lib/downloads';

const DOWNLOADS_API_URL = import.meta.env.VITE_DOWNLOADS_API_URL as string | undefined;

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
        const url = buildDownloadRequestUrl(DOWNLOADS_API_URL, {
          tmdbId,
          mediaType,
          season,
          episode,
        });

        if (!url) {
          setDownloads([]);
          setError(
            mediaType === 'tv' && (season === undefined || episode === undefined)
              ? 'Choose an episode before downloading.'
              : 'Downloads are not configured for this app yet.'
          );
          return;
        }

        const response = await axios.get<DownloadsResponse>(url);
        setDownloads(normalizeDownloadsResponse(response.data).downloads);
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
