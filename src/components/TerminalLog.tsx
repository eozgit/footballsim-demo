import { Virtuoso } from 'react-virtuoso';
import { useSimulationStore } from '../bridge/useSimulationStore';
import { JSX } from 'react';

export const TerminalLog = (): JSX.Element => {
  const logs = useSimulationStore((state): string[] => state.logs);

  return (
    <div style={{ height: '100%', width: '100%', background: 'black' }}>
      <Virtuoso
        style={{ height: '100%' }} // Virtuoso MUST have an explicit height
        data={logs}
        followOutput="auto"
        itemContent={(index, log): JSX.Element => (
          <div className="p-1 font-mono text-xs text-green-500 border-b border-gray-900">
            <span className="opacity-50">[{index}]</span> {log}
          </div>
        )}
      />
    </div>
  );
};
