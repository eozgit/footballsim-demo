// bridge/useSimulationStore.ts
import { create } from 'zustand';

interface SimulationState {
  isPlaying: boolean;
  logs: string[];
  showLogs: boolean;
  totalLogsSeen: number;
  setPlaying: (playing: boolean) => void;
  appendLogs: (newLogs: string[]) => void;
  toggleLogs: () => void;
}

export const useSimulationStore = create<SimulationState>(
  (
    set
  ): {
    isPlaying: false;
    showLogs: true;
    logs: never[];
    totalLogsSeen: number;
    setPlaying: (playing: boolean) => void;
    toggleLogs: () => void;
    appendLogs: (newLogs: string[]) => void;
  } => ({
    isPlaying: false,
    showLogs: true,
    logs: [],
    totalLogsSeen: 0,
    setPlaying: (playing: boolean): void => set({ isPlaying: playing }),
    toggleLogs: (): void => set((state): { showLogs: boolean } => ({ showLogs: !state.showLogs })),
    appendLogs: (newLogs: string[]): void =>
      set((state): SimulationState | { logs: string[]; totalLogsSeen: number } => {
        // 🔥 CRITICAL: If logs are disabled, we exit immediately
        if (!state.showLogs) return state;

        const limit = 100;
        const combined = [...state.logs, ...newLogs];

        return {
          logs: combined.slice(-limit),
          totalLogsSeen: state.totalLogsSeen + newLogs.length,
        };
      }),
  })
);
