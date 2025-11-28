import React, { useState } from 'react';
import { LogEntry } from '../types';
import { AIRCRAFT_SPECS } from '../services/flightData';
import { FolderOpen, Plane, FileText } from 'lucide-react';

interface ContextPanelProps {
  selectedEntry: LogEntry | null;
}

type Tab = 'MISSION' | 'AIRCRAFT';

const ContextPanel: React.FC<ContextPanelProps> = ({ selectedEntry }) => {
  const [activeTab, setActiveTab] = useState<Tab>('MISSION');

  if (!selectedEntry) {
    return (
      <div className="bg-[#f4f1ea] border-t-4 border-stone-800 p-6 flex flex-col items-center justify-center text-center h-full shadow-inner relative z-20">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>
         <div className="opacity-40">
            <FolderOpen className="w-12 h-12 text-stone-800 mx-auto mb-2" />
            <p className="font-typewriter text-stone-600 text-sm">SELECT ENTRY FOR DETAILS</p>
         </div>
      </div>
    );
  }

  const isDDay = selectedEntry.date === '1944-06-06';
  const aircraftSpec = AIRCRAFT_SPECS[selectedEntry.aircraftType];

  return (
    <div className={`
        bg-[#f4f1ea] border-t-4 border-stone-800 p-0 flex flex-col shadow-inner relative z-20 overflow-hidden h-full
        ${isDDay ? 'bg-red-50' : ''}
    `}>
        {/* Paper texture */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>

        {/* Tab Header */}
        <div className="bg-stone-200 border-b border-stone-300 flex relative z-10">
             <button 
                onClick={() => setActiveTab('MISSION')}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 text-xs font-typewriter uppercase tracking-wider transition-colors border-r border-stone-300
                    ${activeTab === 'MISSION' ? 'bg-[#f4f1ea] text-stone-900 font-bold shadow-[0_2px_0_#f4f1ea]' : 'bg-stone-300 text-stone-500 hover:bg-stone-200'}`}
             >
                <FileText className="w-3 h-3" /> Mission Brief
             </button>
             <button 
                onClick={() => setActiveTab('AIRCRAFT')}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 text-xs font-typewriter uppercase tracking-wider transition-colors
                    ${activeTab === 'AIRCRAFT' ? 'bg-[#f4f1ea] text-stone-900 font-bold shadow-[0_2px_0_#f4f1ea]' : 'bg-stone-300 text-stone-500 hover:bg-stone-200'}`}
             >
                <Plane className="w-3 h-3" /> Aircraft Intel
             </button>
        </div>

        <div className="p-5 relative z-10 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-stone-400">
             {/* Title */}
             <h3 className="font-typewriter text-lg font-bold text-stone-900 mb-1 border-b-2 border-stone-800 inline-block pb-1">
                {selectedEntry.origin.name} 
                {selectedEntry.destination && selectedEntry.destination.name !== selectedEntry.origin.name && ` ➝ ${selectedEntry.destination.name}`}
             </h3>
             <p className="font-mono text-[10px] text-stone-500 mb-4">DATE: {selectedEntry.date}</p>

             {/* Content Switching */}
             {activeTab === 'MISSION' && (
                 <div className="mt-2 font-old-print text-stone-800 leading-relaxed text-sm animate-in fade-in duration-300">
                    {selectedEntry.historicalNote ? (
                        <div className="bg-white p-4 shadow-sm border border-stone-300 transform -rotate-1 relative">
                            {/* Pin effect */}
                            <div className="absolute -top-3 left-1/2 w-3 h-3 rounded-full bg-red-800 shadow-sm border border-red-900"></div>
                            <p className="whitespace-pre-line">{selectedEntry.historicalNote}</p>
                        </div>
                    ) : (
                        <div className="text-stone-500 italic font-handwriting text-lg pl-4 border-l-4 border-stone-300 py-2">
                            "Routine flight operations. No special incident reports filed for this date."
                        </div>
                    )}
                 </div>
             )}

            {activeTab === 'AIRCRAFT' && (
                <div className="mt-2 animate-in fade-in duration-300">
                    {aircraftSpec ? (
                        <div className="border-2 border-stone-400 p-1 bg-blue-50/30">
                            <div className="border border-stone-400 p-3">
                                <h4 className="font-typewriter text-sm font-bold uppercase text-stone-800 border-b border-stone-400 mb-3 pb-1">
                                    Technical Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 font-mono text-xs text-stone-700">
                                    <div className="text-stone-500">MODEL:</div>
                                    <div className="font-bold">{aircraftSpec.name}</div>
                                    
                                    <div className="text-stone-500">ROLE:</div>
                                    <div className="font-bold">{aircraftSpec.role}</div>
                                    
                                    <div className="text-stone-500">MAX SPEED:</div>
                                    <div>{aircraftSpec.maxSpeed}</div>
                                    
                                    <div className="text-stone-500">RANGE:</div>
                                    <div>{aircraftSpec.range}</div>
                                </div>
                                <div className="font-old-print text-sm text-stone-800 border-t border-dashed border-stone-400 pt-2">
                                    {aircraftSpec.description}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-stone-500 italic text-sm text-center py-4">
                            No detailed specifications available for {selectedEntry.aircraftType}.
                        </div>
                    )}
                </div>
            )}

             {/* Footer Info */}
             <div className="mt-6 pt-4 border-t border-stone-300 flex justify-between items-end">
                <div>
                    <span className="block font-typewriter text-[10px] text-stone-500 uppercase">Aircraft Type</span>
                    <span className="font-typewriter text-sm font-bold">{selectedEntry.aircraftType}</span>
                </div>
                <div>
                     <span className="block font-typewriter text-[10px] text-stone-500 uppercase text-right">Flight Duration</span>
                    <span className="font-handwriting text-xl">{selectedEntry.time} hrs</span>
                </div>
             </div>
        </div>
    </div>
  );
};

export default ContextPanel;