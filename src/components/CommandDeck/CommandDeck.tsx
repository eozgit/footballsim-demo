import { LevaPanel, useCreateStore } from 'leva';
import type { JSX } from 'react';

import { Resources } from './Resources';
import { Scoreboard } from './Scoreboard';
import { SimulationControls } from './SimulationControls';
import { Status } from './Status';

export const CommandDeck = (): JSX.Element => {
  // 1. Create a store local to this component
  const store = useCreateStore();

  return (
    <div className="p-4 bg-gray-900 text-white h-full flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        <Scoreboard />

        {/* 2. Pass the store to the components so they register there */}
        <SimulationControls store={store} />
        <Resources store={store} />

        {/* 3. Tell the panel to render THAT specific store */}
        <div className="leva-mount border border-gray-800 rounded overflow-hidden">
          <LevaPanel
            store={store}
            fill
            flat
            titleBar={false}
          />
        </div>
      </div>

      <Status />
    </div>
  );
};
