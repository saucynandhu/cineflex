# Cineflix — Change Log

## [2026-05-20] — Session Summary
### Changes Made:
- Added a movie franchise/collection section to the movie detail page.
- Implemented `getCollection` in `src/lib/tmdb.ts` to fetch movie set data.
- Updated `src/pages/Detail.tsx` to display collection members with "Now Watching" status for the current movie.
- Collection parts are sorted chronologically and filtered for valid posters.
- Removed language restrictions from TMDB API calls in previous task of same session.

### Files Modified:
- src/lib/tmdb.ts — Added `getCollection` function and updated interceptor.
- src/pages/Detail.tsx — Integrated collection fetching and rendering.
- CHANGES.md — Updated with session summary.

### Known Issues / Left To Do:
- None

### Branch:
- main
