# Cineflix Master Plan: Improvements & Refinements

This document tracks the planned enhancements for the Cineflix project, aimed at improving performance, feature depth, and UI/UX polish.

## Phase 1: Performance & Architecture (In Progress)
- [x] **Lazy Loading for Home Rows**: Implement Intersection Observer to fetch row data only when visible.
- [x] **Migrate to Zustand**: Replace `localStorage` + custom events with a robust state management library.
- [ ] **API Caching Layer**: Implement TanStack Query or a custom cache to deduplicate requests.

## Phase 2: Feature Depth (In Progress)
- [x] **Advanced Search**: Add pagination and filtering (Movie vs TV, Year, Genre).
- [ ] **Enhanced My List**: Add sorting and bulk actions.

## Phase 3: UI/UX Polish (In Progress)
- [x] **Horizontal Wheel Scroll**: Convert vertical mouse wheel to horizontal scroll in Media Rows.
- [ ] **Mobile Immersive Experience**: Optimize card expansion for touch (Long press/Quick info).
- [ ] **Standardized Skeletons**: Ensure consistent loading states across all pages.
- [ ] **Accessibility (A11y)**: Full keyboard navigation and ARIA compliance.

## Phase 4: Technical Quality
- [ ] **Component Testing**: Add Vitest/React Testing Library for core UI components.
- [ ] **E2E Testing**: Implement Playwright/Cypress for critical user flows.

---

# Detailed Plan: Lazy Loading for Media Rows

**Objective**: Reduce initial Home page load time by deferring API calls for rows below the fold.

### 1. Identify Target Component
- `src/components/MediaRow.tsx` is the primary container for list rendering.
- `src/pages/Home.tsx` currently fetches all data in a single `Promise.all`.

### 2. Refactor Strategy
- Modify `Home.tsx` to pass fetch-ready metadata (endpoints) to `MediaRow` instead of pre-fetched items.
- Update `MediaRow.tsx` to accept an `endpoint` prop.
- Use `useInView` (Intersection Observer) inside `MediaRow` to trigger the API call when the row is ~200px from the viewport.
- Show `SkeletonRow` while the specific row is loading.

### 3. Implementation Steps
1. Create a new branch: `feat/performance-ux-overhaul`.
2. Update `src/components/MediaRow.tsx` to handle internal data fetching if items aren't provided.
3. Update `src/pages/Home.tsx` to use the lazy-loading pattern.
4. Verify smooth scrolling and skeleton-to-content transitions.
