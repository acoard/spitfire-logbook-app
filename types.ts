export enum Phase {
  TRAINING = 'Training',
  COMBAT = 'Combat Operations',
  FERRY = 'Post-War Ferry',
}

export enum AircraftCategory {
  TRAINING = 'Training', // Yellow
  FIGHTER = 'Fighter',   // Red
  TRANSPORT = 'Transport' // Blue
}

export interface Coordinate {
  lat: number;
  lng: number;
  name: string;
}

export interface LogEntry {
  id: string;
  date: string;
  phase: Phase;
  aircraftType: string;
  aircraftCategory: AircraftCategory;
  duty: string;
  time: string; // e.g., "1:15"
  remarks: string;
  origin: Coordinate;
  destination?: Coordinate; // Optional, some flights are local/patrols
  isSignificant: boolean; // For special highlighting
  historicalNote?: string; // Enhanced static historical context
  handwrittenNoteImg?: string;
  handwrittenNoteImgs?: string[];
  handwrittenNoteTranscription?: string;
}
