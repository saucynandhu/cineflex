# CineFlex — Netflix-Style Streaming Frontend

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)

A personal Netflix-style streaming frontend built with React 19, Vite, and TMDB. This project provides a sleek, responsive UI for browsing and watching movies and TV shows using third-party embedding services.

## Features
- **Browse Trending & Top Rated**: Explore the latest and greatest in movies and TV shows.
- **Advanced Search**: Powerful search with content-type filters and high-fidelity infinite scroll.
- **Intelligent Lazy Loading**: Optimized performance with rows that only fetch data when visible.
- **Mouse Wheel Navigation**: Intuitive horizontal scrolling for media rows using your mouse wheel.
- **Source Switcher**: Easily switch between video providers if one source is unavailable.
- **Quality-Aware Downloads**: Optional download modal with selectable quality levels from your configured authorized downloads provider.
- **Detailed Metadata**: Full detail pages with cast, ratings, release years, and descriptions.
- **Embedded Video Player**: Integrated player with multiple source options for reliable streaming.
- **Responsive Dark UI**: A fully responsive, Netflix-inspired dark theme optimized for all devices.
- **Smooth Animations**: High-quality hover effects and transitions using Framer Motion.

## Tech Stack
- **Framework**: React 19 (Vite)
- **State Management**: Zustand (with Persistence)
- **Performance**: Intersection Observer API (Lazy Loading)
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: The Movie Database (TMDB)
- **Video Sources**: Multiple third-party providers including VidLink, VidSrc, etc.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- A TMDB API Key

### Installation
1. **Clone the repo**:
   ```bash
   git clone https://github.com/saucynandhu/cineflex.git
   cd cineflex
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your TMDB API key:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_DOWNLOADS_API_URL=https://your-domain.example/api/downloads
   ```
   *Note: You can get a free API key by signing up at [TheMovieDB.org](https://www.themoviedb.org/settings/api).*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_TMDB_API_KEY` | Your TMDB API Key for fetching metadata. | Yes |
| `VITE_DOWNLOADS_API_URL` | Optional authorized downloads API. Supports a REST base URL ending in `/movie/:tmdbId` and `/tv/:tmdbId/:season/:episode`, or a template URL using `{type}`, `{tmdbId}`, `{season}`, and `{episode}`. | No |

### Downloads API Response
The downloads modal expects your provider to return one of these shapes:

```json
{
  "downloads": [
    {
      "url": "https://cdn.example.com/movie-1080p.mp4",
      "quality": "1080p",
      "size": "2.4 GB",
      "format": "MP4",
      "server": "Main"
    }
  ]
}
```

Arrays are also supported directly, and `link`, `href`, `resolution`, `fileSize`, and `type` are accepted as aliases.

## Project Structure
```
cineflex/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components (Navbar, MediaCard, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and API clients
│   ├── pages/          # Application pages (Home, Detail, Watch, etc.)
│   ├── types/          # TypeScript type definitions
│   └── main.tsx        # Application entry point
├── server.ts           # Optional Express proxy server
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## URL Structure
- `/` — Homepage (Trending & Popular)
- `/movies` — Browse all movies
- `/tv` — Browse all TV shows
- `/movie/[id]` — Movie detail page
- `/tv/[id]` — TV show detail page
- `/watch/movie/[id]` — Movie player
- `/watch/tv/[id]/[season]/[episode]` — TV player
- `/search?q=` — Search results page
- `/my-list` — Personal watch later list

## Legal Disclaimer
This project is for educational and personal use only. It does not host, store, or distribute any media content. All video content is sourced directly from third-party embedding services. The developers are not responsible for the content provided by these external sources.

## License
Distributed under the MIT License. See `LICENSE` for more information.
 
