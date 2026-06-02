import { useUserListsStore } from '../store/useUserListsStore';

export function useUserLists() {
  const store = useUserListsStore();

  return {
    continueWatching: store.continueWatching,
    watchLater: store.watchLater,
    watched: store.watched,
    addToContinueWatching: store.addToContinueWatching,
    removeFromContinueWatching: store.removeFromContinueWatching,
    updateContinueWatching: store.updateContinueWatching,
    addToWatchLater: store.addToWatchLater,
    removeFromWatchLater: store.removeFromWatchLater,
    toggleWatchLater: store.toggleWatchLater,
    addToWatched: store.addToWatched,
    removeFromWatched: store.removeFromWatched,
    isInWatchLater: store.isInWatchLater,
    isWatched: store.isWatched,
    // refreshLists is no longer needed with Zustand, but kept for compatibility
    refreshLists: () => {}
  };
}
