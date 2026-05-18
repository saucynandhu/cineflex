import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as tmdb from '../lib/tmdb';
import SourceSwitcher, { SourceId } from '../components/SourceSwitcher';
import { useUserLists } from '../hooks/useUserLists';

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
  
  // TV specific state
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<any[]>([]);

  const { addToContinueWatching, addToWatched } = useUserLists();

  useEffect(() => {
    async function fetchDetailsAndRecordActivity() {
      if (!id) return;
      try {
        const [externalIds, details] = await Promise.all([
          tmdb.getExternalIds(type, id),
          tmdb.getDetails(type, id)
        ]);
        
        setImdbId(externalIds.imdb_id);
        
        if (type === 'tv') {
          setTvDetails(details);
        }

        // Record activity
        const commonData = {
          id: details.id,
          tmdbId: details.id,
          imdbId: externalIds.imdb_id,
          type,
          title: details.title || details.name,
          posterPath: details.poster_path,
          backdropPath: details.backdrop_path,
          year: (details.release_date || details.first_air_date || '').split('-')[0],
        };

        addToWatched({
          ...commonData,
          watchedAt: Date.now(),
          season: type === 'tv' ? Number(season) : undefined,
          episode: type === 'tv' ? Number(episode) : undefined,
          addedAt: Date.now()
        });

        addToContinueWatching({
          ...commonData,
          progress: 0,
          watchedAt: Date.now(),
          season: type === 'tv' ? Number(season) : undefined,
          episode: type === 'tv' ? Number(episode) : undefined,
          episodeName: type === 'tv' ? details.name : undefined, // Placeholder for actual episode name if needed
          addedAt: Date.now()
        });

      } catch (err) {
        console.error('Failed to fetch media info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetailsAndRecordActivity();
  }, [id, type, season, episode, addToContinueWatching, addToWatched]);

  useEffect(() => {
    async function fetchSeasonData() {
      if (type === 'tv' && id && season) {
        try {
          const eps = await tmdb.getEpisodes(id, Number(season));
          setCurrentSeasonEpisodes(eps);
        } catch (err) {
          console.error('Failed to fetch season episodes:', err);
        }
      }
    }
    fetchSeasonData();
  }, [id, type, season]);

  useEffect(() => {
    setIsIframeLoading(true);
    const timer = setTimeout(() => {
      setIsIframeLoading(false);
    }, 2500); // Fallback to hide loader if iframe event doesn't fire
    return () => clearTimeout(timer);
  }, [source, season, episode]);

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

  const handlePrev = async () => {
    const s = Number(season);
    const e = Number(episode);
    if (e > 1) {
      navigate(`/watch/tv/${id}/${s}/${e - 1}`);
    } else if (s > 1) {
      const prevSeason = s - 1;
      const eps = await tmdb.getEpisodes(id!, prevSeason);
      if (eps && eps.length > 0) {
        navigate(`/watch/tv/${id}/${prevSeason}/${eps.length}`);
      }
    }
  };

  const handleNext = () => {
    const s = Number(season);
    const e = Number(episode);
    if (e < currentSeasonEpisodes.length) {
      navigate(`/watch/tv/${id}/${s}/${e + 1}`);
    } else {
      // Check if next season exists
      const nextSeasonNum = s + 1;
      const nextSeason = tvDetails?.seasons?.find((sn: any) => sn.season_number === nextSeasonNum);
      if (nextSeason) {
        navigate(`/watch/tv/${id}/${nextSeasonNum}/1`);
      }
    }
  };

  const isFirstEpisodeOfFirstSeason = Number(season) === 1 && Number(episode) === 1;
  const isLastEpisodeOfSeason = Number(episode) === currentSeasonEpisodes.length && currentSeasonEpisodes.length > 0;
  
  const nextSeasonNum = Number(season) + 1;
  const hasNextSeason = tvDetails?.seasons?.some((sn: any) => sn.season_number === nextSeasonNum);
  const isLastEpisodeOfSeries = isLastEpisodeOfSeason && !hasNextSeason;

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
            onClick={() => navigate(`/${type}/${id}`)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] md:text-xs min-h-[44px]"
          >
            <ArrowLeft size={16} />
            Back to Details
          </button>
          
          <div className="flex items-center gap-4">
             <SourceSwitcher activeSource={source} onSourceChange={setSource} />
          </div>
        </div>
      </div>

      {/* Player Iframe */}
      <div className="flex-1 w-full bg-black relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${source}-${season}-${episode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative group"
          >
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title="Video Player"
              onLoad={() => setIsIframeLoading(false)}
            />

            {/* Navigation Buttons */}
            {type === 'tv' && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-0 pointer-events-none z-10">
                <AnimatePresence>
                  {!isFirstEpisodeOfFirstSeason && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={handlePrev}
                      className="w-10 h-20 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center rounded-r-md transition-all pointer-events-auto group/prev"
                    >
                      <ChevronLeft size={32} className="group-hover/prev:scale-110 transition-transform" />
                    </motion.button>
                  )}

                  {!isLastEpisodeOfSeries && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={handleNext}
                      className="w-10 h-20 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center rounded-l-md transition-all pointer-events-auto group/next"
                    >
                      <ChevronRight size={32} className="group-hover/next:scale-110 transition-transform" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
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
