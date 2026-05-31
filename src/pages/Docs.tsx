import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Docs() {
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
            <div className="p-3 bg-red-600/10 rounded-xl">
              <FileText className="text-red-600" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">DOCUMENTATION</h1>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-2">Overview</h2>
            <p className="text-gray-400 leading-relaxed">
              Cineflex is a high-performance streaming interface built with React 19 and Vite 6. 
              It serves as a 1:1 replica of modern streaming platforms, optimized for the open web.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-2">Core Technologies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <h3 className="font-bold mb-2">Frontend</h3>
                <p className="text-sm text-gray-500">React 19, Tailwind CSS 4, Framer Motion for immersive animations.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <h3 className="font-bold mb-2">Data Layer</h3>
                <p className="text-sm text-gray-500">TMDB API for metadata, combined with custom proxy handlers.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-2">Open Source</h2>
            <p className="text-gray-400 leading-relaxed">
              The project is hosted on GitHub. We encourage developers to audit the code, report security vulnerabilities, and contribute to the UI stability.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
