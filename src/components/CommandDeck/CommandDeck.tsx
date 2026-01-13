import { JSX } from 'react';
import { Scoreboard } from './Scoreboard';
import { SimulationControls } from './SimulationControls';
import { Status } from './Status';

export const CommandDeck = (): JSX.Element => {
  return (
    <div className="p-4 bg-gray-900 text-white h-full flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        <Scoreboard />

        <SimulationControls />
      </div>

      <Status />
    </div>
  );
};
