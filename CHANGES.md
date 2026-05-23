# Cineflix — Change Log

## [2026-05-20] — Session Summary
### Changes Made:
- Created `DESIGN_SYSTEM.md` in the project root, providing full documentation of the Cineflix visual identity, color palette, typography, components, and layout rules.
- Added global adult content filtering to all TMDB API calls by setting `include_adult: false` in the axios interceptor.
- Added a "Surprise Me" feature to the Navbar (desktop and mobile) that picks a random trending item.
- Removed progress bars from "Continue Watching" cards and detail pages.
- Redesigned the Watch page with external controls (top and bottom bars) and removed the global Navbar/Footer from it.
- Added a movie franchise/collection section to the movie detail page.
- Removed language and region restrictions from TMDB API calls to allow global content while keeping metadata in English.

### Files Modified:
- DESIGN_SYSTEM.md — New file documenting the design system.
- src/components/Navbar.tsx — Added "Surprise Me" button and random trending fetch logic.
- src/lib/tmdb.ts — Added adult content filtering, movie collections fetch, and removed language/era filters.
- src/pages/Watch.tsx — Complete redesign to flex column with persistent external controls.
- src/App.tsx — Implemented conditional rendering to hide global UI on Watch page.
- src/pages/Detail.tsx — Added movie collections section and removed progress bar.
- src/components/MediaCard.tsx — Removed progress bar JSX.
- CHANGES.md — Updated with session summary.

### Known Issues / Left To Do:
- None

### Branch:
- main
