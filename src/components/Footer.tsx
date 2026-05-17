import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#141414] border-t border-[#333] py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
        <img 
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
          alt="TMDB Logo" 
          className="h-5 w-auto"
        />
        <p className="text-[#808080] text-xs md:text-sm font-medium max-w-md">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
