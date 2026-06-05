import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import { getImageUrl } from '../lib/tmdb';
import { Play, Plus, Star, Film, Check, X, Calendar, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useUserLists } from '../hooks/useUserLists';
import { cn, isUpcoming, formatDate } from '../lib/utils';
import { MediaDetails, Season, Episode, MediaBase, Video } from '../types/tmdb';
import LoadingScreen from '../components/LoadingScreen';
import DownloadModal from '../components/DownloadModal';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, mins: number, secs: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / 1000 / 60) % 60),
          secs: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <span className="tabular-nums">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m {timeLeft.secs}s
    </span>
  );
}

interface DetailProps {
  type: 'movie' | 'tv';
}

export default function Detail({ type }: DetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<MediaDetails | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'more'>(
    type === 'tv' ? 'episodes' : 'overview'
  );
  
  // Cinematic States
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<{ season?: number, episode?: number, episodeTitle?: string } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [trailer, setTrailer] = useState<Video | null>(null);

  const { scrollY } = useScroll();
  const videoBrightness = useTransform(scrollY, [0, 500, 1000], [1, 0.6, 0.4]);
  const videoOverlayOpacity = useTransform(scrollY, [500, 1000], [0, 1]);
  const contentFade = useTransform(scrollY, [0, 300], [1, 0]);

  const { isInWatchLater, toggleWatchLater, continueWatching, watched } = useUserLists();
  const cwItem = continueWatching.find(i => String(i.tmdbId || i.id) === String(id));
  
  const releaseDate = data ? (data as any).release_date || (data as any).first_air_date : undefined;
  const upcoming = isUpcoming(releaseDate);

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      setLoading(true);
      setCollection(null);
      setVideoReady(false);
      try {
        const [details, images] = await Promise.all([
          tmdb.getDetails(type, id),
          tmdb.getImages(type, id)
        ]);

        setData(details);

        // Find Official Logo
        const logo = images.logos?.find((l: any) => l.iso_639_1 === 'en') || images.logos?.[0];
        if (logo) setLogoUrl(`https://image.tmdb.org/t/p/original${logo.file_path}`);

        // Find Trailer
        const videos = details.videos?.results || [];
        const t = videos.find((v: Video) => v.site === 'YouTube' && v.type === 'Trailer' && (v as any).official) 
                 || videos.find((v: Video) => v.site === 'YouTube' && v.type === 'Trailer');
        setTrailer(t || null);

        if (type === 'tv' && details.seasons) {
          setSeasons(details.seasons.filter((s: Season) => s.season_number > 0));
        }

        if (type === 'movie' && (details as any).belongs_to_collection) {
          const collectionData = await tmdb.getCollection((details as any).belongs_to_collection.id);
          setCollection(collectionData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id, type]);

  useEffect(() => {
    async function fetchEpisodes() {
      if (type === 'tv' && id) {
        try {
          const eps = await tmdb.getEpisodes(id, selectedSeason);
          setEpisodes(eps);
        } catch (err) {
          console.error(err);
        }
      }
    }
    fetchEpisodes();
  }, [id, type, selectedSeason]);

  const isEpisodeWatched = useCallback((seasonNumber: number, episodeNumber: number) => {
    return watched.some(item =>
      item.type === 'tv' &&
      String(item.tmdbId || item.id) === String(id) &&
      Number(item.season) === Number(seasonNumber) &&
      Number(item.episode) === Number(episodeNumber)
    );
  }, [id, watched]);

  const openDownload = (s?: number, e?: number, t?: string) => {
    setDownloadTarget({ season: s, episode: e, episodeTitle: t });
    setIsDownloadOpen(true);
  };

  const handlePlay = () => {
    if (type === 'movie') {
      navigate(`/watch/movie/${id}`);
    } else {
      const s = cwItem?.season || 1;
      const e = cwItem?.episode || 1;
      navigate(`/watch/tv/${id}/${s}/${e}`);
    }
  };

  if (loading || !data) return <LoadingScreen />;

  const year = ((data as any).release_date || (data as any).first_air_date || '').split('-')[0];
  const runtime = type === 'movie' 
    ? `${Math.floor((data.runtime || 0) / 60)}h ${(data.runtime || 0) % 60}m` 
    : `${data.number_of_seasons} Seasons`;

  return (
    <div className="relative min-h-screen bg-[#141414] overflow-x-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative h-[70vh] md:h-screen w-full overflow-hidden">
        {/* Layer 1: Video/Backdrop Background */}
        <motion.div 
          style={{ filter: `brightness(${videoBrightness})` }}
          className="absolute inset-0 z-0 bg-[#141414]"
        >
          {/* Static Backdrop Fallback/Loading State */}
          <img
            src={getImageUrl(data.backdrop_path, 'original')}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out",
              videoReady ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Autoplay Video - Extreme 250% Overscan isolation to kill all UI artifacts */}
          {trailer && (
            <div 
              className={cn(
                "absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-[3500ms] ease-in-out overflow-hidden",
                videoReady ? "opacity-100" : "opacity-0"
              )}
            >
              {/* Interaction Shield - Blocks all possible player interaction */}
              <div className="absolute inset-0 z-10 bg-transparent" />
              
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0&origin=${window.location.origin}`}
                className="absolute top-1/2 left-1/2 w-[250%] aspect-video -translate-x-1/2 -translate-y-1/2 pointer-events-none border-none"
                allow="autoplay; fullscreen"
                onLoad={() => {
                  // Wait for the video to stabilize and player overlays to time out
                  setTimeout(() => setVideoReady(true), 6000);
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Layer 2: Cinematic Gradients & Vignette */}
        <div className="absolute inset-0 z-1 pointer-events-none">
          {/* Edge Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] md:shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />

          {/* Aggressive Seamless Bottom Fade */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-[8%] bg-[#141414] z-20" />
          
          {/* Left Gradient */}
          <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-[#141414] via-[#141414]/20 to-transparent z-5" />
          
          {/* Scroll-driven Darkening Overlay */}
          <motion.div 
            style={{ opacity: videoOverlayOpacity }}
            className="absolute inset-0 bg-[#141414]/80 z-15" 
          />
        </div>

        {/* Layer 3: Content Overlay */}
        <motion.div 
          style={{ opacity: contentFade }}
          className="absolute bottom-[20%] md:bottom-[25%] left-0 z-2 w-full px-6 md:px-12 max-w-4xl"
        >
          <div className="space-y-4 md:space-y-8">
            {/* Title / Logo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={data.title || data.name} 
                  className="max-w-[220px] md:max-w-[500px] max-h-[100px] md:max-h-[250px] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
                />
              ) : (
                <h1 className="text-3xl md:text-8xl font-cinematic text-white text-shadow-cinematic">
                  {data.title || data.name}
                </h1>
              )}
            </motion.div>

            {/* Metadata Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center flex-wrap gap-2 md:gap-3 text-xs md:text-lg font-medium text-white/80"
            >
              <div className="flex items-center gap-1 text-[#46d369]">
                <Star size={14} className="md:size-[18px]" fill="#46d369" />
                <span className="font-bold">{data.vote_average.toFixed(1)}</span>
              </div>
              <span>•</span>
              <span>{year}</span>
              <span className="hidden md:inline">•</span>
              <span className="border border-white/30 px-1.5 py-0.5 text-[10px] md:text-xs rounded-[3px] font-bold">HD</span>
              <span>•</span>
              <span>{runtime}</span>
              {upcoming && releaseDate && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-[#E50914] font-black uppercase text-[10px] md:text-sm">
                    <Sparkles size={14} className="animate-pulse" />
                    <CountdownTimer targetDate={releaseDate} />
                  </div>
                </>
              )}
            </motion.div>

            {/* Expandable Synopsis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative max-w-2xl"
            >
              <p className={cn(
                "text-sm md:text-lg text-white/90 leading-relaxed transition-all duration-500",
                !isExpanded && "line-clamp-2 md:line-clamp-3"
              )}>
                {data.overview}
              </p>
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-4 md:h-8 bg-gradient-to-t from-[#141414]/20 to-transparent pointer-events-none" />
              )}
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 md:mt-2 text-white/60 hover:text-white flex items-center gap-1 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-colors"
              >
                {isExpanded ? (
                  <>Less <ChevronUp size={14} /></>
                ) : (
                  <>More <ChevronDown size={14} /></>
                )}
              </button>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-4 md:space-y-6 pt-2 md:pt-4"
            >
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {upcoming ? (
                  <div className="bg-white/10 text-white/50 px-6 md:px-10 py-3 md:py-4 rounded-full font-black text-sm md:text-lg border border-white/10 flex items-center gap-2 md:gap-3 cursor-not-allowed">
                    <Calendar size={20} className="md:size-6" /> Coming Soon
                  </div>
                ) : (
                  <button 
                    onClick={handlePlay}
                    className="bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-full font-black text-sm md:text-lg hover:bg-white/90 transition-all flex items-center gap-2 md:gap-3 shadow-xl hover:scale-105"
                  >
                    <Play size={20} className="md:size-6" fill="black" /> Play
                  </button>
                )}
                
                <button 
                onClick={() => toggleWatchLater({ 
                  id: data.id, 
                  tmdbId: data.id, 
                  type, 
                  title: data.title || data.name || '', 
                  posterPath: data.poster_path, 
                  backdropPath: data.backdrop_path, 
                  year, 
                  addedAt: Date.now() 
                })}
                className="glass-dark text-white px-5 md:px-8 py-3 md:py-4 rounded-full font-bold text-xs md:text-base flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                {isInWatchLater(data.id, type) ? <Check size={18} /> : <Plus size={18} />} My List
              </button>

              <button 
                onClick={() => openDownload(
                  type === 'tv' ? (cwItem?.season || 1) : undefined, 
                  type === 'tv' ? (cwItem?.episode || 1) : undefined, 
                  type === 'tv' ? cwItem?.episodeName : undefined
                )}
                className="glass-dark text-white p-3 md:p-4 rounded-full hover:bg-white/20 transition-all" 
                title="Download"
              >
                <Download size={20} className="md:size-6" />
              </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Sections Below */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 -mt-10 md:-mt-16 pt-0 pb-20">
        <div className="flex gap-6 md:gap-8 border-b border-white/10 mb-8 md:mb-12 overflow-x-auto no-scrollbar">
          {(type === 'tv' 
            ? ['episodes', 'overview', 'more'] 
            : ['overview', 'more']
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-3 md:pb-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all border-b-[2px] md:border-b-[3px] whitespace-nowrap",
                activeTab === tab ? "text-white border-[#E50914]" : "text-white/40 border-transparent hover:text-white"
              )}
            >
              {tab === 'overview' ? 'Overview' : tab === 'episodes' ? 'Episodes' : 'More Like This'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && data.credits && (
              <div className="space-y-16">
                <div className="space-y-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-[#E50914] pl-4">Top Cast</h3>
                  <div className="flex gap-8 overflow-x-auto no-scrollbar pb-6">
                    {data.credits.cast.slice(0, 15).map((person) => (
                      <div key={person.id} className="flex-none w-24 text-center space-y-3">
                        <div className="relative group aspect-square rounded-full overflow-hidden border-2 border-white/5 hover:border-[#E50914] transition-all">
                          {person.profile_path ? (
                            <img 
                              src={getImageUrl(person.profile_path, 'w500')} 
                              className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" 
                              alt={person.name} 
                            />
                          ) : (
                            <div className="w-full h-full bg-[#181818] flex items-center justify-center text-white/10 font-black text-2xl">?</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-white font-bold line-clamp-1">{person.name}</p>
                          <p className="text-[10px] text-white/40 line-clamp-1 italic">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {type === 'movie' && collection && (
                  <div className="glass-dark rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8">{collection.name}</h3>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar">
                      {collection.parts
                        .filter((part: any) => part.poster_path)
                        .sort((a: any, b: any) => (a.release_date || '').localeCompare(b.release_date || ''))
                        .map((part: any) => {
                          const isCurrent = Number(part.id) === Number(id);
                          return (
                            <div 
                              key={part.id}
                              onClick={() => !isCurrent && navigate(`/movie/${part.id}`)}
                              className={cn(
                                "flex-none w-32 md:w-40 cursor-pointer relative group",
                                isCurrent ? "cursor-default" : "opacity-60 hover:opacity-100 transition-opacity"
                              )}
                            >
                              <div className={cn(
                                "aspect-[2/3] rounded-lg overflow-hidden relative shadow-2xl",
                                isCurrent && "ring-4 ring-[#E50914]"
                              )}>
                                <img 
                                  src={`https://image.tmdb.org/t/p/w400${part.poster_path}`} 
                                  alt={part.title}
                                  className="w-full h-full object-cover"
                                />
                                {isCurrent && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="bg-[#E50914] text-white text-xs font-black px-3 py-1 uppercase rounded-full">Viewing</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-white font-bold mt-3 line-clamp-1">{part.title}</p>
                              <p className="text-[10px] text-white/40">{(part.release_date || '').split('-')[0]}</p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'episodes' && (
              <div className="space-y-12">
                 <div className="flex items-center justify-between gap-4">
                   <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-[#E50914] pl-4">Episodes</h3>
                   <select 
                    value={selectedSeason} 
                    onChange={(e) => setSelectedSeason(Number(e.target.value))} 
                    className="bg-white/5 text-white px-6 py-3 rounded-full border border-white/10 outline-none text-sm font-bold uppercase tracking-wider focus:bg-white/10 transition-colors"
                   >
                     {seasons.map(s => <option key={s.id} value={s.season_number} className="bg-[#181818]">Season {s.season_number}</option>)}
                   </select>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                   {episodes.map(ep => {
                     const episodeWatched = isEpisodeWatched(selectedSeason, ep.episode_number);
                     const episodeUpcoming = isUpcoming(ep.air_date);
                     return (
                       <div
                         key={ep.id}
                         onClick={() => !episodeUpcoming && navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`)}
                         className={cn(
                           "flex flex-col md:flex-row gap-8 p-6 rounded-2xl transition-all border border-white/5 hover:border-white/20 hover:bg-white/5 group",
                           episodeWatched && "bg-white/[0.02]",
                           !episodeUpcoming ? "cursor-pointer" : "cursor-default opacity-80"
                         )}
                       >
                         <div className="relative w-full md:w-72 aspect-video rounded-xl overflow-hidden flex-none shadow-2xl">
                           <img 
                            src={getImageUrl(ep.still_path || data.backdrop_path, 'w500')} 
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                            alt="" 
                           />
                           {!episodeUpcoming && (
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={40} fill="white" className="text-white" />
                             </div>
                           )}
                           <span className="absolute top-4 left-4 text-3xl font-black text-white/30">{ep.episode_number}</span>
                           {episodeWatched && (
                             <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg ring-4 ring-black/20">
                               <Check size={22} strokeWidth={3} />
                             </div>
                           )}
                           {episodeUpcoming && (
                             <div className="absolute bottom-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg">
                               Upcoming
                             </div>
                           )}
                         </div>
                         <div className="flex-1 flex flex-col justify-center space-y-4">
                           <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <h4 className={cn(
                                "font-black text-2xl transition-colors",
                                episodeUpcoming ? "text-white/40" : "text-white group-hover:text-[#E50914]"
                              )}>{ep.name}</h4>
                              <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-1 rounded uppercase tracking-tighter">{(ep as any).runtime || 45}m</span>
                              {episodeUpcoming && ep.air_date && (
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">{formatDate(ep.air_date)}</span>
                              )}
                            </div>
                            {!episodeUpcoming && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDownload(selectedSeason, ep.episode_number, ep.name);
                                }}
                                className="glass-dark p-3 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Download Episode"
                              >
                                <Download size={18} />
                              </button>
                            )}
                           </div>
                           <p className="text-base text-white/50 leading-relaxed line-clamp-3">
                            {ep.overview || (episodeUpcoming ? `Airing on ${formatDate(ep.air_date)}` : 'No overview available for this episode.')}
                           </p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
            )}

            {activeTab === 'more' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {(data.recommendations?.results || []).slice(0, 12).map((item: MediaBase) => (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/${item.media_type || type}/${item.id}`)}
                    className="group cursor-pointer space-y-4"
                  >
                    <div className="aspect-video rounded-xl overflow-hidden bg-[#181818] border border-white/5 relative shadow-2xl">
                      <img
                        src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Play size={48} fill="white" className="text-white scale-75 group-hover:scale-100 transition-transform duration-500" />
                      </div>
                    </div>
                    <div className="px-1 space-y-1">
                      <p className="text-sm font-black text-white truncate uppercase tracking-tight group-hover:text-[#E50914] transition-colors">
                        {item.title || item.name}
                      </p>
                      <p className="text-xs text-white/30 font-bold uppercase tracking-widest">
                        {( (item as any).release_date || (item as any).first_air_date || '').split('-')[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Download Modal */}
      {data && (
        <DownloadModal
          isOpen={isDownloadOpen}
          onClose={() => setIsDownloadOpen(false)}
          tmdbId={data.id}
          mediaType={type}
          title={data.title || data.name || ''}
          season={downloadTarget?.season}
          episode={downloadTarget?.episode}
          episodeTitle={downloadTarget?.episodeTitle}
        />
      )}
    </div>
  );
}
