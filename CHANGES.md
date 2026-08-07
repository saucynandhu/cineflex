# Cineflex — Change Log

## [2026-08-07] — Source Provider Cleanup
### Changes Made:
- Set VidSrc.me as the default watch-page video source.
- Added VidKing as the second video source option.
- Themed VidKing embeds with the Cineflex red player color.
- Removed broken providers from the source switcher: VidLink, AutoEmbed, AutoEmbed.co, VidSrc.icu, VidSrc.vip, Rivestream, and Pstream.
- Removed the Cineflex watch-page title from the top bar to avoid duplicating titles shown inside embedded players.
- Updated source tests to match the current provider list.
- Updated README provider documentation and the Donate page version badge.

### Files Modified:
- README.md — Documented the current supported video providers.
- src/lib/sources.ts — Removed broken source IDs, dropdown entries, and embed URL patterns.
- src/pages/Watch.tsx — Changed the default player source to VidSrc.me and removed the redundant top-bar media title.
- src/lib/sources.test.ts — Updated source tests for the current provider behavior.
- src/pages/Donate.tsx — Bumped the displayed stable version.

### Known Issues / Left To Do:
- Third-party embed availability can still change outside of Cineflex control.

### Branch:
- main

## [2026-05-20] — Session Summary
### Changes Made:
- Created `DESIGN_SYSTEM.md` in the project root, providing full documentation of the Cineflex visual identity, color palette, typography, components, and layout rules.
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
