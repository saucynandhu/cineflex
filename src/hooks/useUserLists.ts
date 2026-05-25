import { useState, useCallback, useEffect } from 'react';
import * as lists from '../lib/userLists';
import { ListItem, ContinueWatchingItem, WatchedItem } from '../lib/userLists';

export function useUserLists() {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [watchLater, setWatchLater] = useState<ListItem[]>([]);
  const [watched, setWatched] = useState<WatchedItem[]>([]);

  const refreshLists = useCallback(() => {
    setContinueWatching(lists.getContinueWatching());
    setWatchLater(lists.getWatchLater());
    setWatched(lists.getPreviouslyWatched());
  }, []);

  useEffect(() => {
    refreshLists();
    
    const handleUpdate = () => refreshLists();

    // Listen for storage changes in other tabs
    window.addEventListener('storage', refreshLists);
    // Listen for changes in the same tab
    window.addEventListener('cineflix_list_update', handleUpdate);

    return () => {
      window.removeEventListener('storage', refreshLists);
      window.removeEventListener('cineflix_list_update', handleUpdate);
    };
  }, [refreshLists]);

  const triggerUpdate = useCallback(() => {
    window.dispatchEvent(new CustomEvent('cineflix_list_update'));
  }, []);

  const addToContinueWatching = useCallback((item: ContinueWatchingItem) => {
    lists.addToContinueWatching(item);
    triggerUpdate();
  }, [triggerUpdate]);

  const removeFromContinueWatching = useCallback((tmdbId: number, type: 'movie' | 'tv') => {
    lists.removeFromContinueWatching(tmdbId, type);
    triggerUpdate();
  }, [triggerUpdate]);

  const updateContinueWatching = useCallback((tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number, episodeName?: string) => {
    lists.updateContinueWatching(tmdbId, type, season, episode, episodeName);
    triggerUpdate();
  }, [triggerUpdate]);

  const addToWatchLater = useCallback((item: ListItem) => {
    lists.addToWatchLater(item);
    triggerUpdate();
  }, [triggerUpdate]);

  const removeFromWatchLater = useCallback((tmdbId: number, type: 'movie' | 'tv') => {
    lists.removeFromWatchLater(tmdbId, type);
    triggerUpdate();
  }, [triggerUpdate]);

  const toggleWatchLater = useCallback((item: ListItem) => {
    if (lists.isInWatchLater(item.tmdbId, item.type)) {
      lists.removeFromWatchLater(item.tmdbId, item.type);
    } else {
      lists.addToWatchLater(item);
    }
    triggerUpdate();
  }, [triggerUpdate]);

  const addToWatched = useCallback((item: WatchedItem) => {
    lists.addToWatched(item);
    triggerUpdate();
  }, [triggerUpdate]);

  const removeFromWatched = useCallback((tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
    lists.removeFromWatched(tmdbId, type, season, episode);
    triggerUpdate();
  }, [triggerUpdate]);

  const isInWatchLater = useCallback((tmdbId: number, type: 'movie' | 'tv') => {
    return lists.isInWatchLater(tmdbId, type);
  }, []);

  const isWatched = useCallback((tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
    return lists.isWatched(tmdbId, type, season, episode);
  }, []);

  return {
    continueWatching,
    watchLater,
    watched,
    addToContinueWatching,
    removeFromContinueWatching,
    updateContinueWatching,
    addToWatchLater,
    removeFromWatchLater,
    toggleWatchLater,
    addToWatched,
    removeFromWatched,
    isInWatchLater,
    isWatched,
    refreshLists
  };
}
