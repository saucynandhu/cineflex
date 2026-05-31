import { motion } from 'motion/react';
import { Shield, ArrowLeft, EyeOff, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 bg-[#141414] text-white">
      <div className="max-w-4xl mx-auto">
        <Link to="/donate" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Support
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-xl">
              <Shield className="text-blue-500" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">PRIVACY POLICY</h1>
          </div>

          <p className="text-xl text-gray-400 leading-relaxed font-medium">
            Privacy is a human right. Cineflex is built on the principle of absolute anonymity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <EyeOff className="text-blue-500" />
              <h3 className="font-bold">No Logging</h3>
              <p className="text-sm text-gray-500">We do not store your IP, watch history, or search queries on our servers.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <Lock className="text-green-500" />
              <h3 className="font-bold">Local Storage</h3>
              <p className="text-sm text-gray-500">Your "My List" and preferences are saved exclusively in your browser's local storage.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <Globe className="text-purple-500" />
              <h3 className="font-bold">No Trackers</h3>
              <p className="text-sm text-gray-500">Zero Google Analytics, zero Meta pixels, zero third-party marketing cookies.</p>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-2">Third-Party Players</h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              While Cineflex is private, the third-party video embed services (iframes) may have their own tracking. 
              We recommend using a browser with strong privacy protections (like Brave) or extensions like uBlock Origin.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
