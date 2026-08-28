/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const TVShows = lazy(() => import('./pages/TVShows'));
const Detail = lazy(() => import('./pages/Detail'));
const Watch = lazy(() => import('./pages/Watch'));
const Search = lazy(() => import('./pages/Search'));
const MyList = lazy(() => import('./pages/MyList'));
const Donate = lazy(() => import('./pages/Donate'));
const Ads = lazy(() => import('./pages/Ads'));
const Docs = lazy(() => import('./pages/Docs'));
const Privacy = lazy(() => import('./pages/Privacy'));
const License = lazy(() => import('./pages/License'));

function AppContent() {
  const location = useLocation();
  const hideGlobalUI = location.pathname.startsWith('/watch');

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white flex flex-col">
      {!hideGlobalUI && <Navbar />}
      <main className="flex-1">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/ads" element={<Ads />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/license" element={<License />} />
            <Route path="/movie/:id" element={<Detail type="movie" />} />
            <Route path="/tv/:id" element={<Detail type="tv" />} />
            <Route path="/watch/movie/:id" element={<Watch type="movie" />} />
            <Route path="/watch/tv/:id/:season/:episode" element={<Watch type="tv" />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!hideGlobalUI && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
