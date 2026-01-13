import { useSimulationStore } from '../../bridge/useSimulationStore';
import { JSX } from 'react';

export const Scoreboard = (): JSX.Element => {
  const { score, teams } = useSimulationStore();

  return (
    <div className="bg-black p-3 border-2 border-gray-800 rounded shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
      </div>
      <div className="grid grid-cols-3 gap-2 items-center text-center">
        <div className="flex flex-col">
          <span className="text-xs font-bold truncate">{teams.home}</span>
        </div>
        <div className="bg-gray-950 px-2 py-1 rounded border border-gray-800 font-mono text-2xl text-yellow-500 tabular-nums">
          {score.home}:{score.away}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold truncate">{teams.away}</span>
        </div>
      </div>
    </div>
  );
};
