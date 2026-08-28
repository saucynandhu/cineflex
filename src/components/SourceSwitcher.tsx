import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { SourceId, SOURCES } from '../lib/sources';

interface SourceSwitcherProps {
  activeSource: SourceId;
  onSourceChange: (id: SourceId) => void;
}

export default function SourceSwitcher({ activeSource, onSourceChange }: SourceSwitcherProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <select
          value={activeSource}
          onChange={(e) => onSourceChange(e.target.value as SourceId)}
          className="bg-[#1a1a1a] text-white border-2 border-[#E50914] rounded px-3 py-2 outline-none cursor-pointer font-bold text-sm w-full md:w-auto"
          aria-label="Video source"
        >
          {SOURCES.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>

        <Link 
          to="/ads" 
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-white transition-colors border border-gray-800 rounded px-2 py-1.5"
        >
          <ShieldAlert size={12} className="text-[#E50914]" />
          <span>Why are there ads?</span>
        </Link>
      </div>
      
      <p className="text-[11px] text-gray-400 font-medium">
        If a source doesn't load, try another from the list above.
      </p>
    </div>
  );
}
