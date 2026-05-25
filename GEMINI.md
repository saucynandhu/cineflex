# Cineflix Project Context

This project is a Netflix-style streaming frontend built with **React 19**, **Vite**, and **Tailwind CSS 4**. It uses **The Movie Database (TMDB)** as its primary metadata source and integrates various third-party embedding services for video playback.

> **Note:** The `README.md` mentions Next.js 14, but the current implementation is a Vite-based SPA.

## Project Overview

- **Architecture:** Single Page Application (SPA) with a custom Express proxy server (`server.ts`) for TMDB API requests and production hosting.
- **Frontend Framework:** React 19 with React Router 7 for client-side routing.
- **Styling:** Tailwind CSS 4, following the guidelines in `DESIGN_SYSTEM.md`.
- **Animations:** Framer Motion (`motion` package).
- **Icons:** Lucide React.
- **Data Source:** TMDB API via `axios` in `src/lib/tmdb.ts`.

## Building and Running

### Development
1. **Environment Variables:** Create a `.env` file (based on `.env.example`) and add your `VITE_TMDB_API_KEY`.
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   *Note: Standard Vite dev server. If you need the proxy features from `server.ts`, you may need to run it via `tsx server.ts`.*

3. **Type Checking:**
   ```bash
   npm run lint
   ```

### Production
1. **Build:**
   ```bash
   npm run build
   ```
2. **Preview:**
   ```bash
   npm run preview
   ```

## Development Conventions

### Coding Style
- **TypeScript:** Use strict typing. Avoid `any` whenever possible.
- **Components:** Functional components with Hooks. Prefer clean, modular components in `src/components/`.
- **State Management:** Use local React state or custom hooks (like `src/hooks/useUserLists.ts`).
- **Styling:** Strictly adhere to `DESIGN_SYSTEM.md`. Use Tailwind utility classes. Avoid custom CSS unless necessary (use `src/index.css` for globals).
- **Icons:** Use `lucide-react`. Standard sizes are 16px, 20px, or 24px.

### API Integration
- All TMDB interactions should go through `src/lib/tmdb.ts`.
- Use the `getImageUrl` utility for poster and backdrop paths.

### Performance & UX
- Use `motion` for smooth hover effects and transitions.
- Implement skeleton loaders or graceful fallbacks for image loading.
- Ensure the UI is responsive, particularly for the media rows and hero section.

## Key Files & Directories

- `src/App.tsx`: Main routing and global layout (Navbar/Footer).
- `src/pages/`: Page-level components (Home, Detail, Watch, etc.).
- `src/components/`: Reusable UI elements (MediaCard, MediaRow, Navbar).
- `src/lib/tmdb.ts`: API client configuration and endpoints.
- `server.ts`: Custom Express server (Proxy + Production Hosting).
- `DESIGN_SYSTEM.md`: Source of truth for visual tokens and UI patterns.
- `vercel.json`: Deployment configuration for Vercel.
