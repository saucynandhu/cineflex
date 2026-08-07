import { ShieldAlert, ExternalLink, Info, AlertTriangle, Monitor, Globe, ShieldCheck, Compass, EyeOff, Lock, Zap } from 'lucide-react';
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
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 bg-[#141414] text-white selection:bg-[#E50914]">
      <div className="max-w-5xl mx-auto">
        {/* Animated Background Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none z-0" />

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 relative z-10"
        >
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center p-4 bg-blue-600/20 rounded-full mb-8 backdrop-blur-sm border border-blue-600/30 shadow-[0_0_30px_rgba(37,99,235,0.2)]"
          >
            <ShieldAlert className="text-blue-500 w-10 h-10" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Ad Policy & Privacy
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Understanding how third-party players handle ads and how you can reclaim your viewing experience.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 mb-20 relative z-10">
          {/* Explanation Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-10"
          >
            <section className="space-y-6">
              <h2 className="text-3xl font-black flex items-center gap-4 text-white">
                <span className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Info size={24} className="text-white" />
                </span>
                The "Invisible" Barrier
              </h2>
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  Cineflex itself is <span className="text-white font-bold underline decoration-red-600 decoration-2">100% ad-free</span>. However, the video players you interact with are hosted by third-party providers such as VidSrc.me, VidFast, 2Embed, and SuperEmbed.
                </p>
                <p>
                  Due to a security browser feature called the <span className="text-white font-bold">Same-Origin Policy</span>, we are technically blocked from modifying anything inside the video player's frame. We cannot "reach in" to hide their ads or stop their popups.
                </p>
                <div className="bg-white/5 p-6 rounded-lg border-l-4 border-blue-500">
                  <p className="text-base italic text-gray-400">
                    "These services monetize through ads to keep their streaming infrastructure free. While we don't agree with intrusive ads, we have no control over their business model."
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-black text-white">Technical Constraints</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: <EyeOff size={18} />, title: "No DOM Access", desc: "We cannot see or remove ad elements inside the iframe." },
                  { icon: <Lock size={18} />, title: "No Click Interception", desc: "Popups are triggered by scripts we can't block." },
                  { icon: <ShieldAlert size={18} />, title: "Limited Sandboxing", desc: "Strict sandboxing often breaks video playback entirely." },
                  { icon: <Zap size={18} />, title: "Network Privacy", desc: "We use proxy layers where possible to mask your IP." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-colors">
                    <div className="text-blue-500 mb-2">{item.icon}</div>
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Solutions Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Adblocker Card */}
            <div className="bg-[#181818] p-8 rounded-xl border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <ShieldCheck size={24} className="text-green-500" /> Recommended Fixes
              </h3>
              <div className="space-y-3">
                {adblockers.map((blocker, index) => (
                  <a 
                    key={index}
                    href={blocker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {blocker.icon}
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{blocker.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{blocker.platform}</div>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-6 leading-relaxed font-medium">
                <span className="text-white font-bold">PRO TIP:</span> uBlock Origin is widely considered the only "true" adblocker. It works at the network request level to kill ads before they load.
              </p>
            </div>

            {/* DNS Card */}
            <div className="bg-[#181818] p-8 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Monitor size={100} />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Globe size={22} className="text-blue-400" /> DNS-Level Blocking
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4 relative z-10">
                For a permanent solution, use <span className="text-white font-bold">NextDNS</span> or <span className="text-white font-bold">AdGuard DNS</span>. These block ad domains network-wide, protecting your phone, TV, and laptop simultaneously.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Highly Recommended</span>
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-red-600/10 p-6 rounded-xl border border-red-600/20">
               <div className="flex gap-4">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-sm font-black text-red-600 uppercase tracking-tighter">Stay Safe</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Never download "Players" or "Codecs" prompted by an ad. Modern browsers handle everything. If a popup asks you to download something, close it immediately.
                    </p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Commitment */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-12 border-t border-white/5 text-center"
        >
          <div className="bg-white/5 inline-block px-4 py-1 rounded-full mb-6">
            <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Our Stance on Ads</span>
          </div>
          <p className="text-sm text-gray-600 max-w-4xl mx-auto leading-loose italic">
            Cineflex is and will always be <span className="text-gray-400">non-commercial</span>. We have no trackers, no cookies for sale, and no hidden agendas. We believe the internet should be a clean, beautiful place. While we can't fix the third-party providers, we hope these tools help you enjoy your movies in peace.
          </p>
          <p className="mt-8 text-gray-700 text-[10px] font-black uppercase tracking-[0.5em]">
            Privacy is a Human Right • 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
