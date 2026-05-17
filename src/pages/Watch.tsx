import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as tmdb from '../lib/tmdb';
import SourceSwitcher, { SourceId } from '../components/SourceSwitcher';

interface WatchProps {
  type: 'movie' | 'tv';
}

export default function Watch({ type }: WatchProps) {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState<SourceId>('vidlink');
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  useEffect(() => {
    async function fetchExternalIds() {
      if (!id) return;
      try {
        const data = await tmdb.getExternalIds(type, id);
        setImdbId(data.imdb_id);
      } catch (err) {
        console.error('Failed to fetch external IDs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExternalIds();
  }, [id, type]);

  useEffect(() => {
    setIsIframeLoading(true);
    const timer = setTimeout(() => {
      setIsIframeLoading(false);
    }, 2500); // Fallback to hide loader if iframe event doesn't fire
    return () => clearTimeout(timer);
  }, [source]);

  const getEmbedUrl = () => {
    const tmdbId = id;
    const s = season || '1';
    const e = episode || '1';

    const patterns: Record<SourceId, { movie: string; tv: string }> = {
      vidlink: {
        movie: `https://vidlink.pro/movie/${tmdbId}`,
        tv: `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
      },
      vidsrc_me: {
        movie: `https://vidsrc.me/embed/movie/${tmdbId}`,
        tv: `https://vidsrc.me/embed/tv/${tmdbId}/${s}/${e}`
      },
      vidsrc_cc: {
        movie: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
        tv: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${s}/${e}`
      },
      vidsrc_icu: {
        movie: `https://vidsrc.icu/embed/movie/${tmdbId}`,
        tv: `https://vidsrc.icu/embed/tv/${tmdbId}/${s}/${e}`
      },
      twoembed: {
        movie: `https://www.2embed.cc/embed/${imdbId}`,
        tv: `https://www.2embed.cc/embedtv/${imdbId}&s=${s}&e=${e}`
      },
      superembed: {
        movie: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        tv: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
      }
    };

    const pattern = patterns[source];
    return type === 'movie' ? pattern.movie : pattern.tv;
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      <p className="text-gray-400 font-medium">Fetching media information...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top Bar */}
      <div className="p-3 md:p-6 bg-[#141414] border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] md:text-xs min-h-[44px]"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
          <div className="overflow-x-auto no-scrollbar touch-pan-x">
             <SourceSwitcher activeSource={source} onSourceChange={setSource} />
          </div>
        </div>
      </div>

      {/* Player Iframe */}
      <div className="flex-1 w-full bg-black relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={source}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full aspect-video md:h-full md:aspect-auto"
          >
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title="Video Player"
              onLoad={() => setIsIframeLoading(false)}
            />
          </motion.div>
        </AnimatePresence>

        {isIframeLoading && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 z-40">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-red-600 animate-spin" />
            <p className="text-gray-400 font-bold tracking-widest text-[10px] md:text-xs uppercase">Loading Player Source...</p>
          </div>
        )}
      </div>
    </div>
  );
}
