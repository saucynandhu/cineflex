/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Detail from './pages/Detail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Donate from './pages/Donate';
import Ads from './pages/Ads';
import Docs from './pages/Docs';
import Privacy from './pages/Privacy';
import License from './pages/License';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CardPortal from './components/CardPortal';

function AppContent() {
  const location = useLocation();
  const hideGlobalUI = location.pathname.startsWith('/watch');

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white flex flex-col">
      {!hideGlobalUI && <Navbar />}
      <main className="flex-1">
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
      </main>
      {!hideGlobalUI && <Footer />}
      <CardPortal />
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

