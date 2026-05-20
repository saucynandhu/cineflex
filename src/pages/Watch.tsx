import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as tmdb from '../lib/tmdb';
import { SourceId } from '../components/SourceSwitcher';
import { useUserLists } from '../hooks/useUserLists';

interface WatchProps {
  type: 'movie' | 'tv';
}

export default function Watch({ type }: WatchProps) {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState<SourceId>('videasy');
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  
  // TV specific state
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<any[]>([]);
  const currentEpisodeData = currentSeasonEpisodes.find(ep => ep.episode_number === Number(episode));

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
        setMediaData(details);
        
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
          watchedAt: Date.now(),
          season: type === 'tv' ? Number(season) : undefined,
          episode: type === 'tv' ? Number(episode) : undefined,
          episodeName: type === 'tv' ? details.name : undefined,
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
    }, 2500);
    return () => clearTimeout(timer);
  }, [source, season, episode]);

  const getEmbedUrl = () => {
    const tmdbId = id;
    const s = season || '1';
    const e = episode || '1';

    const patterns: Record<SourceId, { movie: string; tv: string }> = {
      videasy: {
        movie: `https://player.videasy.net/movie/${tmdbId}`,
        tv: `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`
      },
      vidlink: {
        movie: `https://vidlink.pro/movie/${tmdbId}`,
        tv: `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
      },
      vidfast: {
        movie: `https://vidfast.pro/movie/${tmdbId}`,
        tv: `https://vidfast.pro/tv/${tmdbId}/${s}/${e}`
      },
      autoembed: {
        movie: `https://player.autoembed.cc/embed/movie/${tmdbId}`,
        tv: `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`
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
      vidsrc_vip: {
        movie: `https://vidsrc.vip/embed/movie/${tmdbId}`,
        tv: `https://vidsrc.vip/embed/tv/${tmdbId}/${s}/${e}`
      },
      rivestream: {
        movie: `https://rivestream.org/embed/movie/${tmdbId}`,
        tv: `https://rivestream.org/embed/tv/${tmdbId}/${s}/${e}`
      },
      pstream: {
        movie: `https://iframe.pstream.org/movie/${tmdbId}`,
        tv: `https://iframe.pstream.org/tv/${tmdbId}/${s}/${e}`
      },
      twoembed: {
        movie: `https://www.2embed.cc/embed/${tmdbId}`,
        tv: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`
      },
      superembed: {
        movie: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        tv: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
      },
      autoembed_co: {
        movie: `https://autoembed.co/movie/tmdb/${tmdbId}`,
        tv: `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`
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
      <p className="text-gray-400 font-medium tracking-widest text-[10px] uppercase">Preparing your stream...</p>
    </div>
  );

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
             <option value="videasy" className="bg-[#141414]">Videasy</option>
             <option value="vidlink" className="bg-[#141414]">VidLink</option>
             <option value="vidfast" className="bg-[#141414]">VidFast</option>
             <option value="autoembed" className="bg-[#141414]">AutoEmbed</option>
             <option value="vidsrc_me" className="bg-[#141414]">VidSrc.me</option>
             <option value="vidsrc_cc" className="bg-[#141414]">VidSrc.cc</option>
             <option value="vidsrc_icu" className="bg-[#141414]">VidSrc.icu</option>
             <option value="vidsrc_vip" className="bg-[#141414]">VidSrc.vip</option>
             <option value="rivestream" className="bg-[#141414]">Rivestream</option>
             <option value="pstream" className="bg-[#141414]">Pstream</option>
             <option value="twoembed" className="bg-[#141414]">2Embed</option>
             <option value="superembed" className="bg-[#141414]">SuperEmbed</option>
             <option value="autoembed_co" className="bg-[#141414]">AutoEmbed.co</option>
           </select>
        </div>
      </div>

      {/* Iframe Area */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <iframe
          src={getEmbedUrl()}
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


