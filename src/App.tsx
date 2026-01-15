import * as FlexLayout from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import type { JSX} from 'react';
import React, { useCallback, useRef } from 'react';

import { CommandDeck } from './components/CommandDeck/CommandDeck';
import { TerminalLog } from './components/TerminalLog'; // adjust path as needed
import type { IRefPhaserGame} from './PhaserGame';
import { PhaserGame } from './PhaserGame';

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

  const factory = useCallback((node: FlexLayout.TabNode): React.ReactNode => {
    const component = node.getComponent();

    switch (component) {
      case 'phaser_engine':
        return (
          <div className="phaser-wrapper">
            <PhaserGame ref={phaserRef} />
          </div>
        );
      case 'controls':
        return <CommandDeck />; // Modularized
      case 'telemetry':
        return <TerminalLog />;
      default:
        return null;
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <FlexLayout.Layout model={model} factory={factory} />
    </div>
  );
};

export default App;
