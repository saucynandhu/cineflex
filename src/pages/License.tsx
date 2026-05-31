import { motion } from 'motion/react';
import { Scale, ArrowLeft, Github, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function License() {
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
            <div className="p-3 bg-green-600/10 rounded-xl">
              <Scale className="text-green-500" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">LICENSE</h1>
          </div>

          <div className="bg-[#1c1c1c] p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Github size={20} /> MIT License
            </h2>
            <div className="font-mono text-sm text-gray-500 space-y-4 leading-loose">
              <p>Copyright (c) 2026 Cineflex Research Lab</p>
              <p>
                Permission is hereby granted, free of charge, to any person obtaining a copy
                of this software and associated documentation files (the "Software"), to deal
                in the Software without restriction, including without limitation the rights
                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                copies of the Software...
              </p>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-2">Disclaimer</h2>
            <div className="flex gap-4 p-6 bg-red-600/5 rounded-2xl border border-red-600/20">
              <Info className="text-red-600 flex-shrink-0" size={24} />
              <p className="text-sm text-gray-400 leading-relaxed">
                Cineflex is a research project. The developer does not endorse or encourage the use of this software 
                for illegal activities. All responsibility for the use of this software lies with the end user.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
