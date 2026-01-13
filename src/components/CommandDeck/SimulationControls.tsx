import { useControls, folder } from 'leva';
import { useSimulationStore } from '../../bridge/useSimulationStore';
import { StoreType } from 'leva/dist/declarations/src/types';

// Accept store as a prop
export const SimulationControls = ({ store }: { store: StoreType }): null => {
  const { showLogs, toggleLogs } = useSimulationStore();

  useControls(
    {
      SIMULATION: folder({
        DUMP_LOGS: {
          value: showLogs,
          label: 'TELEMETRY',
          onChange: (v): void => {
            if (v !== useSimulationStore.getState().showLogs) toggleLogs();
          },
        },
      }),
    },
    { store },
    [showLogs]
  ); // <--- Link to the local store

  return null;
};
