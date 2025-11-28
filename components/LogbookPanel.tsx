import React, { useRef, useEffect, useState } from 'react';
import { LogEntry, Phase } from '../types';
import { Star, Paperclip, UserCircle } from 'lucide-react';

interface LogbookPanelProps {
  entries: LogEntry[];
  selectedId: string | null;
  onSelect: (entry: LogEntry) => void;
  filterPhase: Phase | 'ALL';
  setFilterPhase: (phase: Phase | 'ALL') => void;
  onOpenProfile: () => void;
}

const LogbookPanel: React.FC<LogbookPanelProps> = ({
  entries,
  selectedId,
  onSelect,
  filterPhase,
  setFilterPhase,
  onOpenProfile
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLTableRowElement>(null);
  const [showSignificantOnly, setShowSignificantOnly] = useState(false);

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedId]);

  // Apply "Significant Only" filter locally if checked
  const displayEntries = showSignificantOnly 
    ? entries.filter(e => e.isSignificant || e.historicalNote)
    : entries;

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] border-r-4 border-stone-800 shadow-2xl z-10 font-old-print relative">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] z-0"></div>

      {/* Header / Binding */}
      <div className="p-4 bg-stone-800 text-stone-200 shadow-md sticky top-0 z-20 border-b-4 border-stone-900">
        <div className="flex items-start justify-between mb-2">
            <div>
                <h2 className="text-2xl font-typewriter tracking-widest text-amber-500 uppercase">
                RAF Flight Book
                </h2>
                <p className="text-xs font-mono text-stone-400">PILOT'S FLYING LOG BOOK</p>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="text-xl font-handwriting text-stone-100 mb-1">Robin Glen</div>
                <button 
                    onClick={onOpenProfile}
                    className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 border border-stone-600 hover:border-amber-600/50 text-amber-500 hover:text-amber-400 px-3 py-1.5 rounded-sm transition-all shadow-sm group"
                >
                    <UserCircle className="w-4 h-4 group-hover:scale-105 transition-transform" />
                    <span className="font-typewriter text-[10px] uppercase tracking-widest font-bold">View Service Record</span>
                </button>
                <p className="text-[10px] font-typewriter text-stone-500 mt-1.5 opacity-80">313 Czech Squadron</p>
            </div>
        </div>
        
        {/* Simple Phase Tabs */}
        <div className="flex flex-col gap-2 mt-3 border-t border-stone-700 pt-3">
          <div className="flex gap-1">
            <button
                onClick={() => setFilterPhase('ALL')}
                className={`px-3 py-1 text-xs font-typewriter uppercase tracking-wider transition-colors ${
                filterPhase === 'ALL' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'
                }`}
            >
                All
            </button>
            {Object.values(Phase).map((phase) => (
                <button
                key={phase}
                onClick={() => setFilterPhase(phase)}
                className={`px-3 py-1 text-xs font-typewriter uppercase tracking-wider transition-colors ${
                    filterPhase === phase ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'
                }`}
                >
                {phase === Phase.COMBAT ? 'Ops' : phase}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="sigOnly" 
                checked={showSignificantOnly} 
                onChange={(e) => setShowSignificantOnly(e.target.checked)}
                className="w-4 h-4 accent-amber-600 bg-stone-700 border-stone-600 rounded focus:ring-amber-500 focus:ring-1"
              />
              <label htmlFor="sigOnly" className="text-xs font-typewriter text-stone-400 uppercase tracking-wider cursor-pointer hover:text-stone-200">
                Exclude Routine Operations
              </label>
          </div>
        </div>
      </div>

      {/* Logbook Grid */}
      <div className="flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-stone-400 scrollbar-track-[#f4f1ea]" ref={scrollRef}>
        <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-[#e8e4db] text-stone-600 sticky top-0 shadow-sm font-typewriter text-[10px] uppercase tracking-wider z-10">
                <tr>
                    <th className="p-2 border-r border-stone-400 w-24">Date</th>
                    <th className="p-2 border-r border-stone-400 w-24">Aircraft</th>
                    <th className="p-2 border-r border-stone-400 w-16 text-center">Time</th>
                    <th className="p-2 border-r border-stone-400">Duty & Remarks</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-400/50">
                {displayEntries.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center font-handwriting text-xl text-stone-500">
                            {showSignificantOnly ? "No significant events in this phase." : "No entries recorded for this period."}
                        </td>
                    </tr>
                ) : (
                    displayEntries.map((entry) => {
                    const isSelected = selectedId === entry.id;
                    const isDDay = entry.date === '1944-06-06';
                    const hasNote = !!entry.historicalNote;
                    
                    return (
                        <tr
                            key={entry.id}
                            ref={isSelected ? selectedRef : null}
                            onClick={() => onSelect(entry)}
                            className={`
                                cursor-pointer group transition-colors duration-150 relative
                                ${isSelected ? 'bg-amber-100/60' : 'hover:bg-stone-200/40'}
                                ${isDDay ? 'bg-red-50/50' : ''}
                            `}
                        >
                            {/* Date Column with Selection Bar Inside */}
                            <td className="p-2 border-r border-stone-400 font-typewriter text-xs text-stone-800 align-top relative">
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-600 z-10 shadow-sm"></div>
                                )}
                                {entry.date}
                                {hasNote && !isSelected && (
                                    <Paperclip className="w-3 h-3 text-red-800 absolute top-1 right-1 opacity-60" />
                                )}
                            </td>

                            {/* Aircraft */}
                            <td className="p-2 border-r border-stone-400 font-typewriter text-xs font-bold text-stone-900 align-top break-words">
                                {entry.aircraftType}
                            </td>

                            {/* Time */}
                            <td className="p-2 border-r border-stone-400 font-handwriting text-sm text-stone-800 text-center align-top">
                                {entry.time}
                            </td>

                            {/* Remarks */}
                            <td className="p-2 relative align-top">
                                <div className="font-handwriting text-lg text-blue-900 leading-tight">
                                    {entry.duty}
                                </div>
                                <div className="font-handwriting text-base text-stone-600 mt-1 pl-2 border-l-2 border-stone-300">
                                    {entry.remarks}
                                </div>
                                {isDDay && (
                                    <div className="absolute top-2 right-2 opacity-20 transform rotate-12">
                                        <div className="border-4 border-red-800 text-red-800 font-bold text-xs px-2 py-1 uppercase tracking-widest rounded-sm font-typewriter">
                                            Overlord
                                        </div>
                                    </div>
                                )}
                                {hasNote && (
                                    <div className="absolute bottom-1 right-1">
                                        <span className="text-[9px] font-typewriter text-red-800 uppercase bg-red-50 border border-red-200 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            See Notes
                                        </span>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                    })
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogbookPanel;