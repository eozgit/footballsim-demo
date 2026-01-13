import { JSX } from 'react';
import { useSimulationStore } from '../../bridge/useSimulationStore';
import { Scoreboard } from './Scoreboard';

declare const __BUILD_TIME__: string;

export const CommandDeck = (): JSX.Element => {
  const { showLogs, toggleLogs } = useSimulationStore();

  return (
    <div className="p-4 bg-gray-900 text-white h-full flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        <Scoreboard />

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

      <div className="text-[10px] font-mono text-gray-500 border-t border-gray-800 pt-2">
        LAST_HMR_SYNC: {new Date().toLocaleTimeString()}
        <br />
        SESSION_START: {typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'N/A'}
      </div>
    </div>
  );
};
