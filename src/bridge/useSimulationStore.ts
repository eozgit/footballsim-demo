import { create } from 'zustand';

interface SimulationState {
  isPlaying: boolean;
  setPlaying: (playing: boolean) => void;
}

export const useSimulationStore = create<SimulationState>(
  (set): { isPlaying: false; setPlaying: (playing: boolean) => void } => ({
    isPlaying: false,
    setPlaying: (playing: boolean): void => set({ isPlaying: playing }),
  })
);
