import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as tmdb from '../lib/tmdb';
import { SourceId, SOURCES, getEmbedUrl } from '../lib/sources';
import { useUserLists } from '../hooks/useUserLists';
import { MediaDetails, Episode } from '../types/tmdb';
import LoadingScreen from '../components/LoadingScreen';

interface WatchProps {
  type: 'movie' | 'tv';
}

export default function Watch({ type }: WatchProps) {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState<SourceId>('videasy');
  const [mediaData, setMediaData] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  
  // TV specific state
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<Episode[]>([]);
  const currentEpisodeData = currentSeasonEpisodes.find(ep => ep.episode_number === Number(episode));

  const { addToContinueWatching, addToWatched, updateContinueWatching } = useUserLists();

  useEffect(() => {
    async function fetchDetailsAndRecordActivity() {
      if (!id) return;
      try {
        const [externalIds, details] = await Promise.all([
          tmdb.getExternalIds(type, id),
          tmdb.getDetails(type, id)
        ]);
        
        setMediaData(details);
        
        // Record activity
        const commonData = {
          id: details.id,
          tmdbId: details.id,
          imdbId: externalIds.imdb_id || undefined,
          type,
          title: details.title || details.name || '',
          posterPath: details.poster_path,
          backdropPath: details.backdrop_path,
          year: ((details as any).release_date || (details as any).first_air_date || '').split('-')[0],
          addedAt: Date.now()
        };

        addToWatched({
          ...commonData,
          watchedAt: Date.now(),
          season: type === 'tv' ? Number(season) : undefined,
          episode: type === 'tv' ? Number(episode) : undefined,
        });

        addToContinueWatching({
          ...commonData,
          watchedAt: Date.now(),
          season: type === 'tv' ? Number(season) : undefined,
          episode: type === 'tv' ? Number(episode) : undefined,
          episodeName: undefined, // Will be updated once episode data is fetched
        });

      } catch (err) {
        console.error('Failed to fetch media info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetailsAndRecordActivity();
  }, [id, type, season, episode, addToContinueWatching, addToWatched]);

  // Update continue watching with episode name once fetched
  useEffect(() => {
    if (type === 'tv' && id && currentEpisodeData?.name) {
      updateContinueWatching(
        Number(id), 
        'tv', 
        Number(season), 
        Number(episode), 
        currentEpisodeData.name
      );
    }
  }, [id, type, season, episode, currentEpisodeData, updateContinueWatching]);

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
    }, 2500);
    return () => clearTimeout(timer);
  }, [source, season, episode]);

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
      const nextSeasonNum = s + 1;
      const nextSeason = mediaData?.seasons?.find(sn => sn.season_number === nextSeasonNum);
      if (nextSeason) {
        navigate(`/watch/tv/${id}/${nextSeasonNum}/1`);
      }
    }
  };

  const isFirstEpisodeOfFirstSeason = Number(season) === 1 && Number(episode) === 1;
  const isLastEpisodeOfSeason = Number(episode) === currentSeasonEpisodes.length && currentSeasonEpisodes.length > 0;
  
  const nextSeasonNum = Number(season) + 1;
  const hasNextSeason = mediaData?.seasons?.some(sn => sn.season_number === nextSeasonNum);
  const isLastEpisodeOfSeries = isLastEpisodeOfSeason && !hasNextSeason;

  if (loading) return <LoadingScreen />;

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="flex-none h-16 bg-gradient-to-b from-black/90 to-black/70 flex items-center justify-between px-6 z-10">
        <button
          onClick={() => navigate(`/${type}/${id}`)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Details</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-white font-semibold text-xs md:text-sm leading-tight line-clamp-1 max-w-[200px] md:max-w-md">
            {mediaData?.title || mediaData?.name}
          </h1>
          {type === 'tv' && (
            <p className="text-white/60 text-[10px] font-medium mt-0.5">
              Season {season} · Episode {episode}
            </p>
          )}
        </div>

        <div>
           <select
             value={source}
             onChange={(e) => setSource(e.target.value as SourceId)}
             className="bg-transparent border border-white/30 text-white text-xs rounded-md px-3 py-1.5 outline-none cursor-pointer hover:border-white/50 transition-colors"
           >
             {SOURCES.map((src) => (
               <option key={src.id} value={src.id} className="bg-[#141414]">{src.name}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Iframe Area */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <iframe
          src={getEmbedUrl(source, type, id!, season, episode)}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media"
          title="Video Player"
          onLoad={() => setIsIframeLoading(false)}
        />

        <AnimatePresence>
          {isIframeLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-6 z-20"
            >
              <div className="relative">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">Loading Source...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar (TV Only) */}
      {type === 'tv' && (
        <div className="flex-none h-14 bg-gradient-to-t from-black/90 to-black/70 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            {!isFirstEpisodeOfFirstSeason && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous Episode</span>
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="text-white/70 text-[10px] md:text-xs font-medium">
              Season {season} · Episode {episode}
              {currentEpisodeData?.name && <span className="hidden md:inline"> · {currentEpisodeData.name}</span>}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!isLastEpisodeOfSeries && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                <span className="hidden sm:inline">Next Episode</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
