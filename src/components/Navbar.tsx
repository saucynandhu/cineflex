import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { getTrending } from '../lib/tmdb';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurprising, setIsSurprising] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'Movies', path: '/movies' },
    { name: 'Donate', path: '/donate' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSurprise = async () => {
    if (isSurprising) return;
    setIsSurprising(true);
    try {
      const results = await getTrending('all', 'week');
      if (results && results.length > 0) {
        const random = results[Math.floor(Math.random() * results.length)];
        const type = random.media_type || (random.first_air_date ? 'tv' : 'movie');
        navigate(`/${type}/${random.id}`);
        setIsMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Failed to surprise:', error);
    } finally {
      setIsSurprising(false);
    }
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-3 flex items-center justify-between',
          isScrolled ? 'bg-[#141414] shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'bg-transparent'
        )}
      >
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="text-[#E50914] text-2xl font-black tracking-tighter uppercase">
            Cineflix
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm transition-colors duration-200 hover:text-white',
                  location.pathname === link.path ? 'text-white font-medium' : 'text-white/70'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <button 
              onClick={handleSurprise}
              disabled={isSurprising}
              className="border border-gray-600 text-white text-sm px-3 py-1 rounded-full hover:border-white transition 0.2s disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
            >
              {isSurprising ? 'Finding something...' : 'Surprise Me'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <form onSubmit={handleSearch} className="flex items-center">
              <div className={cn(
                "flex items-center bg-black/40 border-white/0 transition-all duration-300",
                isSearchExpanded ? "border px-2 py-1 w-40 md:w-60 border-white" : "w-8"
              )}>
                <button 
                  type="button"
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="text-white flex-none"
                >
                  <Search size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "bg-transparent text-white text-sm outline-none transition-all duration-300",
                    isSearchExpanded ? "ml-2 w-full opacity-100" : "w-0 opacity-0"
                  )}
                />
              </div>
            </form>
          </div>

          <Link to="/my-list" className="hidden md:block text-white hover:text-white/70 transition-colors">
            <Bookmark size={20} />
          </Link>

          <div className="w-8 h-8 rounded-sm bg-[#E50914] flex items-center justify-center text-white font-bold text-sm">
            N
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
            className="fixed inset-0 z-[100] bg-[#141414] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[#E50914] text-2xl font-black uppercase">Cineflix</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-xl py-2 border-l-4 pl-4 transition-all",
                    location.pathname === link.path ? "border-[#E50914] text-white font-bold" : "border-transparent text-white/70"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/my-list"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl py-2 border-l-4 pl-4 border-transparent text-white/70"
              >
                My List
              </Link>

              <button 
                onClick={handleSurprise}
                disabled={isSurprising}
                className="w-full mt-4 border border-white/20 text-white text-xl py-3 rounded font-bold hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {isSurprising ? 'Finding something...' : 'Surprise Me'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
