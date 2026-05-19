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

export interface ContinueWatchingItem extends ListItem {
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

const CONTINUE_WATCHING_KEY = 'cineflix_continue_watching';
const WATCH_LATER_KEY = 'cineflix_watch_later';
const WATCHED_KEY = 'cineflix_watched';

const MAX_CONTINUE_WATCHING = 20;
const MAX_WATCH_LATER = 100;
const MAX_WATCHED = 200;

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

// Continue Watching
export const getContinueWatching = (): ContinueWatchingItem[] => 
  getStorageItem<ContinueWatchingItem[]>(CONTINUE_WATCHING_KEY, []);

export const addToContinueWatching = (item: ContinueWatchingItem): void => {
  let list = getContinueWatching();
  const index = list.findIndex(i => 
    (Number(i.tmdbId) === Number(item.tmdbId) || Number(i.id) === Number(item.tmdbId)) && i.type === item.type
  );
  
  if (index !== -1) {
    list.splice(index, 1);
  }
  
  list.unshift({ ...item, watchedAt: Date.now() });
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

export const updateContinueWatching = (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): void => {
  const list = getContinueWatching();
  const item = list.find(i => (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) && i.type === type);
  if (item) {
    item.season = season;
    item.episode = episode;
    item.watchedAt = Date.now();
    // Move to front
    const filtered = list.filter(i => !( (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) && i.type === type));
    filtered.unshift(item);
    setStorageItem(CONTINUE_WATCHING_KEY, filtered.slice(0, MAX_CONTINUE_WATCHING));
  }
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
  const index = list.findIndex(i => (Number(i.tmdbId) === Number(item.tmdbId) || Number(i.id) === Number(item.tmdbId)) && i.type === item.type);
  
  if (index !== -1) {
    list.splice(index, 1);
  }
  
  list.unshift({ ...item, watchedAt: Date.now() });
  list = list.slice(0, MAX_WATCHED);
  setStorageItem(WATCHED_KEY, list);
};

export const isWatched = (tmdbId: number, type: 'movie' | 'tv'): boolean => {
  return getPreviouslyWatched().some(i => (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) && i.type === type);
};

export const removeFromWatched = (tmdbId: number, type: 'movie' | 'tv'): void => {
  const list = getPreviouslyWatched().filter(i => 
    !(
      (Number(i.tmdbId) === Number(tmdbId) || Number(i.id) === Number(tmdbId)) 
      && i.type === type
    )
  );
  setStorageItem(WATCHED_KEY, list);
};
