import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'Movies', path: '/movies' },
    { name: 'My List', path: '/my-list' },
    { name: 'Watched', path: '/watched' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 z-50 w-full transition-colors duration-300 ease-in-out px-4 md:px-12 py-3 md:py-4 flex items-center justify-between',
          isScrolled || isMobileMenuOpen ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
        )}
      >
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            className="md:hidden text-white hover:text-gray-300 transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center">
            <span className="text-[#E50914] text-xl md:text-3xl font-black tracking-tighter uppercase italic">
              Cineflix
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'hover:text-gray-300 transition-colors whitespace-nowrap',
                  location.pathname === link.path ? 'text-white' : 'text-gray-400'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex lg:hidden items-center gap-4 text-xs font-medium">
             <Link to="/" className={cn(location.pathname === '/' ? 'text-white' : 'text-gray-400')}>Home</Link>
             <Link to="/tv" className={cn(location.pathname === '/tv' ? 'text-white' : 'text-gray-400')}>TV</Link>
             <Link to="/movies" className={cn(location.pathname === '/movies' ? 'text-white' : 'text-gray-400')}>Movies</Link>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: window.innerWidth < 640 ? '140px' : '200px', opacity: 1 }}
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
                    placeholder="Search"
                    className="bg-transparent border-none outline-none text-xs md:text-sm py-1 pr-2 w-full placeholder:text-gray-500 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setIsSearchOpen(false)}
                  />
                </motion.form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-white hover:text-gray-300 transition-colors p-1"
                >
                  <Search size={20} className="md:w-5 md:h-5" />
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#141414] pt-20 flex flex-col items-center gap-8 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 w-full px-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'text-lg font-bold w-full text-center py-3 rounded-md transition-colors',
                    location.pathname === link.path ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
