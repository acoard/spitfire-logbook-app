import React, { useState, useMemo } from 'react';
import { FLIGHT_LOG } from './services/flightData';
import { LogEntry, Phase } from './types';
import LogbookPanel from './components/LogbookPanel';
import MapPanel from './components/MapPanel';
import ContextPanel from './components/ContextPanel';
import PilotProfileModal from './components/PilotProfileModal';

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL');
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Filter Logic
  const filteredEntries = useMemo(() => {
    if (filterPhase === 'ALL') return FLIGHT_LOG;
    return FLIGHT_LOG.filter((entry) => entry.phase === filterPhase);
  }, [filterPhase]);

  // Derived state
  const selectedEntry = useMemo(
    () => FLIGHT_LOG.find((e) => e.id === selectedId) || null,
    [selectedId]
  );

  const handleLogbookSelect = (entry: LogEntry) => {
    setSelectedId(entry.id);
    setShouldCenterMap(true);
  };

  const handleMarkerSelect = (entry: LogEntry) => {
    setSelectedId(entry.id);
    setShouldCenterMap(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-900 font-sans">
      
      {/* Profile Modal */}
      <PilotProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Panel: Logbook & Context (Desktop: Fixed Width, Mobile: Collapsible/Scroll) */}
        <div className="w-full md:w-[500px] lg:w-[550px] flex flex-col h-[55vh] md:h-full z-20 shadow-2xl bg-[#f4f1ea]">
          {/* Scrollable Logbook */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
             {/* Binding effect on the right */}
             <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/10 to-transparent z-20 pointer-events-none"></div>
            
            <LogbookPanel 
              entries={filteredEntries} 
              selectedId={selectedId} 
              onSelect={handleLogbookSelect}
              filterPhase={filterPhase}
              setFilterPhase={setFilterPhase}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          </div>

          {/* Context Panel (Historical Briefing) */}
          <div className="h-auto min-h-[200px] relative">
            <ContextPanel selectedEntry={selectedEntry} />
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 h-[45vh] md:h-full relative bg-stone-800 border-l-8 border-stone-900">
           <MapPanel 
             entries={filteredEntries} 
             selectedEntry={selectedEntry} 
             onMarkerSelect={handleMarkerSelect}
             shouldCenter={shouldCenterMap}
           />
        </div>
        
      </div>
    </div>
  );
};

export default App;