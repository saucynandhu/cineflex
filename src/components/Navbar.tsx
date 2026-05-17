import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-colors duration-300 ease-in-out px-4 md:px-12 py-4 flex items-center justify-between',
        isScrolled ? 'bg-[#141414]/90 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      )}
    >
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center">
          <span className="text-[#E50914] text-2xl md:text-3xl font-black tracking-tighter uppercase italic">
            Cineflix
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={cn(
              'hover:text-gray-300 transition-colors',
              location.pathname === '/' ? 'text-white' : 'text-gray-400'
            )}
          >
            Home
          </Link>
          <Link
            to="/tv"
            className={cn(
              'hover:text-gray-300 transition-colors',
              location.pathname === '/tv' ? 'text-white' : 'text-gray-400'
            )}
          >
            TV Shows
          </Link>
          <Link
            to="/movies"
            className={cn(
              'hover:text-gray-300 transition-colors',
              location.pathname === '/movies' ? 'text-white' : 'text-gray-400'
            )}
          >
            Movies
          </Link>
          <Link to="/" className="text-gray-400 hover:text-gray-300 transition-colors">
            New & Popular
          </Link>
          <Link to="/" className="text-gray-400 hover:text-gray-300 transition-colors">
            My List
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative flex items-center">
          <AnimatePresence>
            {isSearchOpen ? (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '200px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-black/40 border border-white/20 rounded-sm overflow-hidden"
              >
                <button type="submit" className="px-2 text-gray-400">
                  <Search size={18} />
                </button>
                <input
                  autoFocus
                  type="text"
                  placeholder="Titles, people, genres"
                  className="bg-transparent border-none outline-none text-sm py-1 pr-2 w-full placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
              </motion.form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Search size={22} />
              </button>
            )}
          </AnimatePresence>
        </div>
        
        <span className="hidden sm:inline text-sm font-medium text-gray-300 cursor-pointer hover:text-white">
          DVD
        </span>
        <Bell size={22} className="cursor-pointer text-white hover:text-gray-300" />
        <div className="w-8 h-8 rounded-sm bg-blue-500 flex items-center justify-center cursor-pointer overflow-hidden border border-white/10">
          <User size={20} className="text-white" />
        </div>
      </div>
    </nav>
  );
}
