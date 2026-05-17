import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tmdb from '../lib/tmdb';
import { getImageUrl } from '../lib/tmdb';
import { Play, Plus, ThumbsUp, ChevronDown, Clock, Star, Calendar } from 'lucide-react';
import MediaRow from '../components/MediaRow';

interface DetailProps {
  type: 'movie' | 'tv';
}

export default function Detail({ type }: DetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        const eps = await tmdb.getEpisodes(id, selectedSeason);
        setEpisodes(eps);
      }
    }
    fetchEpisodes();
  }, [id, type, selectedSeason]);

  if (loading) return <div className="pt-24 px-12">Loading details...</div>;
  if (!data) return <div className="pt-24 px-12">Not found.</div>;

  const handlePlay = () => {
    if (type === 'movie') {
      navigate(`/watch/movie/${id}`);
    } else {
      navigate(`/watch/tv/${id}/1/1`);
    }
  };

  return (
    <div className="relative pb-20">
      {/* Hero Backdrop */}
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] w-full">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(data.backdrop_path, 'original')}
            alt={data.title || data.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-[#141414] to-transparent" />
        </div>

        <div className="absolute bottom-[8%] left-4 md:left-12 right-4 md:right-auto max-w-2xl flex flex-col gap-4 md:gap-6 z-10">
          <div className="flex flex-col gap-1 md:gap-2">
             <h1 className="text-2xl sm:text-4xl md:text-6xl font-black drop-shadow-2xl leading-tight">
               {data.title || data.name}
             </h1>
             {data.tagline && <p className="text-sm sm:text-lg md:text-xl italic text-gray-400 line-clamp-1">{data.tagline}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-base font-semibold">
            <div className="flex items-center gap-1">
               <Calendar size={14} className="md:w-4 md:h-4" />
               <span>{(data.release_date || data.first_air_date || '').split('-')[0]}</span>
            </div>
            {type === 'movie' ? (
              <div className="flex items-center gap-1">
                <Clock size={14} className="md:w-4 md:h-4" />
                <span>{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span>
              </div>
            ) : (
              <span>{data.number_of_seasons} Seasons</span>
            )}
            <span className="border border-gray-500 px-1 md:px-2 rounded-sm text-[10px] md:text-xs">4K</span>
          </div>

          <p className="text-gray-200 text-sm md:text-lg line-clamp-3 md:line-clamp-4 max-w-sm md:max-w-xl leading-relaxed">
            {data.overview}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mt-2">
            <button
              onClick={handlePlay}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded-md hover:bg-white/80 transition-all font-bold text-base md:text-lg min-h-[44px]"
            >
              <Play size={20} className="md:w-6 md:h-6" fill="black" />
              Watch Now
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 md:pt-4">
            {data.genres.map((genre: any) => (
              <span key={genre.id} className="text-[10px] md:text-xs bg-gray-800 px-2 md:px-3 py-1 rounded-full text-gray-300">
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-12 mt-8 md:mt-12 space-y-8 md:space-y-12">
        {/* Cast */}
        <section className="space-y-4 overflow-visible">
          <h2 className="text-xl md:text-2xl font-bold">Top Cast</h2>
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar touch-pan-x">
            {data.credits.cast.slice(0, 10).map((person: any) => (
              <div key={person.id} className="flex-none w-24 md:w-32 space-y-2">
                <img
                  src={getImageUrl(person.profile_path, 'w500')}
                  alt={person.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-2 border-transparent hover:border-red-600 transition-all cursor-pointer shadow-lg"
                />
                <div className="text-center">
                  <p className="font-bold text-[11px] md:text-sm truncate text-white">{person.name}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{person.character}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TV Episodes */}
        {type === 'tv' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-bold italic">Episodes</h2>
              <select 
                className="bg-[#242424] text-white px-4 py-2 rounded-md outline-none border border-gray-700 hover:border-white transition-colors"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-4">
               {episodes.map((ep) => (
                 <div 
                  key={ep.id} 
                  className="flex flex-col md:flex-row items-start gap-4 p-4 rounded-md hover:bg-[#333] transition-colors cursor-pointer group"
                  onClick={() => navigate(`/watch/tv/${id}/${selectedSeason}/${ep.episode_number}`)}
                 >
                   <div className="relative flex-none w-full md:w-64 aspect-video overflow-hidden rounded-md">
                      <img 
                        src={getImageUrl(ep.still_path, 'w500')} 
                        alt={ep.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Play size={40} className="text-white fill-white"/>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-xs font-bold rounded-sm">
                        {ep.runtime || '45'}m
                      </span>
                      <span className="absolute top-2 left-2 text-3xl font-black text-white/50">{ep.episode_number}</span>
                   </div>
                   <div className="flex flex-col gap-2 pt-2">
                      <h4 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{ep.name}</h4>
                      <p className="text-gray-400 text-sm line-clamp-2 md:line-clamp-3 leading-relaxed">{ep.overview}</p>
                   </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        <MediaRow title="Recommendations" items={data.recommendations?.results} type={type} />
        <MediaRow title="More Like This" items={data.similar?.results} type={type} />
      </div>
    </div>
  );
}
