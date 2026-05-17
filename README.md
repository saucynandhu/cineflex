# CineFlix — Netflix-Style Streaming Frontend

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)

A personal Netflix-style streaming frontend built with Next.js and TMDB. This project provides a sleek, responsive UI for browsing and watching movies and TV shows using third-party embedding services.

## Screenshots
*Add screenshots here*x

## Features
- **Browse Trending & Top Rated**: Explore the latest and greatest in movies and TV shows.
- **Genre Filtering**: Filter content by your favorite genres.
- **Detailed Metadata**: Full detail pages with cast, ratings, release years, and descriptions.
- **Embedded Video Player**: Integrated player with multiple source options for reliable streaming.
- **Source Switcher**: Easily switch between video providers if one source is unavailable.
- **Search Functionality**: Quickly find any title across the vast TMDB database.
- **Responsive Dark UI**: A fully responsive, Netflix-inspired dark theme optimized for all devices.
- **Smooth Animations**: High-quality hover effects and transitions using Framer Motion.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: The Movie Database (TMDB)
- **Video Sources**: VidLink, VidSrc.me, VidSrc.cc, VidSrc.icu, 2Embed, SuperEmbed

## Getting Started

### Prerequisites
- Node.js 18 or higher
- A TMDB API Key

### Installation
1. **Clone the repo**:
   ```bash
   git clone https://github.com/yourusername/cineflix.git
   cd cineflix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your TMDB API key:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
   ```
   *Note: You can get a free API key by signing up at [TheMovieDB.org](https://www.themoviedb.org/settings/api).*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_TMDB_API_KEY` | Your TMDB API Key for fetching metadata. | Yes |

## Project Structure
```
cineflix/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components (Navbar, MediaCard, etc.)
│   ├── lib/            # Utility functions and API clients (tmdb.ts)
│   ├── pages/          # Application pages (Home, Detail, Watch, etc.)
│   └── main.tsx        # Application entry point
├── .env.example        # Example environment variables
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
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

## Video Sources
| Source | Base URL |
|--------|----------|
| VidLink | `https://vidlink.pro` |
| VidSrc.me | `https://vidsrc.me/embed` |
| VidSrc.cc | `https://vidsrc.cc/v2/embed` |
| VidSrc.icu | `https://vidsrc.icu/embed` |
| 2Embed | `https://www.2embed.cc` |
| SuperEmbed | `https://multiembed.mov` |

## Known Limitations
- **Third-Party Sources**: Embed sources are maintained by third parties and may go down or stop working at any time.
- **Availability**: Some older or obscure titles may not be available on all sources.
- **Advertisements**: Some embedding services may serve third-party advertisements.
- **Personal Use**: This project is intended for personal and educational use only.

## Legal Disclaimer
This project is for educational and personal use only. It does not host, store, or distribute any media content. All video content is sourced directly from third-party embedding services. The developers are not responsible for the content provided by these external sources.

## Contributing
Contributions are welcome! If you'd like to improve the UI, add features, or fix bugs:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License
Distributed under the MIT License. See `LICENSE` for more information.
