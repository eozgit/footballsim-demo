// src/components/CommandDeck/SimulationControls.tsx
import { JSX } from 'react';
import { useSimulationStore } from '../../bridge/useSimulationStore';

export const SimulationControls = (): JSX.Element => {
  const { showLogs, toggleLogs } = useSimulationStore();

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={toggleLogs}
        className={`p-2 w-full text-xs font-mono rounded transition-all border ${
          showLogs
            ? 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900'
            : 'bg-green-950 text-green-400 border-green-900 hover:bg-green-900'
        }`}
      >
        {showLogs ? 'TERMINATE_DUMP' : 'RESUME_DUMP'}
      </button>
    </div>
  );
};
