import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Menu, X, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { getTrending, searchMulti, getImageUrl } from '../lib/tmdb';
import { MediaBase } from '../types/tmdb';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MediaBase[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurprising, setIsSurprising] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const { results } = await searchMulti(searchQuery);
        const filtered = results
          .filter(item => (item.media_type as string) !== 'person' && (item.poster_path || item.backdrop_path))
          .slice(0, 6);
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Close suggestions and search on navigation
    setShowSuggestions(false);
    if (location.pathname !== '/search') {
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'Movies', path: '/movies' },
    { name: 'Donate', path: '/donate' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
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
        const type = random.media_type || ((random as any).first_air_date ? 'tv' : 'movie');
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
          'fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-12 py-3 flex items-center justify-between',
          isScrolled 
            ? 'bg-[#141414]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        )}
      >
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="text-[#E50914] text-2xl font-black tracking-tighter uppercase transition-transform hover:scale-105">
            Cineflex
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm transition-all duration-300 hover:text-white',
                  location.pathname === link.path ? 'text-white font-bold' : 'text-white/70'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <button 
              onClick={handleSurprise}
              disabled={isSurprising}
              className="border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
            >
              {isSurprising ? 'Loading...' : 'Surprise Me'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 relative" ref={searchRef}>
            <button 
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <form onSubmit={handleSearch} className="flex items-center">
              <div className={cn(
                "flex items-center bg-black/40 border-white/0 transition-all duration-300 rounded-md",
                isSearchExpanded ? "border px-2 py-1.5 w-48 md:w-72 border-white/40 bg-black/60 backdrop-blur-md focus-within:border-white" : "w-10 h-10 justify-center hover:bg-white/10"
              )}>
                <button 
                  type="button"
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="text-white flex-none transition-transform hover:scale-110"
                >
                  <Search size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchExpanded) setIsSearchExpanded(true);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className={cn(
                    "bg-transparent text-white text-sm outline-none transition-all duration-300 placeholder:text-white/40",
                    isSearchExpanded ? "ml-3 w-full opacity-100" : "w-0 opacity-0 pointer-events-none"
                  )}
                />
                {isSearchExpanded && searchQuery && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="text-white/40 hover:text-white transition-colors ml-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* Auto-suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (isSearching || suggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 right-0 w-72 md:w-96 bg-[#181818] border border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[60]"
                >
                  <div className="p-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Suggestions</span>
                    {isSearching && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />}
                  </div>
                  
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const type = item.media_type || ((item as any).first_air_date ? 'tv' : 'movie');
                          navigate(`/${type}/${item.id}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="relative w-12 h-16 flex-none bg-black rounded overflow-hidden">
                          <img
                            src={getImageUrl(item.poster_path || item.backdrop_path, 'w92')}
                            alt=""
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
                            {item.title || item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                              {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
                            </span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] text-white/40 font-bold">
                              {((item as any).release_date || (item as any).first_air_date || '').split('-')[0]}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}

                    {suggestions.length > 0 && (
                      <button
                        onClick={handleSearch}
                        className="w-full p-3 text-center text-xs font-black text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest border-t border-white/5"
                      >
                        See all results for "{searchQuery}"
                      </button>
                    )}
                    
                    {!isSearching && suggestions.length === 0 && searchQuery.length >= 2 && (
                      <div className="p-8 text-center">
                        <p className="text-sm text-white/40">No matches found.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/my-list" className="hidden md:flex w-10 h-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-all">
            <Bookmark size={20} />
          </Link>

          <div className="w-8 h-8 rounded-sm bg-[#E50914] flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/10 transition-transform hover:scale-110 cursor-pointer">
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
              <span className="text-[#E50914] text-2xl font-black uppercase tracking-tighter">Cineflex</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
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
                    "text-xl py-3 border-l-4 pl-4 transition-all duration-300",
                    location.pathname === link.path ? "border-[#E50914] text-white font-bold bg-white/5" : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/my-list"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl py-3 border-l-4 pl-4 border-transparent text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                My List
              </Link>
              <Link
                to="/ads"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl py-3 border-l-4 pl-4 border-transparent text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                About Ads
              </Link>

              <button 
                onClick={handleSurprise}
                disabled={isSurprising}
                className="w-full mt-6 bg-white text-black text-xl py-4 rounded font-black hover:bg-white/90 transition-all disabled:opacity-50 uppercase tracking-tight shadow-xl"
              >
                {isSurprising ? 'Loading...' : 'Surprise Me'}
              </button>
            </div>
            
            <div className="mt-auto pt-8 border-t border-white/10">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] text-center">© 2026 Cineflex Entertainment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

