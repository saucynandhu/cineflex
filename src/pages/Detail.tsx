import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import { getImageUrl } from '../lib/tmdb';
import { Play, Plus, Star, Film, Check, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUserLists } from '../hooks/useUserLists';
import { cn, isUpcoming, formatDate } from '../lib/utils';
import { MediaDetails, Season, Episode, MediaBase, Video } from '../types/tmdb';
import LoadingScreen from '../components/LoadingScreen';
import MediaCard from '../components/MediaCard';

interface DetailProps {
  type: 'movie' | 'tv';
}

const StarRating = ({ rating }: { rating: number }) => {
  const filledStars = (rating / 10) * 5;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const fillAmount = Math.max(0, Math.min(1, filledStars - i));
        return (
          <div key={i} className="relative w-4 h-4">
            <Star size={16} className="text-[#333333] absolute inset-0" fill="#333333" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
              <Star size={16} className="text-[#E50914]" fill="#E50914" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Detail({ type }: DetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<MediaDetails | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'more'>('overview');
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  const { isInWatchLater, toggleWatchLater, continueWatching, watched } = useUserLists();
  const cwItem = continueWatching.find(i => String(i.tmdbId || i.id) === String(id));
  
  const releaseDate = data ? (data as any).release_date || (data as any).first_air_date : undefined;
  const upcoming = isUpcoming(releaseDate);

  const isEpisodeWatched = useCallback((seasonNumber: number, episodeNumber: number) => {
    return watched.some(item =>
      item.type === 'tv' &&
      String(item.tmdbId || item.id) === String(id) &&
      Number(item.season) === Number(seasonNumber) &&
      Number(item.episode) === Number(episodeNumber)
    );
  }, [id, watched]);

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      setLoading(true);
      setCollection(null);
      try {
        const details = await tmdb.getDetails(type, id);
        setData(details);
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

  if (loading || !data) return <LoadingScreen />;

  // Trailer selection logic
  const videos = data.videos?.results || [];
  const officialTrailer = videos.find((v: Video) => v.site === 'YouTube' && v.type === 'Trailer' && (v as any).official === true);
  const anyTrailer = videos.find((v: Video) => v.site === 'YouTube' && v.type === 'Trailer');
  const officialTeaser = videos.find((v: Video) => v.site === 'YouTube' && v.type === 'Teaser' && (v as any).official === true);
  
  const selectedVideo = officialTrailer || anyTrailer || officialTeaser || null;

  const handlePlay = () => {
    if (type === 'movie') {
      navigate(`/watch/movie/${id}`);
    } else {
      const s = cwItem?.season || 1;
      const e = cwItem?.episode || 1;
      navigate(`/watch/tv/${id}/${s}/${e}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#141414]">
      {/* Backdrop */}
      <div className="relative w-full h-[60vh]">
        <img
          src={getImageUrl(data.backdrop_path, 'original')}
          alt={data.title || data.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
      </div>

      {/* Main Content Overlap */}
      <div className="relative z-10 -mt-48 max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{data.title || data.name}</h1>
          
          <div className="flex items-center gap-3 text-sm font-semibold text-white/70">
            <span className="text-white">{((data as any).release_date || (data as any).first_air_date || '').split('-')[0]}</span>
            <span className="border border-white/40 px-1 text-[10px] rounded-[2px]">16+</span>
            <span>
              {type === 'movie' 
                ? `${Math.floor((data.runtime || 0) / 60)}h ${(data.runtime || 0) % 60}m` 
                : `${data.number_of_seasons} Seasons`}
            </span>
            <span className="border border-white/40 px-1 text-[10px] rounded-[2px]">HD</span>
          </div>

          <div className="flex items-center gap-3 py-2 border-y border-white/10">
            <StarRating rating={data.vote_average} />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">{data.vote_average.toFixed(1)}</span>
              <span className="text-xs text-white/40">/ 10</span>
            </div>
            <span className="text-xs text-white/40 italic">({data.vote_count.toLocaleString()})</span>
            {data.popularity > 100 && (
              <span className="text-[10px] bg-[#E50914] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Trending</span>
            )}
          </div>

          <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-2xl">
            {data.overview}
          </p>

          <div className="flex flex-wrap gap-2">
            {data.genres.map((g) => (
              <span key={g.id} className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {g.name}
              </span>
            ))}
          </div>

          {type === 'tv' && cwItem && (
            <div className="bg-white/5 border-l-4 border-[#E50914] p-3 rounded">
              <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">Continue watching</p>
              <p className="text-sm text-white font-medium">S{cwItem.season} E{cwItem.episode} · {cwItem.episodeName || 'Next Episode'}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 overflow-visible pt-4">
            {upcoming ? (
              <div className="flex-1 sm:flex-none bg-white/10 border border-white/20 text-white px-8 py-3 rounded font-black flex items-center justify-center gap-3 uppercase tracking-tight">
                <Calendar size={24} className="text-[#E50914]" />
                Available on {formatDate(releaseDate)}
              </div>
            ) : (
              <button 
                onClick={handlePlay} 
                className="flex-1 sm:flex-none bg-white text-black px-10 py-3 rounded font-black hover:bg-white/80 transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
              >
                <Play size={24} fill="black" /> Play
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
                year: ((data as any).release_date || (data as any).first_air_date || '').split('-')[0], 
                addedAt: Date.now() 
              })}
              className={cn(
                "flex-1 sm:flex-none px-10 py-3 rounded font-black transition-all border flex items-center justify-center gap-2 uppercase tracking-tight", 
                isInWatchLater(data.id, type) ? "bg-white/20 text-white border-white/20" : "text-white border-white/40 hover:border-white"
              )}
            >
              {isInWatchLater(data.id, type) ? <Check size={20} /> : <Plus size={20} />} My List
            </button>
            {selectedVideo && (
              <button 
                onClick={() => setActiveTrailer(selectedVideo.key)} 
                className="flex-1 sm:flex-none border border-white/40 text-white px-8 py-3 rounded font-black hover:border-white transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
              >
                <Film size={20} /> Trailer
              </button>
            )}
          </div>
        </div>

        {/* Right Column (Poster) */}
        <div className="hidden md:block w-[280px] shrink-0">
          <img
            src={getImageUrl(data.poster_path, 'w500')}
            alt={data.title || data.name}
            className="w-full rounded-md shadow-2xl border border-white/5"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-16 pb-20">
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
          {['overview', type === 'tv' ? 'episodes' : null, 'more'].filter(Boolean).map((tab) => (
            <button
              key={tab!}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-[3px] whitespace-nowrap",
                activeTab === tab ? "text-white border-[#E50914]" : "text-white/40 border-transparent hover:text-white"
              )}
            >
              {tab === 'overview' ? 'Overview' : tab === 'episodes' ? 'Episodes' : 'More Like This'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && data.credits && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-l-4 border-[#E50914] pl-3">Top Cast</h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {data.credits.cast.slice(0, 15).map((person) => (
                  <div key={person.id} className="flex-none w-20 text-center space-y-3">
                    <div className="relative group">
                      {person.profile_path ? (
                        <img 
                          src={getImageUrl(person.profile_path, 'w500')} 
                          className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-[#E50914] transition-all" 
                          alt={person.name} 
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#333] flex items-center justify-center text-white/20 font-black text-xl">?</div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-white font-black line-clamp-1">{person.name}</p>
                      <p className="text-[9px] text-white/40 line-clamp-1 italic">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {type === 'movie' && collection && (
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">{collection.name}</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {collection.parts
                    .filter((part: any) => part.poster_path)
                    .sort((a: any, b: any) => (a.release_date || '').localeCompare(b.release_date || ''))
                    .map((part: any) => {
                      const isCurrent = Number(part.id) === Number(id);
                      const releaseYear = (part.release_date || '').split('-')[0];
                      return (
                        <div 
                          key={part.id}
                          onClick={() => !isCurrent && navigate(`/movie/${part.id}`)}
                          className={cn(
                            "flex-none w-24 md:w-32 cursor-pointer relative group",
                            isCurrent ? "cursor-default" : "opacity-60 hover:opacity-100 transition-opacity"
                          )}
                        >
                          <div className={cn(
                            "aspect-[2/3] rounded overflow-hidden relative shadow-lg",
                            isCurrent && "border-2 border-[#E50914]"
                          )}>
                            <img 
                              src={`https://image.tmdb.org/t/p/w200${part.poster_path}`} 
                              alt={part.title}
                              className="w-full h-full object-cover"
                            />
                            {isCurrent && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="bg-[#E50914] text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">Current</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-white font-bold mt-2 line-clamp-1">{part.title}</p>
                          <p className="text-[10px] text-white/40">{releaseYear}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-white uppercase tracking-widest border-l-4 border-[#E50914] pl-3">Episodes</h3>
               <select 
                value={selectedSeason} 
                onChange={(e) => setSelectedSeason(Number(e.target.value))} 
                className="bg-[#181818] text-white px-4 py-2 rounded border border-white/20 outline-none text-xs font-bold uppercase tracking-wider focus:border-white transition-colors"
               >
                 {seasons.map(s => <option key={s.id} value={s.season_number}>Season {s.season_number}</option>)}
               </select>
             </div>
             <div className="grid grid-cols-1 gap-1">
               {episodes.map(ep => {
                 const episodeWatched = isEpisodeWatched(selectedSeason, ep.episode_number);
                 return (
                   <div
                     key={ep.id}
                     onClick={() => navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`)}
                     className={cn(
                       "flex flex-col md:flex-row gap-6 p-6 rounded-lg transition-all border border-transparent hover:border-white/20 hover:bg-white/5 cursor-pointer group",
                       episodeWatched && "bg-white/[0.02]"
                     )}
                   >
                     <div className="relative w-full md:w-56 aspect-video rounded overflow-hidden flex-none shadow-lg">
                       <img 
                        src={getImageUrl(ep.still_path || data.backdrop_path, 'w500')} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt="" 
                       />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={32} fill="white" />
                       </div>
                       <span className="absolute top-3 left-3 text-2xl font-black text-white/50">{ep.episode_number}</span>
                       {episodeWatched && (
                         <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                           <Check size={18} strokeWidth={3} />
                         </div>
                       )}
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-black text-lg text-white">{ep.name}</h4>
                        <span className="text-xs font-bold text-white/40">{(ep as any).runtime || 45}m</span>
                       </div>
                       <p className="text-sm text-white/60 leading-relaxed line-clamp-3 md:line-clamp-2">
                        {ep.overview || 'No overview available for this episode.'}
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {(data.recommendations?.results || []).slice(0, 12).map((item: MediaBase) => (
              <MediaCard
                key={item.id}
                item={item}
                type={(item.media_type || type) as 'movie' | 'tv'}
                layout="grid"
              />
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {activeTrailer && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setActiveTrailer(null)} 
            className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setActiveTrailer(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 bg-black/50 p-2 rounded-full"
              >
                <X size={24} />
              </button>
              <iframe 
                src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`} 
                className="w-full h-full" 
                allow="autoplay; fullscreen" 
                title="Trailer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
