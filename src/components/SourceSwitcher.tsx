import { Monitor, Layers, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export type SourceId = 
  | 'vidlink' 
  | 'vidsrc_me' 
  | 'vidsrc_cc' 
  | 'vidsrc_icu' 
  | 'twoembed' 
  | 'superembed';

interface Source {
  id: SourceId;
  name: string;
}

const SOURCES: Source[] = [
  { id: 'vidlink', name: 'VidLink' },
  { id: 'vidsrc_me', name: 'VidSrc.me' },
  { id: 'vidsrc_cc', name: 'VidSrc.cc' },
  { id: 'vidsrc_icu', name: 'VidSrc.icu' },
  { id: 'twoembed', name: '2Embed' },
  { id: 'superembed', name: 'SuperEmbed' },
];

interface SourceSwitcherProps {
  activeSource: SourceId;
  onSourceChange: (id: SourceId) => void;
}

export default function SourceSwitcher({ activeSource, onSourceChange }: SourceSwitcherProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        <div className="flex items-center gap-2 flex-nowrap md:flex-wrap">
          {SOURCES.map((source) => {
            const isActive = activeSource === source.id;
            
            return (
              <button
                key={source.id}
                onClick={() => onSourceChange(source.id)}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border-2",
                  isActive 
                    ? "bg-[#E50914] border-[#E50914] text-white shadow-lg" 
                    : "bg-black/40 border-transparent text-gray-400 hover:text-white hover:border-[#E50914]"
                )}
              >
                {source.name}
              </button>
            );
          })}
        </div>
      </div>
      
      <p className="text-[11px] text-gray-400 font-medium">
        If a source doesn't load, try another from the list above.
      </p>
    </div>
  );
}
