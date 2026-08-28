import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getInitialUserListsData, ListItem, useUserListsStore, WatchedItem } from './useUserListsStore';

const STORE_KEY = 'cineflex-user-lists';

const resetStore = () => {
  useUserListsStore.setState({
    continueWatching: [],
    watchLater: [],
    watched: [],
  });
  // resetStore triggers the Zustand persist middleware which writes the
  // store key back to localStorage.  Remove it so that tests exercising
  // the legacy-migration path in getInitialUserListsData() aren't blocked.
  localStorage.removeItem(STORE_KEY);
};

const movieItem = (id: number, title = 'Inception'): ListItem => ({
  id,
  tmdbId: id,
  type: 'movie',
  title,
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  year: '2010',
  addedAt: 0,
});

const tvWatchedItem = (tmdbId: number, season: number, episode: number): WatchedItem => ({
  id: tmdbId,
  tmdbId,
  type: 'tv',
  title: 'Breaking Bad',
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  year: '2008',
  addedAt: 0,
  watchedAt: 0,
  season,
  episode,
});

describe('useUserListsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
    vi.clearAllMocks();
  });

  it('toggles watch later items by TMDB id and type', () => {
    const item = movieItem(101);

    useUserListsStore.getState().toggleWatchLater(item);
    expect(useUserListsStore.getState().watchLater).toHaveLength(1);
    expect(useUserListsStore.getState().isInWatchLater(101, 'movie')).toBe(true);

    useUserListsStore.getState().toggleWatchLater(item);
    expect(useUserListsStore.getState().watchLater).toHaveLength(0);
    expect(useUserListsStore.getState().isInWatchLater(101, 'movie')).toBe(false);
  });

  it('moves updated continue-watching items to the front', () => {
    useUserListsStore.getState().addToContinueWatching({
      ...movieItem(101),
      watchedAt: 0,
    });
    useUserListsStore.getState().addToContinueWatching({
      ...movieItem(202, 'Breaking Bad'),
      type: 'tv',
      season: 1,
      episode: 1,
      episodeName: 'Pilot',
      watchedAt: 0,
    });

    useUserListsStore.getState().updateContinueWatching(101, 'movie');

    const list = useUserListsStore.getState().continueWatching;
    expect(list).toHaveLength(2);
    expect(list[0].tmdbId).toBe(101);
  });

  it('tracks watched TV episodes independently', () => {
    useUserListsStore.getState().addToWatched(tvWatchedItem(202, 1, 1));
    useUserListsStore.getState().addToWatched(tvWatchedItem(202, 1, 2));

    expect(useUserListsStore.getState().isWatched(202, 'tv', 1, 1)).toBe(true);
    expect(useUserListsStore.getState().isWatched(202, 'tv', 1, 2)).toBe(true);

    useUserListsStore.getState().removeFromWatched(202, 'tv', 1, 1);

    expect(useUserListsStore.getState().isWatched(202, 'tv', 1, 1)).toBe(false);
    expect(useUserListsStore.getState().isWatched(202, 'tv', 1, 2)).toBe(true);
  });

  it('reads legacy localStorage list data when no Zustand state exists', () => {
    localStorage.setItem(
      'cineflex_watch_later',
      JSON.stringify([{ id: 303, type: 'movie', title: 'Old Movie', posterPath: '/path', year: '1990' }]),
    );

    const initial = getInitialUserListsData();

    expect(initial.watchLater).toHaveLength(1);
    expect(initial.watchLater[0]).toMatchObject({
      id: 303,
      tmdbId: 303,
      title: 'Old Movie',
    });
  });
});
