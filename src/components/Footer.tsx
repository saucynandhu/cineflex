import React from 'react';

import { Heart, ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#141414] border-t border-[#333] py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-3">
          <img 
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
            alt="TMDB Logo" 
            className="h-4 w-auto"
          />
          <p className="text-[#808080] text-[10px] md:text-xs font-medium max-w-md">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[#808080] text-[10px] md:text-xs font-medium">
          <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <Heart size={14} className="text-[#E50914]" />
            <a href="/donate">Support Me</a>
          </span>
          <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <ShieldAlert size={14} className="text-[#E50914]" />
            <a href="/ads">About Ads</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
