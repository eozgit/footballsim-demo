// bridge/useSimulationStore.ts
import { create } from 'zustand';
const pitchModules = import.meta.glob('../../public/assets/pitch/*.webp');

export const PITCH_STYLES = Object.keys(pitchModules).map((path): string => {
  const filename = path.split('/').pop() || '';

  return filename.replace('.webp', '');
});
export interface KitStyle {
  body: number;
  detail: number;
  gk: number;
}
interface SimulationState {
  isPlaying: boolean;
  logs: string[];
  showLogs: boolean;
  totalLogsSeen: number;
  score: { home: number; away: number };
  teams: { home: string; away: string };
  setPlaying: (playing: boolean) => void;
  appendLogs: (newLogs: string[]) => void;
  toggleLogs: () => void;
  setTeams: (home: string, away: string) => void;
  updateScore: (home: number, away: number) => void;
  pitchTexture: string;
  setPitchTexture: (texture: string) => void;
  kitStyles: { home: KitStyle | null; away: KitStyle | null };
  setKitStyles: (home: KitStyle, away: KitStyle) => void;
  showPlayerNames: boolean;
  setShowPlayerNames: (show: boolean) => void;
  showIntentLine: boolean;
  setShowIntentLine: (show: boolean) => void;
}
// src/bridge/useSimulationStore.ts
export const useSimulationStore = create<SimulationState>(
  (
    set
  ): {
    isPlaying: true;
    showLogs: true;
    logs: never[];
    totalLogsSeen: number;
    score: { home: number; away: number };
    teams: { home: string; away: string };
    setPlaying: (playing: boolean) => void;
    toggleLogs: () => void;
    setTeams: (home: string, away: string) => void;
    updateScore: (home: number, away: number) => void;
    appendLogs: (newLogs: string[]) => void;
    pitchTexture: string;
    setPitchTexture: (texture: string) => void;
    kitStyles: { home: KitStyle | null; away: KitStyle | null };
    setKitStyles: (home: KitStyle, away: KitStyle) => void;
    showPlayerNames: boolean;
    setShowPlayerNames: (show: boolean) => void;
    showIntentLine: boolean;
    setShowIntentLine: (show: boolean) => void;
  } => ({
    isPlaying: true,
    showLogs: true,
    logs: [],
    totalLogsSeen: 0,
    score: { home: 0, away: 0 },
    teams: { home: 'HOME', away: 'AWAY' },
    pitchTexture: 'default',
    kitStyles: { home: null, away: null },
    showPlayerNames: false,
    showIntentLine: false,
    setShowIntentLine: (show): void => set({ showIntentLine: show }),
    setShowPlayerNames: (show): void => set({ showPlayerNames: show }),
    setPitchTexture: (texture): void => set({ pitchTexture: texture }),
    setPlaying: (playing): void => set({ isPlaying: playing }),
    toggleLogs: (): void => set((state): { showLogs: boolean } => ({ showLogs: !state.showLogs })),
    setTeams: (home, away): void =>
      set(
        (
          state
        ): {
          teams: { home: string; away: string };
          isPlaying: boolean;
          logs: string[];
          showLogs: boolean;
          totalLogsSeen: number;
          score: { home: number; away: number };
          setPlaying: (playing: boolean) => void;
          appendLogs: (newLogs: string[]) => void;
          toggleLogs: () => void;
          setTeams: (home: string, away: string) => void;
          updateScore: (home: number, away: number) => void;
        } => ({ ...state, teams: { home, away } })
      ),
    updateScore: (home, away): void =>
      set(
        (
          state
        ): {
          score: { home: number; away: number };
          isPlaying: boolean;
          logs: string[];
          showLogs: boolean;
          totalLogsSeen: number;
          teams: { home: string; away: string };
          setPlaying: (playing: boolean) => void;
          appendLogs: (newLogs: string[]) => void;
          toggleLogs: () => void;
          setTeams: (home: string, away: string) => void;
          updateScore: (home: number, away: number) => void;
        } => ({ ...state, score: { home, away } })
      ),

    appendLogs: (newLogs): void =>
      set((state): SimulationState => {
        if (!state.showLogs || !newLogs.length) return state;

        const limit = 100;
        const combined = [...state.logs, ...newLogs];

        return {
          ...state, // Critical: keep score/teams intact
          logs: combined.slice(-limit),
          totalLogsSeen: state.totalLogsSeen + newLogs.length,
        };
      }),
    setKitStyles: (home, away): void => set({ kitStyles: { home, away } }),
  })
);
