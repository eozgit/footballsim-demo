import { useControls, folder, button } from 'leva';
import { PITCH_STYLES, useSimulationStore } from '../../bridge/useSimulationStore';
import { StoreType } from 'leva/dist/declarations/src/types';

export const SimulationControls = ({ store }: { store: StoreType }): null => {
  const {
    isPlaying,
    setPlaying,
    showLogs,
    toggleLogs,
    pitchTexture,
    setPitchTexture,
    showPlayerNames,
    setShowPlayerNames,
  } = useSimulationStore();

  useControls(
    {
      SIMULATION: folder({
        RUNNING: {
          value: isPlaying,
          label: 'ACTIVE',
          onChange: (v: boolean): void => {
            if (v !== useSimulationStore.getState().isPlaying) {
              setPlaying(v);
            }
          },
        },
        DUMP_LOGS: {
          value: showLogs,
          label: 'TELEMETRY',
          onChange: (v): void => {
            if (v !== useSimulationStore.getState().showLogs) {
              toggleLogs();
            }
          },
        },
        PITCH_STYLE: {
          value: pitchTexture,
          options: PITCH_STYLES,
          label: 'SURFACE',
          onChange: (v: string): void => setPitchTexture(v),
        },
        PLAYER_NAMES: {
          value: showPlayerNames,
          label: 'SHOW NAMES',
          onChange: (v: boolean): void => setShowPlayerNames(v),
        },
      }),
      // NEW KITS FOLDER
      KITS: folder({
        'HOME KIT': button((): void => {
          window.dispatchEvent(new CustomEvent('reroll-home'));
        }),
        'AWAY KIT': button((): void => {
          window.dispatchEvent(new CustomEvent('reroll-away'));
        }),
      }),
    },
    { store },
    [isPlaying, showLogs]
  );

  return null;
};
