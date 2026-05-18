/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Detail from './pages/Detail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Watched from './pages/Watched';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/watched" element={<Watched />} />
            <Route path="/movie/:id" element={<Detail type="movie" />} />
            <Route path="/tv/:id" element={<Detail type="tv" />} />
            <Route path="/watch/movie/:id" element={<Watch type="movie" />} />
            <Route path="/watch/tv/:id/:season/:episode" element={<Watch type="tv" />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

