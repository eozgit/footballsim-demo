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

export const App = (): JSX.Element => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const isPlaying = useSimulationStore((state): boolean => state.isPlaying);

  const factory = useCallback(
    (node: FlexLayout.TabNode): React.ReactNode => {
      const component = node.getComponent();

      switch (component) {
        case 'phaser_engine':
          return (
            <div className="phaser-wrapper">
              {/* This puts Phaser specifically in this pane */}
              <PhaserGame ref={phaserRef} />
            </div>
          );
        case 'controls':
          return (
            <div className="p-4 bg-gray-900 text-white h-full">
              <h3 className="text-blue-400 font-mono">
                SYSTEMS: {isPlaying ? 'ACTIVE' : 'STANDBY'}
              </h3>
              <button className="mt-4 p-2 bg-blue-600 rounded">Initialize Match</button>
            </div>
          );
        case 'telemetry':
          return <TerminalLog />;
        default:
          return null;
      }
    },
    [isPlaying]
  );

  return (
    <div className="w-screen h-screen overflow-hidden">
      <FlexLayout.Layout model={model} factory={factory} />
    </div>
  );
};

export default App;
