// src/components/CommandDeck/Resources.tsx
import { useControls, buttonGroup, folder } from 'leva';
import type { StoreType } from 'leva/dist/declarations/src/types';

export const Resources = ({ store }: { store: StoreType }): null => {
  useControls(
    {
      RESOURCES: folder(
        {
          LINKS: buttonGroup({
            label: '',
            opts: {
              REPO: () =>
                window.open('https://github.com/eozgit/footballsim', '_blank', 'noopener'),
              DEMO: () =>
                window.open('https://github.com/eozgit/footballsim-demo', '_blank', 'noopener'),
              NPM: () =>
                window.open('https://www.npmjs.com/package/footballsim', '_blank', 'noopener'),
              ORIGINAL: () =>
                window.open('https://github.com/GallagherAiden/footballSimulationEngine', '_blank', 'noopener'),
            },
          }),
        },
        { collapsed: true },
      ),
    },
    { store },
  );

  return null;
};
