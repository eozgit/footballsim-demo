import { useControls, folder } from 'leva';
import { useSimulationStore } from '../../bridge/useSimulationStore';
import { StoreType } from 'leva/dist/declarations/src/types';

// Accept store as a prop
export const SimulationControls = ({ store }: { store: StoreType }): null => {
  // Extract playback state and setter alongside telemetry state
  const { isPlaying, setPlaying, showLogs, toggleLogs, pitchTexture, setPitchTexture } =
    useSimulationStore();

  useControls(
    {
      SIMULATION: folder({
        // 1. Playback control (mapped to isPlaying in Zustand)
        RUNNING: {
          value: isPlaying,
          label: 'ACTIVE',
          onChange: (v: boolean): void => {
            // Prevent redundant updates if state is already in sync
            if (v !== useSimulationStore.getState().isPlaying) {
              setPlaying(v);
            }
          },
        },
        // 2. Telemetry control
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
          options: ['default', 'checkered', 'crater', 'grass', 'snow', 'wear'],
          label: 'SURFACE',
          onChange: (v: string): void => setPitchTexture(v),
        },
      }),
    },
    { store },
    [isPlaying, showLogs] // Added isPlaying to the dependency array to keep the UI in sync
  );

  return null;
};
