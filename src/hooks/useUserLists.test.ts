import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserLists } from './useUserLists';
import { useUserListsStore } from '../store/useUserListsStore';

const resetStore = () => {
  useUserListsStore.setState({
    continueWatching: [],
    watchLater: [],
    watched: [],
  });
  localStorage.removeItem('cineflex-user-lists');
};

const movieItem = (id: number, title = 'Inception') => ({
  id,
  tmdbId: id,
  type: 'movie' as const,
  title,
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  year: '2010',
  addedAt: 0,
});

beforeEach(() => {
  localStorage.clear();
  resetStore();
});

describe('useUserLists', () => {
  it('returns initial empty lists', () => {
    const { result } = renderHook(() => useUserLists());
    
    expect(result.current.continueWatching).toHaveLength(0);
    expect(result.current.watchLater).toHaveLength(0);
    expect(result.current.watched).toHaveLength(0);
  });

  it('toggles watch later on and off', () => {
    const { result } = renderHook(() => useUserLists());
    const item = movieItem(101);

    act(() => {
      result.current.toggleWatchLater(item);
    });
    expect(result.current.watchLater).toHaveLength(1);
    expect(result.current.isInWatchLater(101, 'movie')).toBe(true);

    act(() => {
      result.current.toggleWatchLater(item);
    });
    expect(result.current.watchLater).toHaveLength(0);
    expect(result.current.isInWatchLater(101, 'movie')).toBe(false);
  });

  it('adds and removes from continue watching', () => {
    const { result } = renderHook(() => useUserLists());
    const item = { ...movieItem(202, 'Breaking Bad'), type: 'tv' as const, watchedAt: Date.now() };

    act(() => {
      result.current.addToContinueWatching(item);
    });
    expect(result.current.continueWatching).toHaveLength(1);

    act(() => {
      result.current.removeFromContinueWatching(202, 'tv');
    });
    expect(result.current.continueWatching).toHaveLength(0);
  });

  it('adds and removes from watched list', () => {
    const { result } = renderHook(() => useUserLists());
    const item = { ...movieItem(303), watchedAt: Date.now() };

    act(() => {
      result.current.addToWatched(item);
    });
    expect(result.current.watched).toHaveLength(1);
    expect(result.current.isWatched(303, 'movie')).toBe(true);

    act(() => {
      result.current.removeFromWatched(303, 'movie');
    });
    expect(result.current.watched).toHaveLength(0);
    expect(result.current.isWatched(303, 'movie')).toBe(false);
  });

  it('updates continue watching with episode info', () => {
    const { result } = renderHook(() => useUserLists());
    
    act(() => {
      result.current.addToContinueWatching({
        ...movieItem(404, 'Breaking Bad'),
        type: 'tv',
        season: 1,
        episode: 1,
        episodeName: 'Pilot',
        watchedAt: Date.now(),
      });
    });

    act(() => {
      result.current.updateContinueWatching(404, 'tv', 1, 2, 'Cat\'s in the Bag...');
    });

    const cwItem = result.current.continueWatching.find(i => i.tmdbId === 404);
    expect(cwItem?.season).toBe(1);
    expect(cwItem?.episode).toBe(2);
    expect(cwItem?.episodeName).toBe("Cat's in the Bag...");
  });
});
