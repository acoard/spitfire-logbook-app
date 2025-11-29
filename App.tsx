import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeftRight, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { FLIGHT_LOG } from './services/flightData';
import { LogEntry, Phase } from './types';
import LogbookPanel from './components/LogbookPanel';
import MapPanel from './components/MapPanel';
import ContextPanel from './components/ContextPanel';
import PilotProfileModal from './components/PilotProfileModal';

const MIN_SIDE = 360;
const MAX_SIDE = 900;
const MIN_RATIO = 0.35;
const MAX_RATIO = 0.85;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    setMatches(mediaQuery.matches);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

const layoutPresets = {
  balanced: { side: 560, ratio: 0.64 },
  logbook: { side: 880, ratio: 0.84 },
  map: { side: 420, ratio: 0.48 }
} as const;

type PresetKey = keyof typeof layoutPresets;
type LayoutPreset = PresetKey | 'custom';

const layoutMenuOptions: Array<{ key: PresetKey; label: string; helper: string }> = [
  { key: 'logbook', label: 'Focus Logbook', helper: 'Prioritize entries' },
  { key: 'map', label: 'Focus Map', helper: 'Mission-first' },
  { key: 'balanced', label: 'Focus Balanced', helper: 'Reset split' }
];

const App: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL');
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidePanelWidth, setSidePanelWidth] = useState(layoutPresets.balanced.side);
  const [logbookHeightRatio, setLogbookHeightRatio] = useState(layoutPresets.balanced.ratio);
  const [activePreset, setActivePreset] = useState<LayoutPreset>('balanced');
  const [isDraggingSide, setIsDraggingSide] = useState(false);
  const [isDraggingStack, setIsDraggingStack] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [isMobileLogbookOpen, setIsMobileLogbookOpen] = useState(true);
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(true);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const horizontalDragData = useRef({
    startX: 0,
    initialWidth: layoutPresets.balanced.side
  });
  const verticalDragData = useRef({
    startY: 0,
    initialRatio: layoutPresets.balanced.ratio,
    containerHeight: 1
  });
  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const layoutMenuButtonRef = useRef<HTMLButtonElement>(null);

  const mobileContextPanelId = 'mobile-context-panel';
  const mobileLogbookPanelId = 'mobile-logbook-panel';
  const mobileMapPanelId = 'mobile-map-panel';

  useEffect(() => {
    if (selectedId) {
      setIsMobileContextOpen(true);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!isLayoutMenuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        layoutMenuRef.current?.contains(target) ||
        layoutMenuButtonRef.current?.contains(target)
      ) {
        return;
      }
      setIsLayoutMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLayoutMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isLayoutMenuOpen]);

  useEffect(() => {
    if (isDraggingSide || isDraggingStack) {
      document.body.style.cursor = isDraggingSide ? 'col-resize' : 'row-resize';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDraggingSide, isDraggingStack]);

  useEffect(() => {
    if (!isDraggingSide) return;
    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - horizontalDragData.current.startX;
      const newWidth = clamp(horizontalDragData.current.initialWidth + delta, MIN_SIDE, MAX_SIDE);
      setSidePanelWidth(newWidth);
    };
    const handleMouseUp = () => setIsDraggingSide(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSide]);

  useEffect(() => {
    if (!isDraggingStack) return;
    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientY - verticalDragData.current.startY;
      const deltaRatio = delta / verticalDragData.current.containerHeight;
      const nextRatio = clamp(verticalDragData.current.initialRatio + deltaRatio, MIN_RATIO, MAX_RATIO);
      setLogbookHeightRatio(nextRatio);
    };
    const handleMouseUp = () => setIsDraggingStack(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingStack]);

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

  const handlePresetApply = (preset: PresetKey) => {
    const config = layoutPresets[preset];
    setSidePanelWidth(config.side);
    setLogbookHeightRatio(config.ratio);
    setActivePreset(preset);
  };

  const handleLayoutReset = () => handlePresetApply('balanced');

  const handleMenuSelect = (preset: PresetKey) => {
    handlePresetApply(preset);
    setIsLayoutMenuOpen(false);
  };

  const handleHorizontalDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    setActivePreset('custom');
    setIsLayoutMenuOpen(false);
    horizontalDragData.current = {
      startX: event.clientX,
      initialWidth: sidePanelWidth
    };
    setIsDraggingSide(true);
  };

  const handleVerticalDragStart = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!leftPanelRef.current) return;
    const bounds = leftPanelRef.current.getBoundingClientRect();
    verticalDragData.current = {
      startY: event.clientY,
      initialRatio: logbookHeightRatio,
      containerHeight: bounds.height || 1
    };
    setActivePreset('custom');
    setIsLayoutMenuOpen(false);
    setIsDraggingStack(true);
  };

  const desktopLayout = (
    <div className="flex flex-1 overflow-hidden bg-stone-900/30">
      <div
        ref={leftPanelRef}
        className="flex flex-col h-full bg-[#f4f1ea] shadow-[10px_0_30px_rgba(0,0,0,0.25)] border-r-8 border-stone-900 transition-[width] duration-300 ease-out"
        style={{
          width: `min(100%, ${sidePanelWidth}px)`,
          minWidth: `${MIN_SIDE}px`
        }}
      >
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            flexBasis: `${logbookHeightRatio * 100}%`,
            minHeight: '240px',
            transition: 'flex-basis 250ms ease'
          }}
        >
          <LogbookPanel
            entries={filteredEntries}
            selectedId={selectedId}
            onSelect={handleLogbookSelect}
            filterPhase={filterPhase}
            setFilterPhase={setFilterPhase}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize logbook and context panels"
          onMouseDown={handleVerticalDragStart}
          onDoubleClick={() => {
            setLogbookHeightRatio(layoutPresets.balanced.ratio);
            setActivePreset('custom');
          }}
          className={`flex items-center justify-center h-6 cursor-row-resize border-y border-stone-900/70 bg-stone-900/70 text-stone-200 transition-colors ${
            isDraggingStack ? 'bg-amber-500/60 text-stone-900' : 'hover:bg-amber-500/30 hover:text-stone-900'
          }`}
          title="Drag to adjust the logbook/context split"
        >
          <ArrowUpDown className="w-4 h-4" />
        </div>

        <div
          className="relative overflow-hidden flex-shrink-0 flex-1"
          style={{
            flexBasis: `${(1 - logbookHeightRatio) * 100}%`,
            minHeight: '200px',
            transition: 'flex-basis 250ms ease'
          }}
        >
          <ContextPanel selectedEntry={selectedEntry} />
        </div>
      </div>

      <div className="relative h-full">
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize map panel"
          onMouseDown={handleHorizontalDragStart}
          onDoubleClick={handleLayoutReset}
          className={`relative flex flex-col items-center gap-3 px-2 py-4 w-12 h-full cursor-col-resize bg-stone-900/80 text-stone-200 transition-colors ${
            isDraggingSide ? 'bg-amber-500/60 text-stone-900' : 'hover:bg-amber-500/30 hover:text-stone-900'
          }`}
          title="Drag to adjust map width"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <button
            type="button"
            ref={layoutMenuButtonRef}
            aria-haspopup="menu"
            aria-expanded={isLayoutMenuOpen}
            aria-controls="layout-menu"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setIsLayoutMenuOpen((prev) => !prev);
            }}
            className="flex items-center justify-center w-6 h-6 rounded-full border border-current text-xs leading-none font-mono hover:bg-amber-500/20"
            title="Layout presets"
          >
            ...
          </button>
        </div>

        {isLayoutMenuOpen && (
          <div
            id="layout-menu"
            ref={layoutMenuRef}
            role="menu"
            className="absolute right-12 top-1/2 -translate-y-1/2 bg-stone-950 text-stone-100 border border-amber-500/40 rounded-md shadow-2xl w-48 z-50 py-2"
          >
            {layoutMenuOptions.map(({ key, label, helper }) => {
              const isActive = activePreset === key;
              return (
                <button
                  key={key}
                  role="menuitem"
                  onClick={() => handleMenuSelect(key)}
                  className={`w-full text-left px-4 py-2 text-[11px] font-typewriter uppercase tracking-[0.35em] flex flex-col gap-1 border-l-4 transition ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'border-transparent hover:border-amber-300 hover:bg-stone-900'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[9px] text-stone-400 tracking-[0.4em]">{helper}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 relative bg-stone-800 border-l-8 border-stone-900 shadow-inner transition-all duration-300 ease-out">
        <MapPanel
          entries={filteredEntries}
          selectedEntry={selectedEntry}
          onMarkerSelect={handleMarkerSelect}
          shouldCenter={shouldCenterMap}
          resizeSignal={sidePanelWidth}
        />
      </div>
    </div>
  );

  const mobileLayout = (
    <div className="flex flex-col gap-4 p-4 pb-6 overflow-y-auto">
      <section className="rounded-xl border-4 border-stone-900 shadow-2xl overflow-hidden bg-[#f4f1ea]">
        <button
          type="button"
          aria-expanded={isMobileLogbookOpen}
          aria-controls={mobileLogbookPanelId}
          onClick={() => setIsMobileLogbookOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>Flight Logbook</span>
          {isMobileLogbookOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileLogbookPanelId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileLogbookOpen ? 'max-h-[80vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="h-[65vh]">
            <LogbookPanel
              entries={filteredEntries}
              selectedId={selectedId}
              onSelect={handleLogbookSelect}
              filterPhase={filterPhase}
              setFilterPhase={setFilterPhase}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border-4 border-stone-900 shadow-xl overflow-hidden bg-[#f4f1ea]">
        <button
          type="button"
          aria-expanded={isMobileContextOpen}
          aria-controls={mobileContextPanelId}
          onClick={() => setIsMobileContextOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>Mission Details</span>
          {isMobileContextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileContextPanelId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileContextOpen ? 'max-h-[70vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <ContextPanel selectedEntry={selectedEntry} />
        </div>
      </section>

      <section className="rounded-xl border-4 border-stone-900 shadow-2xl overflow-hidden bg-stone-800">
        <button
          type="button"
          aria-expanded={isMobileMapOpen}
          aria-controls={mobileMapPanelId}
          onClick={() => setIsMobileMapOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-stone-900 text-stone-100 font-typewriter text-xs uppercase tracking-[0.4em]"
        >
          <span>Map Overview</span>
          {isMobileMapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div
          id={mobileMapPanelId}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileMapOpen ? 'max-h-[50vh] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="relative h-[320px]">
            <MapPanel
              entries={filteredEntries}
              selectedEntry={selectedEntry}
              onMarkerSelect={handleMarkerSelect}
              shouldCenter={shouldCenterMap}
              resizeSignal={isMobileMapOpen ? 1 : 0}
            />
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-typewriter uppercase tracking-[0.4em] px-3 py-1 rounded-full shadow">
              Drag to Explore
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-900 font-sans">
      <PilotProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">{isDesktop ? desktopLayout : mobileLayout}</div>
    </div>
  );
};

export default App;