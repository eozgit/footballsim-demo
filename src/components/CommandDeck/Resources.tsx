// src/components/CommandDeck/Resources.tsx
import { useControls, buttonGroup, folder } from 'leva';
import type { StoreType } from 'leva/dist/declarations/src/types';

export const Resources = ({ store }: { store: StoreType }): null => {
  useControls(
    {
      RESOURCES: folder(
        {
          LINKS: buttonGroup({
            label: '', // Removes the "External" label next to the buttons
            opts: {
              DEMO: (): Window | null =>
                window.open('https://github.com/eozgit/footballsim-demo', '_blank'),
              ENGINE: (): Window | null =>
                window.open('https://github.com/GallagherAiden/footballSimulationEngine', '_blank'),
            },
          }),
        },
        { collapsed: true } // Sets the folder to start closed
      ),
    },
    { store }
  );

  return null;
};
