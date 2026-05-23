import { Heart, Coffee, ShieldAlert, Zap, Globe, Github } from 'lucide-react';
import { motion } from 'motion/react';

export default function Donate() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-12 bg-[#141414]">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-red-600/10 rounded-full mb-6">
            <Heart className="text-[#E50914] w-8 h-8 fill-[#E50914]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Support Cineflix</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Help keep this project alive, ad-free, and accessible for everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Story Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="text-[#E50914]" /> The Mission
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Hi, I'm a <span className="text-white font-semibold">18-year-old student</span> and the sole developer behind Cineflix. 
                I built this platform with a simple goal: to create a sleek, premium streaming experience that is 
                <span className="text-white font-semibold"> completely free and forever ad-free.</span>
              </p>
              <p>
                Maintaining a project like this requires constant updates, server costs, and time to ensure the 
                streaming sources remain functional and the UI stays polished.
              </p>
              <p>
                Your support goes directly towards the <span className="text-white font-semibold">long-term maintenance</span> 
                and development of new features for this site.
              </p>
            </div>

            <div className="pt-6">
              <a 
                href="https://www.mchanga.africa/fundraiser/140252" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#E50914] hover:bg-[#b90710] text-white px-8 py-4 rounded font-bold text-lg transition-all transform hover:scale-105"
              >
                <Coffee size={20} />
                Support the Project
              </a>
            </div>
          </motion.div>

          {/* Legal/Info Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-[#181818] p-6 rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Open & Transparent
              </h3>
              <p className="text-sm text-gray-400">
                Cineflix is a personal project intended for educational and personal use. No user data is sold, 
                and no intrusive tracking is used.
              </p>
            </div>

            <div className="bg-[#181818] p-6 rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <ShieldAlert size={18} className="text-yellow-500" /> Legal Implications
              </h3>
              <div className="text-xs text-gray-400 space-y-2">
                <p>
                  <strong>Content Hosting:</strong> Cineflix does not host, store, or upload any media files. 
                  All content is retrieved from third-party embedding services.
                </p>
                <p>
                  <strong>Copyright:</strong> This project acts as a browser-based frontend for external sources. 
                  However, the legality of embedding copyrighted content varies by jurisdiction and may be 
                  considered infringement in some regions.
                </p>
                <p>
                  <strong>Liability:</strong> The developer is not responsible for the content served by third-party 
                  providers. Users access this site at their own risk.
                </p>
              </div>
            </div>

            <div className="bg-[#181818] p-6 rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Github size={18} className="text-gray-400" /> Open Source
              </h3>
              <p className="text-sm text-gray-400">
                Feel free to contribute to the codebase or report issues on GitHub. Every star and PR helps!
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Disclaimer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-white/5 text-center"
        >
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">
            Legal Disclaimer
          </p>
          <p className="text-xs text-gray-600 max-w-3xl mx-auto leading-relaxed">
            This site is provided "as is" without any warranties. The developer is not affiliated with any of the 
            streaming sources used. By using this site, you acknowledge that you are responsible for complying 
            with your local copyright laws.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
