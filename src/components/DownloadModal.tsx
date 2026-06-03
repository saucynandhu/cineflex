import { motion, AnimatePresence } from 'motion/react';
import { X, Download, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';
import { useDownloads, DownloadItem } from '../hooks/useDownloads';
import { cn } from '../lib/utils';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: string | number;
  mediaType: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

export default function DownloadModal({
  isOpen,
  onClose,
  tmdbId,
  mediaType,
  title,
  season,
  episode,
  episodeTitle
}: DownloadModalProps) {
  const { downloads, loading, error } = useDownloads(tmdbId, mediaType, season, episode);

  const handleDownload = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl glass-dark rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <Download className="text-[#E50914]" size={24} />
                  Download Options
                </h2>
                <p className="text-sm text-white/50 font-medium">
                  {title} {mediaType === 'tv' && season && episode && `• S${season} E${episode}`}
                  {episodeTitle && ` • ${episodeTitle}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-white/70 font-medium max-w-xs">{error}</p>
                </div>
              ) : downloads.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-full text-white/20">
                    <HardDrive size={32} />
                  </div>
                  <p className="text-white/50 font-medium">No download links available for this title yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {downloads.map((item, idx) => (
                    <DownloadCard key={idx} item={item} onDownload={handleDownload} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="p-4 bg-white/5 text-center">
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={12} />
                Secure direct links provided by Vyla
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DownloadCard({ item, onDownload }: { item: DownloadItem, onDownload: (url: string) => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass-dark border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 flex items-center justify-center text-[#E50914]">
          <HardDrive size={24} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              {item.quality}
            </span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
              {item.format}
            </span>
            {item.server && (
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest ml-1">
                Server {item.server}
              </span>
            )}
          </div>
          <p className="text-white text-sm font-bold">{item.size || 'Size Unknown'}</p>
        </div>
      </div>

      <button
        onClick={() => onDownload(item.url)}
        className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-white/90 transition-all shadow-xl group-hover:scale-105 active:scale-95"
      >
        Download
      </button>
    </motion.div>
  );
}
