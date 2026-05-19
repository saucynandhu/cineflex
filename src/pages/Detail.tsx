import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import { getImageUrl } from '../lib/tmdb';
import { Play, Plus, ThumbsUp, ChevronDown, Clock, Star, Calendar, Loader2, Bookmark, BookmarkCheck, X, Film, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MediaRow from '../components/MediaRow';
import MediaCard from '../components/MediaCard';
import { useUserLists } from '../hooks/useUserLists';
import { cn } from '../lib/utils';

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
  const [data, setData] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'more'>('overview');
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  const { isInWatchLater, toggleWatchLater, continueWatching } = useUserLists();
  const cwItem = continueWatching.find(i => String(i.tmdbId || i.id) === String(id));

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const details = await tmdb.getDetails(type, id);
        setData(details);
        if (type === 'tv') {
          setSeasons(details.seasons.filter((s: any) => s.season_number > 0));
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

  if (loading || !data) return <div className="pt-24 px-12 h-screen bg-[#141414]">Loading...</div>;

  // Trailer selection logic
  const videos = data.videos?.results || [];
  const officialTrailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true);
  const anyTrailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
  const officialTeaser = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser' && v.official === true);
  
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
          <h1 className="text-4xl md:text-5xl font-black text-white">{data.title || data.name}</h1>
          
          <div className="flex items-center gap-3 text-sm font-semibold text-white/70">
            <span className="text-white">{(data.release_date || data.first_air_date || '').split('-')[0]}</span>
            <span className="border border-white/40 px-1 text-[10px]">16+</span>
            <span>{type === 'movie' ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : `${data.number_of_seasons} Seasons`}</span>
            <span className="border border-white/40 px-1 text-[10px]">HD</span>
          </div>

          <div className="flex items-center gap-3 py-2 border-y border-white/10">
            <StarRating rating={data.vote_average} />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">{data.vote_average.toFixed(1)}</span>
              <span className="text-xs text-white/40">/ 10</span>
            </div>
            <span className="text-xs text-white/40 italic">({data.vote_count.toLocaleString()})</span>
            {data.popularity > 100 && (
              <span className="text-[10px] bg-[#E50914] text-white px-2 py-0.5 rounded-full font-bold">Trending</span>
            )}
          </div>

          <p className="text-sm md:text-base text-white/80 leading-relaxed line-clamp-4">
            {data.overview}
          </p>

          <div className="flex flex-wrap gap-2">
            {data.genres.map((g: any) => (
              <span key={g.id} className="text-[10px] bg-white/10 text-white px-3 py-1 rounded-full font-medium">
                {g.name}
              </span>
            ))}
          </div>

          {type === 'tv' && cwItem && (
            <div className="space-y-2">
              <p className="text-xs text-white/60">Continue watching: S{cwItem.season} E{cwItem.episode} · {cwItem.episodeName || 'Episode Name'}</p>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#E50914]" style={{ width: `${cwItem.progress || 30}%` }} />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 overflow-visible">
            <button 
              onClick={handlePlay} 
              className="flex-1 sm:flex-none bg-[#E50914] text-white px-10 py-3 rounded font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} fill="white" /> Watch Now
            </button>
            <button 
              onClick={() => toggleWatchLater({ id: data.id, tmdbId: data.id, type, title: data.title || data.name, posterPath: data.poster_path, backdropPath: data.backdrop_path, year: (data.release_date || data.first_air_date || '').split('-')[0], addedAt: Date.now() })}
              className={cn("flex-1 sm:flex-none px-10 py-3 rounded font-bold transition-all border flex items-center justify-center gap-2", isInWatchLater(data.id, type) ? "bg-white text-black border-white" : "text-white border-white/50 hover:border-white")}
            >
              {isInWatchLater(data.id, type) ? <Check size={20} /> : <Plus size={20} />} My List
            </button>
            {selectedVideo && (
              <button 
                onClick={() => setActiveTrailer(selectedVideo.key)} 
                className="flex-1 sm:flex-none border border-white/50 text-white px-6 py-3 rounded font-bold hover:border-white transition-all flex items-center justify-center gap-2"
              >
                <Film size={20} /> Trailer
              </button>
            )}
          </div>
        </div>

        {/* Right Column (Poster) */}
        <div className="hidden md:block w-[300px]">
          <img
            src={getImageUrl(data.poster_path, 'w500')}
            alt={data.title || data.name}
            className="w-full rounded-md shadow-2xl border border-white/5"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12">
        <div className="flex gap-8 border-b border-white/10 mb-8">
          {['overview', type === 'tv' ? 'episodes' : null, 'more'].filter(Boolean).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-4 text-sm font-bold transition-all border-b-2",
                activeTab === tab ? "text-white border-[#E50914]" : "text-white/40 border-transparent hover:text-white"
              )}
            >
              {tab === 'overview' ? 'Overview' : tab === 'episodes' ? 'Episodes' : 'More Like This'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cast</h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {data.credits.cast.slice(0, 15).map((person: any) => (
                  <div key={person.id} className="flex-none w-16 text-center space-y-2">
                    {person.profile_path ? (
                      <img src={getImageUrl(person.profile_path, 'w500')} className="w-16 h-16 rounded-full object-cover" alt={person.name} />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center text-white/20">?</div>
                    )}
                    <p className="text-[10px] text-white font-medium line-clamp-1">{person.name}</p>
                    <p className="text-[8px] text-white/40 line-clamp-1">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold">Episodes</h3>
               <select value={selectedSeason} onChange={(e) => setSelectedSeason(Number(e.target.value))} className="bg-[#222] text-white px-4 py-1.5 rounded border border-white/10 outline-none text-sm">
                 {seasons.map(s => <option key={s.id} value={s.season_number}>Season {s.season_number}</option>)}
               </select>
             </div>
             <div className="space-y-4">
               {episodes.map(ep => (
                 <div key={ep.id} onClick={() => navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`)} className="flex gap-4 p-4 rounded hover:bg-white/5 cursor-pointer group">
                   <div className="relative w-40 aspect-video rounded overflow-hidden flex-none">
                     <img src={getImageUrl(ep.still_path, 'w500')} className="w-full h-full object-cover" alt="" />
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play size={24} fill="white" /></div>
                     <span className="absolute top-2 left-2 text-xl font-black text-white/50">{ep.episode_number}</span>
                   </div>
                   <div className="flex-1 space-y-1">
                     <h4 className="font-bold text-sm">{ep.name}</h4>
                     <p className="text-xs text-white/50 line-clamp-2">{ep.overview || 'No overview available.'}</p>
                   </div>
                   <div className="text-xs text-white/40">{ep.runtime || 45}m</div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-20 animate-fade-in">
            {(data.recommendations?.results || []).map((item: any) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/${item.media_type || type}/${item.id}`)}
                style={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  cursor: 'pointer',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#141414'
                }}
                className="group"
              >
                <img
                  src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                  alt={item.title || item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Simple hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 
                  transition-all duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-semibold opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300 line-clamp-1">
                    {item.title || item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal (re-using logic but styled) */}
      <AnimatePresence>
        {activeTrailer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveTrailer(null)} className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <button onClick={() => setActiveTrailer(null)} className="absolute top-4 right-4 text-white hover:text-red-500 z-10"><X size={32} /></button>
              <iframe src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
