// src/bridge/SimulationManager.tsx
import { useEffect } from 'react';

import { useSimulationStore } from './useSimulationStore';

// Assuming your worker instance is created elsewhere or globally
// import { worker } from '../workers/worker-instance';

export const SimulationManager = ({ worker }: { worker: Worker }): null => {
  const isPlaying = useSimulationStore((state): boolean => state.isPlaying);

  useEffect((): void => {
    // This is the bridge between the Checkbox and the Worker thread
    if (isPlaying) {
      worker.postMessage({ type: 'RESUME_MATCH' });
    } else {
      worker.postMessage({ type: 'PAUSE_MATCH' });
    }
  }, [isPlaying, worker]);

  return null; // This component has no UI, it's just a logic "daemon"
};
