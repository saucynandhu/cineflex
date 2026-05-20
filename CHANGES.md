# Cineflix — Change Log

## [2026-05-20] — Session Summary
### Changes Made:
- Removed the global `Navbar` and `Footer` from the Watch page to provide a focused, distraction-free player experience.
- Updated `src/App.tsx` with a new `AppContent` component to access `useLocation` and conditionally render global UI components based on the route.
- Refactored the Watch page to move all controls outside of the `iframe` using a flex column layout in a previous task.
- Added a movie franchise/collection section to the movie detail page.
- Removed language restrictions from TMDB API calls to allow global content.

### Files Modified:
- src/App.tsx — Implemented conditional rendering for `Navbar` and `Footer`.
- src/pages/Watch.tsx — Previous refactor for layout and control visibility.
- src/lib/tmdb.ts — Previous updates for global content and collections.
- src/pages/Detail.tsx — Previous updates for movie collections.
- CHANGES.md — Updated with session summary.

### Known Issues / Left To Do:
- None

### Branch:
- main
