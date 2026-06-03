import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as tmdb from '../lib/tmdb';
import { DEFAULT_PLAYER_COLOR, DEFAULT_SOURCE_ID, SourceId, SOURCES, VIDKING_ORIGIN, getEmbedUrl } from '../lib/sources';
import { useUserLists } from '../hooks/useUserLists';
import { useUserListsStore } from '../store/useUserListsStore';
import { MediaDetails, Episode } from '../types/tmdb';
import LoadingScreen from '../components/LoadingScreen';
import { isUpcoming } from '../lib/utils';

interface WatchProps {
  type: 'movie' | 'tv';
}

interface PlayerEventPayload {
  type?: string;
  data?: {
    event?: string;
    currentTime?: number;
    duration?: number;
    progress?: number;
    id?: string | number;
    mediaType?: 'movie' | 'tv';
    season?: number;
    episode?: number;
  };
}

function parsePlayerMessage(data: unknown): PlayerEventPayload | null {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as PlayerEventPayload;
    } catch {
      return null;
    }
  }

  if (typeof data === 'object' && data !== null) {
    return data as PlayerEventPayload;
  }

  return null;
}

function toFiniteNumber(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export default function Watch({ type }: WatchProps) {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState<SourceId>(DEFAULT_SOURCE_ID);
  const [mediaData, setMediaData] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [resumeTime, setResumeTime] = useState<number | undefined>();
  const lastProgressSaveRef = useRef(0);
  
  // TV specific state
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<Episode[]>([]);
  const currentEpisodeData = currentSeasonEpisodes.find(ep => ep.episode_number === Number(episode));

  const {
    addToContinueWatching,
    addToWatched,
    removeFromContinueWatching,
    updateContinueWatching,
    updateContinueWatchingProgress,
  } = useUserLists();

  useEffect(() => {
    if (!id) return;

    const existing = useUserListsStore.getState().continueWatching.find(item => {
      const sameMedia = String(item.tmdbId || item.id) === String(id) && item.type === type;
      if (!sameMedia) return false;
      if (type === 'movie') return true;

      return Number(item.season) === Number(season || 1) && Number(item.episode) === Number(episode || 1);
    });

    const savedTime = toFiniteNumber(existing?.currentTime);
    const savedProgress = toFiniteNumber(existing?.progress);
    setResumeTime(savedTime && savedTime > 5 && (!savedProgress || savedProgress < 95) ? savedTime : undefined);
    lastProgressSaveRef.current = 0;
  }, [id, type, season, episode]);

  useEffect(() => {
    async function fetchDetailsAndRecordActivity() {
      if (!id) return;
      try {
        const [externalIds, details] = await Promise.all([
          tmdb.getExternalIds(type, id),
          tmdb.getDetails(type, id)
        ]);
        
        const releaseDate = (details as any).release_date || (details as any).first_air_date;
        if (isUpcoming(releaseDate)) {
          console.warn('Attempted to watch unreleased content. Redirecting...');
          navigate(`/${type}/${id}`, { replace: true });
          return;
        }

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
  }, [id, type, season, episode, navigate, addToContinueWatching, addToWatched]);

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
  }, [source, season, episode, resumeTime]);

  const getNextEpisodeTarget = useCallback(() => {
    if (type !== 'tv') return null;

    const s = Number(season);
    const e = Number(episode);
    if (e < currentSeasonEpisodes.length) {
      const nextEpisodeData = currentSeasonEpisodes.find(ep => ep.episode_number === e + 1);
      return { season: s, episode: e + 1, episodeName: nextEpisodeData?.name };
    }

    const nextSeasonNum = s + 1;
    const nextSeason = mediaData?.seasons?.find(sn => sn.season_number === nextSeasonNum);
    if (nextSeason) {
      return { season: nextSeasonNum, episode: 1, episodeName: undefined };
    }

    return null;
  }, [type, season, episode, currentSeasonEpisodes, mediaData?.seasons]);

  const handlePlaybackComplete = useCallback(() => {
    if (!id) return;

    if (type === 'tv') {
      const nextEpisodeTarget = getNextEpisodeTarget();
      if (nextEpisodeTarget) {
        updateContinueWatching(
          Number(id),
          'tv',
          nextEpisodeTarget.season,
          nextEpisodeTarget.episode,
          nextEpisodeTarget.episodeName,
          { currentTime: 0, duration: 0, progress: 0, lastPlayerEvent: 'ended' }
        );
      } else {
        removeFromContinueWatching(Number(id), 'tv');
      }
      return;
    }

    removeFromContinueWatching(Number(id), 'movie');
  }, [id, type, getNextEpisodeTarget, removeFromContinueWatching, updateContinueWatching]);

  useEffect(() => {
    if (!id) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== VIDKING_ORIGIN) return;

      const message = parsePlayerMessage(event.data);
      if (message?.type !== 'PLAYER_EVENT' || !message.data) return;

      const data = message.data;
      if (String(data.id) !== String(id) || data.mediaType !== type) return;

      if (type === 'tv') {
        const eventSeason = toFiniteNumber(data.season);
        const eventEpisode = toFiniteNumber(data.episode);
        if (eventSeason && eventSeason !== Number(season)) return;
        if (eventEpisode && eventEpisode !== Number(episode)) return;
      }

      const currentTime = toFiniteNumber(data.currentTime);
      const duration = toFiniteNumber(data.duration);
      const progress = toFiniteNumber(data.progress);
      if (currentTime === undefined) return;

      const playerEvent = data.event || 'timeupdate';
      const now = Date.now();
      const isFinalEvent = playerEvent === 'ended' || (progress !== undefined && progress >= 98);
      const shouldSave = isFinalEvent || playerEvent !== 'timeupdate' || now - lastProgressSaveRef.current > 5000;
      if (!shouldSave) return;

      lastProgressSaveRef.current = now;

      if (isFinalEvent) {
        handlePlaybackComplete();
        return;
      }

      updateContinueWatchingProgress(
        Number(id),
        type,
        {
          currentTime,
          duration,
          progress,
          lastPlayerEvent: playerEvent,
        },
        type === 'tv' ? Number(season) : undefined,
        type === 'tv' ? Number(episode) : undefined,
        type === 'tv' ? currentEpisodeData?.name : undefined
      );
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    id,
    type,
    season,
    episode,
    currentEpisodeData?.name,
    handlePlaybackComplete,
    updateContinueWatchingProgress,
  ]);

  const embedUrl = useMemo(() => {
    if (!id) return '';

    return getEmbedUrl(source, type, id, season, episode, {
      color: DEFAULT_PLAYER_COLOR,
      autoPlay: true,
      nextEpisode: false,
      episodeSelector: false,
      progress: source === 'vidking' ? resumeTime : undefined,
    });
  }, [source, type, id, season, episode, resumeTime]);

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
    const target = getNextEpisodeTarget();
    if (target) {
      navigate(`/watch/tv/${id}/${target.season}/${target.episode}`);
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
      <div className="flex-none h-16 bg-gradient-to-b from-black/90 to-black/70 flex items-center justify-between px-4 md:px-6 z-10 gap-3">
        <button
          onClick={() => navigate(`/${type}/${id}`)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] md:text-xs"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Details</span>
        </button>

        <div className="flex min-w-0 flex-col items-center text-center">
          <h1 className="text-white font-semibold text-xs md:text-sm leading-tight line-clamp-1 max-w-[180px] md:max-w-md">
            {mediaData?.title || mediaData?.name}
          </h1>
          {type === 'tv' && (
            <p className="text-white/60 text-[10px] font-medium mt-0.5 line-clamp-1">
              Season {season} · Episode {episode}
              {currentEpisodeData?.name && <span className="hidden md:inline"> · {currentEpisodeData.name}</span>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Server</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as SourceId)}
            className="bg-black/30 border border-white/30 text-white text-[11px] md:text-xs rounded px-2.5 py-1.5 outline-none cursor-pointer hover:border-white/50 transition-colors max-w-[112px] md:max-w-none"
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
          src={embedUrl}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="origin"
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
              <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">Loading {SOURCES.find(src => src.id === source)?.name || 'Server'}...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar (TV Only) */}
      {type === 'tv' && (
        <div className="flex-none h-14 bg-gradient-to-t from-black/90 to-black/70 flex items-center justify-between px-4 md:px-6 z-10 gap-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {!isFirstEpisodeOfFirstSeason && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous Episode</span>
              </button>
            )}
          </div>

          <div className="text-center min-w-0 flex-[2]">
            <p className="text-white/70 text-[10px] md:text-xs font-medium truncate">
              Season {season} · Episode {episode}
              {currentEpisodeData?.name && <span className="hidden md:inline"> · {currentEpisodeData.name}</span>}
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 min-w-0 flex-1">
            {!isLastEpisodeOfSeries && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-1.5 rounded-full text-xs font-bold transition-all"
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
