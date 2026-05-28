import { ShieldAlert, ExternalLink, Info, AlertTriangle, Monitor, Globe, ShieldCheck, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function Ads() {
  const adblockers = [
    {
      name: 'uBlock Origin',
      platform: 'Chrome / Edge / Brave',
      url: 'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
      icon: <Globe size={20} className="text-blue-500" />
    },
    {
      name: 'uBlock Origin',
      platform: 'Firefox',
      url: 'https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/',
      icon: <Globe size={20} className="text-orange-500" />
    },
    {
      name: 'AdGuard',
      platform: 'Safari (macOS / iOS)',
      url: 'https://apps.apple.com/app/adguard-for-safari/id1440147259',
      icon: <Compass size={20} className="text-blue-400" />
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-12 bg-[#141414]">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-red-600/10 rounded-full mb-6">
            <ShieldAlert className="text-[#E50914] w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">About Advertisements</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Understanding why ads appear in the player and how to block them.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Explanation Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Info className="text-[#E50914]" /> Why are there ads?
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Ads are injected by the third-party embed services (VidSrc, VidLink, Streamed.su, etc.) directly inside the video player iframe.
              </p>
              <p>
                Since the iframe is hosted on a different domain, the browser's <span className="text-white font-semibold">Same-Origin Policy</span> completely blocks us from touching anything inside it. 
              </p>
              <p className="text-sm border-l-2 border-[#E50914] pl-4 italic">
                The honest answer: These free embed services monetise through ads. That's how they stay free. We make no profit from these ads.
              </p>
            </div>

            <h3 className="text-xl font-bold mt-8">What we cannot do:</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <span>Inject CSS to hide ad elements</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <span>Intercept clicks or prevent popups</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <span>Remove overlay divs</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <span>Block scripts that spawn ads</span>
              </li>
            </ul>
          </motion.div>

          {/* Solutions Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-[#181818] p-6 rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Monitor size={18} className="text-[#E50914]" /> Recommended Adblockers
              </h3>
              <div className="space-y-4">
                {adblockers.map((blocker, index) => (
                  <a 
                    key={index}
                    href={blocker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {blocker.icon}
                      <div>
                        <div className="text-sm font-bold text-white">{blocker.name}</div>
                        <div className="text-[10px] text-gray-500">{blocker.platform}</div>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-4 leading-tight italic">
                * For personal use, uBlock Origin is the industry standard. It kills most ads even inside iframes.
              </p>
            </div>

            <div className="bg-[#181818] p-6 rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> DNS-Level Blocking
              </h3>
              <p className="text-sm text-gray-400">
                Using a <span className="text-white">Pi-hole</span> or DNS-level blocker (like NextDNS or AdGuard DNS) blocks ad domains network-wide before they even reach the browser. Works on all devices on your network.
              </p>
            </div>

            <div className="bg-[#181818] p-6 rounded-lg border border-white/5">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-500">
                Partial Solutions
              </h3>
              <ul className="text-xs text-gray-400 space-y-2">
                <li>
                  <strong>Sandbox Attribute:</strong> We use <code className="bg-black/40 px-1 rounded">sandbox="allow-scripts allow-same-origin"</code> to block some popups, but many players break if sandboxed too strictly.
                </li>
                <li>
                  <strong>Allow Attribute:</strong> Restricting <code className="bg-black/40 px-1 rounded">allow</code> can limit some behavior but often breaks fullscreen and autoplay.
                </li>
              </ul>
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
            Our Commitment
          </p>
          <p className="text-xs text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cineflix is a <span className="text-gray-400">non-profit project</span>. We do not place any ads on this site ourselves. 
            The advertisements you see are entirely controlled by the external video providers. 
            By using this site, you acknowledge that we have no control over the content or behavior of these third-party iframes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
