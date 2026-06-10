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

export interface DownloadRequest {
  tmdbId: string | number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

type RawDownloadItem = Partial<DownloadItem> & {
  link?: string;
  href?: string;
  resolution?: string;
  fileSize?: string | null;
  type?: string;
};

type RawDownloadsResponse = RawDownloadItem[] | {
  downloads?: RawDownloadItem[];
  results?: RawDownloadItem[];
  items?: RawDownloadItem[];
};

export function buildDownloadRequestUrl(baseUrl: string | undefined, request: DownloadRequest): string | null {
  const cleanBase = baseUrl?.trim();
  if (!cleanBase) return null;

  const replacements: Record<string, string> = {
    type: request.mediaType,
    tmdbId: String(request.tmdbId),
    id: String(request.tmdbId),
    season: String(request.season ?? ''),
    episode: String(request.episode ?? ''),
  };

  if (/\{(?:type|tmdbId|id|season|episode)\}/.test(cleanBase)) {
    return cleanBase.replace(/\{(type|tmdbId|id|season|episode)\}/g, (_, key: string) => {
      return encodeURIComponent(replacements[key] ?? '');
    });
  }

  const trimmedBase = cleanBase.replace(/\/+$/, '');
  if (request.mediaType === 'movie') {
    return `${trimmedBase}/movie/${encodeURIComponent(String(request.tmdbId))}`;
  }

  if (request.season === undefined || request.episode === undefined) {
    return null;
  }

  return [
    trimmedBase,
    'tv',
    encodeURIComponent(String(request.tmdbId)),
    encodeURIComponent(String(request.season)),
    encodeURIComponent(String(request.episode)),
  ].join('/');
}

export function normalizeDownloadsResponse(payload: RawDownloadsResponse): DownloadsResponse {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload.downloads || payload.results || payload.items || [];

  const downloads = rawItems
    .map((item): DownloadItem | null => {
      const url = item.url || item.link || item.href;
      if (!url) return null;

      const format = item.format || item.type || inferFormat(url);
      const quality = item.quality || item.resolution || 'HD';

      return {
        url,
        quality: String(quality).toUpperCase(),
        size: item.size || item.fileSize || null,
        format: String(format).toUpperCase(),
        server: item.server,
      } satisfies DownloadItem;
    })
    .filter((item): item is DownloadItem => Boolean(item));

  return { downloads };
}

function inferFormat(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop();
    return extension && extension.length <= 5 ? extension : 'VIDEO';
  } catch {
    return 'VIDEO';
  }
}
