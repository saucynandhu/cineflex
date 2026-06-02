import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

interface UserListsState {
  continueWatching: ContinueWatchingItem[];
  watchLater: ListItem[];
  watched: WatchedItem[];

  // Actions
  addToContinueWatching: (item: ContinueWatchingItem) => void;
  removeFromContinueWatching: (tmdbId: number, type: 'movie' | 'tv') => void;
  updateContinueWatching: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number, episodeName?: string) => void;
  
  addToWatchLater: (item: ListItem) => void;
  removeFromWatchLater: (tmdbId: number, type: 'movie' | 'tv') => void;
  toggleWatchLater: (item: ListItem) => void;
  isInWatchLater: (tmdbId: number, type: 'movie' | 'tv') => boolean;

  addToWatched: (item: WatchedItem) => void;
  removeFromWatched: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => void;
  isWatched: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => boolean;
}

const MAX_CONTINUE_WATCHING = 20;
const MAX_WATCH_LATER = 100;
const MAX_WATCHED = 200;

function hasSameMediaId(item: ListItem, tmdbId: number): boolean {
  return Number(item.tmdbId) === Number(tmdbId) || Number(item.id) === Number(tmdbId);
}

function isSameWatchedItem(item: WatchedItem, target: WatchedItem): boolean {
  if (item.type !== target.type || !hasSameMediaId(item, target.tmdbId)) return false;
  if (target.type === 'movie') return true;
  return Number(item.season) === Number(target.season) && Number(item.episode) === Number(target.episode);
}

export const useUserListsStore = create<UserListsState>()(
  persist(
    (set, get) => ({
      continueWatching: [],
      watchLater: [],
      watched: [],

      addToContinueWatching: (item) => {
        const list = get().continueWatching;
        const filtered = list.filter(i => !(hasSameMediaId(i, item.tmdbId) && i.type === item.type));
        const newList = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, MAX_CONTINUE_WATCHING);
        set({ continueWatching: newList });
      },

      removeFromContinueWatching: (tmdbId, type) => {
        set((state) => ({
          continueWatching: state.continueWatching.filter(i => !(hasSameMediaId(i, tmdbId) && i.type === type))
        }));
      },

      updateContinueWatching: (tmdbId, type, season, episode, episodeName) => {
        const list = get().continueWatching;
        const index = list.findIndex(i => hasSameMediaId(i, tmdbId) && i.type === type);
        
        if (index !== -1) {
          const item = { ...list[index] };
          if (season !== undefined) item.season = season;
          if (episode !== undefined) item.episode = episode;
          if (episodeName !== undefined) item.episodeName = episodeName;
          item.watchedAt = Date.now();

          const filtered = list.filter((_, i) => i !== index);
          set({ continueWatching: [item, ...filtered].slice(0, MAX_CONTINUE_WATCHING) });
        }
      },

      addToWatchLater: (item) => {
        if (!get().isInWatchLater(item.tmdbId, item.type)) {
          set((state) => ({
            watchLater: [{ ...item, addedAt: Date.now() }, ...state.watchLater].slice(0, MAX_WATCH_LATER)
          }));
        }
      },

      removeFromWatchLater: (tmdbId, type) => {
        set((state) => ({
          watchLater: state.watchLater.filter(i => !(hasSameMediaId(i, tmdbId) && i.type === type))
        }));
      },

      toggleWatchLater: (item) => {
        if (get().isInWatchLater(item.tmdbId, item.type)) {
          get().removeFromWatchLater(item.tmdbId, item.type);
        } else {
          get().addToWatchLater(item);
        }
      },

      isInWatchLater: (tmdbId, type) => {
        return get().watchLater.some(i => hasSameMediaId(i, tmdbId) && i.type === type);
      },

      addToWatched: (item) => {
        const list = get().watched;
        const filtered = list.filter(i => !isSameWatchedItem(i, item));
        set({ watched: [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, MAX_WATCHED) });
      },

      removeFromWatched: (tmdbId, type, season, episode) => {
        set((state) => ({
          watched: state.watched.filter(i => {
            if (!hasSameMediaId(i, tmdbId) || i.type !== type) return true;
            if (type === 'movie') return false;
            if (season === undefined || episode === undefined) return false;
            return Number(i.season) !== Number(season) || Number(i.episode) !== Number(episode);
          })
        }));
      },

      isWatched: (tmdbId, type, season, episode) => {
        return get().watched.some(i => {
          if (!hasSameMediaId(i, tmdbId) || i.type !== type) return false;
          if (type === 'movie') return true;
          if (season === undefined || episode === undefined) return true;
          return Number(i.season) === Number(season) && Number(i.episode) === Number(episode);
        });
      },
    }),
    {
      name: 'cineflex-user-lists',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
