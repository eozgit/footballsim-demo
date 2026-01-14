import { useControls, folder, button } from 'leva';
import { PITCH_STYLES, useSimulationStore } from '../../bridge/useSimulationStore';
import { StoreType } from 'leva/dist/declarations/src/types';

export const SimulationControls = ({ store }: { store: StoreType }): null => {
  const { isPlaying, setPlaying, showLogs, toggleLogs, pitchTexture, setPitchTexture } =
    useSimulationStore();

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
      }),
      // NEW KITS FOLDER
      KITS: folder({
        'RANDOMIZE KITS': button((): void => {
          // This logic can be moved to a helper or the store action
          // It assumes TeamProvider logic is accessible or simply triggers
          // a signal that the FieldEntityManager picks up to re-roll.

          // For now, we can use a window event or a simple store flag
          // to tell the FieldEntityManager: "Next sync, re-roll the kits"
          window.dispatchEvent(new CustomEvent('reroll-kits'));
        }),
      }),
    },
    { store },
    [isPlaying, showLogs]
  );

  return null;
};
