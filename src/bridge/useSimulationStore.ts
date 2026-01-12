// bridge/useSimulationStore.ts
import { create } from 'zustand';

interface SimulationState {
  isPlaying: boolean;
  logs: string[];
  setPlaying: (playing: boolean) => void;
  appendLogs: (newLogs: string[]) => void;
}

export const useSimulationStore = create<SimulationState>(
  (
    set
  ): {
    isPlaying: false;
    logs: never[];
    setPlaying: (playing: boolean) => void;
    appendLogs: (newLogs: string[]) => void;
  } => ({
    isPlaying: false,
    logs: [],
    setPlaying: (playing: boolean): void => set({ isPlaying: playing }),
    appendLogs: (newLogs: string[]): void =>
      set((state): { logs: string[] } => {
        // Combine logs and keep only the last 200 entries for performance
        const combined = [...state.logs, ...newLogs];
        return { logs: combined.slice(-200) };
      }),
  })
);
