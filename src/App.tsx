import React, { JSX, useCallback, useRef } from 'react';
import * as FlexLayout from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import { PhaserGame, IRefPhaserGame } from './PhaserGame';
import { useSimulationStore } from './bridge/useSimulationStore';
import { TerminalLog } from './components/TerminalLog'; // adjust path as needed

const layoutConfig: FlexLayout.IJsonModel = {
  global: { tabEnableClose: false, tabSetTabLocation: 'top' },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'column',
        weight: 75,
        children: [
          {
            type: 'tabset',
            weight: 70,
            children: [{ type: 'tab', name: 'Simulation Engine', component: 'phaser_engine' }],
          },
          {
            type: 'tabset',
            weight: 30,
            children: [{ type: 'tab', name: 'Live Telemetry', component: 'telemetry' }],
          },
        ],
      },
      {
        type: 'tabset',
        weight: 25,
        children: [{ type: 'tab', name: 'Command Deck', component: 'controls' }],
      },
    ],
  },
};

const model = FlexLayout.Model.fromJson(layoutConfig);
// App.tsx
const CommandDeck = (): JSX.Element => {
  const isPlaying = useSimulationStore((state): boolean => state.isPlaying);
  const showLogs = useSimulationStore((state): boolean => state.showLogs);
  const toggleLogs = useSimulationStore((state): (() => void) => state.toggleLogs);

  return (
    <div className="p-4 bg-gray-900 text-white h-full flex flex-col gap-2">
      <h3 className="text-blue-400 font-mono text-sm border-b border-gray-700 pb-2">
        CORE_SYSTEMS: {isPlaying ? 'RUNNING' : 'IDLE'}
      </h3>
      <button className="mt-2 p-2 bg-blue-700 hover:bg-blue-600 rounded text-sm font-bold transition-colors">
        INITIALIZE MATCH
      </button>
      <button
        onClick={toggleLogs}
        className={`p-2 w-full text-xs font-mono rounded transition-all ${
          showLogs
            ? 'bg-red-950 text-red-400 border border-red-900 hover:bg-red-900'
            : 'bg-green-950 text-green-400 border border-green-900 hover:bg-green-900'
        }`}
      >
        {showLogs ? 'TERMINATE_DUMP' : 'RESUME_DUMP'}
      </button>
    </div>
  );
};
export const App = (): JSX.Element => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  const factory = useCallback(
    (node: FlexLayout.TabNode): React.ReactNode => {
      const component = node.getComponent();

      switch (component) {
        case 'phaser_engine':
          return (
            <div className="phaser-wrapper">
              <PhaserGame ref={phaserRef} />
            </div>
          );
        case 'controls':
          return <CommandDeck />; // Use the component here
        case 'telemetry':
          return <TerminalLog />;
        default:
          return null;
      }
    },
    [] // isPlaying no longer needed here as CommandDeck handles it
  );

  return (
    <div className="w-screen h-screen overflow-hidden">
      <FlexLayout.Layout model={model} factory={factory} />
    </div>
  );
};

export default App;
