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
const CommandDeck = (): JSX.Element => {
  const { score, teams, showLogs, toggleLogs } = useSimulationStore();

  return (
    <div className="p-4 bg-gray-900 text-white h-full flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        {/* SCOREBOARD SECTION */}
        <div className="bg-black p-3 border-2 border-gray-800 rounded shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center text-center">
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate">{teams.home}</span>
            </div>

            {/* Dot Matrix Font Style Score */}
            <div className="bg-gray-950 px-2 py-1 rounded border border-gray-800 font-mono text-2xl text-yellow-500 tabular-nums">
              {score.home}:{score.away}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold truncate">{teams.away}</span>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
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

      {/* METADATA FOOTER */}
      <div className="text-[10px] font-mono text-gray-500 border-t border-gray-800 pt-2">
        LAST_HMR_SYNC: {new Date().toLocaleTimeString()}
        <br />
        SESSION_START: {typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'N/A'}
      </div>
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
