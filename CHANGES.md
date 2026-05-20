# Cineflix — Change Log

## [2026-05-20] — Session Summary
### Changes Made:
- Removed progress bars from "Continue Watching" cards in `MediaCard.tsx` and the `Detail.tsx` page.
- Verified that the `progress` property is removed from `ContinueWatchingItem` and related logic in `userLists.ts`.
- Removed global `Navbar` and `Footer` from the Watch page for a focused player experience.
- Refactored the Watch page to a flex column layout with persistent external controls.
- Added movie franchise/collection section to the movie detail page.
- Removed language restrictions from TMDB API calls to allow global content.

### Files Modified:
- src/components/MediaCard.tsx — Removed progress bar JSX.
- src/pages/Detail.tsx — Removed progress bar from Continue Watching section.
- src/App.tsx — Implemented conditional rendering for `Navbar` and `Footer`.
- src/pages/Watch.tsx — Major refactor for layout and control visibility.
- src/lib/tmdb.ts — Added `getCollection` and updated interceptor for global content.
- CHANGES.md — Updated with session summary.

### Known Issues / Left To Do:
- None

### Branch:
- main
