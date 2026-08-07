import { useState, useEffect } from 'react';
import { Github, Code, Sparkles, Cpu, Palette, Terminal, Globe, Heart, Rocket, FileText, Shield, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Donate() {
  const [age, setAge] = useState<string>("");

  useEffect(() => {
    const birthDate = new Date('2007-09-03T00:00:00');
    
    const updateAge = () => {
      const now = new Date();
      const diff = now.getTime() - birthDate.getTime();
      const ageInYears = diff / (1000 * 60 * 60 * 24 * 365.25);
      setAge(ageInYears.toFixed(9));
    };

    updateAge();
    const timer = setInterval(updateAge, 50);
    return () => clearInterval(timer);
  }, []);

  const techStack = [
    { name: 'React 19', icon: <Code size={16} />, color: 'text-blue-400' },
    { name: 'Vite 6', icon: <ZapIcon size={16} />, color: 'text-yellow-400' },
    { name: 'Tailwind 4', icon: <Palette size={16} />, color: 'text-cyan-400' },
    { name: 'Framer Motion', icon: <Sparkles size={16} />, color: 'text-purple-400' },
    { name: 'TypeScript', icon: <Terminal size={16} />, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#141414] text-white selection:bg-[#E50914] overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.05)_0,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-24 pt-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-red-600 blur-[60px] opacity-20 animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-br from-[#E50914] to-[#b90710] rounded-3xl flex items-center justify-center shadow-2xl relative z-10 transform rotate-12">
              <Rocket size={48} className="text-white -rotate-12" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter"
          >
            CINEFLEX <span className="text-red-600">LABS</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl font-medium leading-relaxed"
          >
            Engineering the future of private, open-source cinema. No trackers, no corporate bloat, just pure code.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-32">
          {[
            {
              title: "Open Source First",
              desc: "Built entirely in public. Every line of code is available for inspection and contribution on GitHub.",
              icon: <Github className="text-white" size={32} />,
              color: "border-white/10",
              link: "/docs"
            },
            {
              title: "Zero Data Footprint",
              desc: "We don't use cookies, database logs, or trackers. Your watch history stays in your browser's local storage.",
              icon: <Globe className="text-blue-500" size={32} />,
              color: "border-blue-500/20",
              link: "/privacy"
            },
            {
              title: "Premium Performance",
              desc: "Optimized with React 19 and Vite 6 for instant transitions and a pixel-perfect 1:1 Netflix experience.",
              icon: <Cpu className="text-red-600" size={32} />,
              color: "border-red-600/20",
              link: "/license"
            }
          ].map((item, i) => (
            <Link to={item.link} key={i}>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className={`h-full p-10 bg-[#181818]/60 backdrop-blur-xl rounded-3xl border ${item.color} group hover:bg-[#181818] transition-all duration-500 cursor-pointer`}
              >
                <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#141414] rounded-[3rem] p-12 md:p-20 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[100px] rounded-full -mr-48 -mt-48" />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">
                <Heart size={14} className="text-red-600 fill-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Support the Dev</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Help us keep the servers running and the code clean.
              </h2>
              
              <div className="space-y-4 text-gray-400 text-lg">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  I'm a 
                  <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 tabular-nums">
                    {age || "18.000000000"}
                  </span>
                  year-old student developer spending my nights squashing bugs and refining this interface.
                </p>
                <p>
                  Every bit of support helps me cover hosting costs and devote more time to new features.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-dashed border-white/20 text-center flex flex-col items-center justify-center gap-2 grayscale opacity-50 cursor-not-allowed">
                   <p className="font-bold text-gray-300">Donation Link</p>
                   <p className="text-xs uppercase tracking-widest font-black text-white/40">Coming Soon</p>
                </div>
                
                <a 
                  href="https://github.com/saucynandhu/cineflex" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 p-6 bg-white text-black rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
                >
                  <Github size={24} className="group-hover:rotate-12 transition-transform" />
                  <span className="font-bold">Contribute on GitHub</span>
                </a>
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                  <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Built With</h4>
                  <div className="flex flex-wrap gap-3">
                    {techStack.map((tech, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-default group">
                        <span className={tech.color}>{tech.icon}</span>
                        <span className="text-sm font-bold group-hover:text-white transition-colors">{tech.name}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="p-8 bg-[#E50914] rounded-3xl shadow-[0_20px_40px_rgba(229,9,20,0.2)]">
                  <h4 className="text-sm font-black text-white/60 uppercase tracking-widest mb-2">Current Version</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">2.4.3</span>
                    <span className="mb-2 font-bold opacity-80">STABLE</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Cleaner watch controls.
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-40 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500 pb-20">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-black text-xl tracking-tighter">CINEFLEX</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Research Lab</span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.5em] text-center">
            PRIVACY IS A HUMAN RIGHT • OPEN SOURCE FOREVER
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link to="/docs" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
              <FileText size={12} /> Documentation
            </Link>
            <Link to="/privacy" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
              <Shield size={12} /> Privacy
            </Link>
            <Link to="/license" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
              <Scale size={12} /> License
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZapIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
