export interface ListItem {
  id: number;
  tmdbId: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  backdropPath?: string;
  year: string;
  addedAt: number;
}

export interface WatchProgress {
  currentTime?: number;
  duration?: number;
  progress?: number;
  lastPlayerEvent?: string;
}

export interface ContinueWatchingItem extends ListItem, WatchProgress {
  season?: number;
  episode?: number;
  episodeName?: string;
  watchedAt: number;
}

export interface WatchedItem extends ListItem {
  watchedAt: number;
  season?: number;
  episode?: number;
}

const STORAGE_VERSION_KEY = 'cineflex_storage_version';
const CURRENT_STORAGE_VERSION = 2;

const CONTINUE_WATCHING_KEY = 'cineflex_continue_watching';
const WATCH_LATER_KEY = 'cineflex_watch_later';
const WATCHED_KEY = 'cineflex_watched';

const MAX_CONTINUE_WATCHING = 20;
const MAX_WATCH_LATER = 100;
const MAX_WATCHED = 200;

/**
 * Basic migration logic to handle schema changes.
 */
function migrate() {
  if (typeof window === 'undefined' || !window.localStorage || typeof window.localStorage.getItem !== 'function') return;
  const version = Number(window.localStorage.getItem(STORAGE_VERSION_KEY) || '1');
  
  if (version < 2) {
    // Migration from v1 to v2: Ensure all items have tmdbId (using id as fallback)
    [CONTINUE_WATCHING_KEY, WATCH_LATER_KEY, WATCHED_KEY].forEach(key => {
      const data = window.localStorage.getItem(key);
      if (data) {
        try {
          const list = JSON.parse(data);
          if (Array.isArray(list)) {
            const updated = list.map(item => ({
              ...item,
              tmdbId: item.tmdbId || item.id
            }));
            window.localStorage.setItem(key, JSON.stringify(updated));
          }
        } catch (e) {
          console.error(`Migration error for ${key}:`, e);
        }
      }
    });
    window.localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
  }
}

// Run migration on load
if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
  migrate();
}

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

function hasSameMediaId(item: ListItem, tmdbId: number): boolean {
  return Number(item.tmdbId) === Number(tmdbId) || Number(item.id) === Number(tmdbId);
}

function isSameWatchedItem(item: WatchedItem, target: WatchedItem): boolean {
  if (item.type !== target.type || !hasSameMediaId(item, target.tmdbId)) return false;
  if (target.type === 'movie') return true;

  return Number(item.season) === Number(target.season) && Number(item.episode) === Number(target.episode);
}

function hasSamePlaybackContext(existing: ContinueWatchingItem, next: ContinueWatchingItem): boolean {
  if (existing.type !== next.type) return false;
  if (!hasSameMediaId(existing, next.tmdbId)) return false;
  if (next.type === 'movie') return true;

  return Number(existing.season) === Number(next.season) && Number(existing.episode) === Number(next.episode);
}

function mergeProgress(existing: ContinueWatchingItem | undefined, next: ContinueWatchingItem): ContinueWatchingItem {
  if (!existing || !hasSamePlaybackContext(existing, next)) return next;

  return {
    ...next,
    currentTime: next.currentTime ?? existing.currentTime,
    duration: next.duration ?? existing.duration,
    progress: next.progress ?? existing.progress,
    lastPlayerEvent: next.lastPlayerEvent ?? existing.lastPlayerEvent,
  };
}

function applyProgress<T extends ContinueWatchingItem>(item: T, progress?: WatchProgress): T {
  if (!progress) return item;

  return {
    ...item,
    currentTime: progress.currentTime ?? item.currentTime,
    duration: progress.duration ?? item.duration,
    progress: progress.progress ?? item.progress,
    lastPlayerEvent: progress.lastPlayerEvent ?? item.lastPlayerEvent,
  };
}

// Continue Watching
export const getContinueWatching = (): ContinueWatchingItem[] => 
  getStorageItem<ContinueWatchingItem[]>(CONTINUE_WATCHING_KEY, []);

export const addToContinueWatching = (item: ContinueWatchingItem): void => {
  let list = getContinueWatching();
  const index = list.findIndex(i => 
    (Number(i.tmdbId) === Number(item.tmdbId) || Number(i.id) === Number(item.tmdbId)) && i.type === item.type
  );
  const existing = index !== -1 ? list[index] : undefined;
  
  if (index !== -1) {
    list.splice(index, 1);
  }
  
  list.unshift({ ...mergeProgress(existing, item), watchedAt: Date.now() });
  list = list.slice(0, MAX_CONTINUE_WATCHING);
  setStorageItem(CONTINUE_WATCHING_KEY, list);
};

export const removeFromContinueWatching = (tmdbId: number, type: 'movie' | 'tv'): void => {
  const currentList = getContinueWatching();
  const list = currentList.filter(i => 
    !(
      (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) 
      && i.type === type
    )
  );
  
  setStorageItem(CONTINUE_WATCHING_KEY, list);
};

export const updateContinueWatching = (
  tmdbId: number,
  type: 'movie' | 'tv',
  season?: number,
  episode?: number,
  episodeName?: string,
  progress?: WatchProgress
): void => {
  const list = getContinueWatching();
  let item = list.find(i => (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) && i.type === type);
  if (item) {
    if (season !== undefined) item.season = season;
    if (episode !== undefined) item.episode = episode;
    if (episodeName !== undefined) item.episodeName = episodeName;
    item = applyProgress(item, progress);
    item.watchedAt = Date.now();
    // Move to front
    const filtered = list.filter(i => !( (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) && i.type === type));
    filtered.unshift(item);
    setStorageItem(CONTINUE_WATCHING_KEY, filtered.slice(0, MAX_CONTINUE_WATCHING));
  }
};

export const updateContinueWatchingProgress = (
  tmdbId: number,
  type: 'movie' | 'tv',
  progress: WatchProgress,
  season?: number,
  episode?: number,
  episodeName?: string
): void => {
  updateContinueWatching(tmdbId, type, season, episode, episodeName, progress);
};

// Watch Later
export const getWatchLater = (): ListItem[] => 
  getStorageItem<ListItem[]>(WATCH_LATER_KEY, []);

export const addToWatchLater = (item: ListItem): void => {
  const list = getWatchLater();
  if (!list.some(i => (Number(i.tmdbId) === Number(item.tmdbId) || Number(i.id) === Number(item.tmdbId)) && i.type === item.type)) {
    list.unshift({ ...item, addedAt: Date.now() });
    setStorageItem(WATCH_LATER_KEY, list.slice(0, MAX_WATCH_LATER));
  }
};

export const removeFromWatchLater = (tmdbId: number, type: 'movie' | 'tv'): void => {
  const list = getWatchLater().filter(i => 
    !(
      (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) 
      && i.type === type
    )
  );
  setStorageItem(WATCH_LATER_KEY, list);
};

export const isInWatchLater = (tmdbId: number, type: 'movie' | 'tv'): boolean => {
  return getWatchLater().some(i => (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) && i.type === type);
};

// Previously Watched
export const getPreviouslyWatched = (): WatchedItem[] => 
  getStorageItem<WatchedItem[]>(WATCHED_KEY, []);

export const addToWatched = (item: WatchedItem): void => {
  let list = getPreviouslyWatched();
  const index = list.findIndex(i => isSameWatchedItem(i, item));
  
  if (index !== -1) {
    list.splice(index, 1);
  }
  
  list.unshift({ ...item, watchedAt: Date.now() });
  list = list.slice(0, MAX_WATCHED);
  setStorageItem(WATCHED_KEY, list);
};

export const isWatched = (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): boolean => {
  return getPreviouslyWatched().some(i => {
    if (!hasSameMediaId(i, tmdbId) || i.type !== type) return false;
    if (type === 'movie') return true;
    if (season === undefined || episode === undefined) return true;

    return Number(i.season) === Number(season) && Number(i.episode) === Number(episode);
  });
};

export const removeFromWatched = (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): void => {
  const list = getPreviouslyWatched().filter(i => {
    if (!hasSameMediaId(i, tmdbId) || i.type !== type) return true;
    if (type === 'movie') return false;
    if (season === undefined || episode === undefined) return false;

    return Number(i.season) !== Number(season) || Number(i.episode) !== Number(episode);
  });
  setStorageItem(WATCHED_KEY, list);
};
