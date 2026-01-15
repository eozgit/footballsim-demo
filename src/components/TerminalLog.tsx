// components/TerminalLog.tsx
import type { JSX } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { useSimulationStore } from '../bridge/useSimulationStore';

export const TerminalLog = (): JSX.Element => {
  const { logs, totalLogsSeen, showLogs } = useSimulationStore();

  if (!showLogs) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-800 font-mono text-xs italic">
        DATA FEED SUSPENDED
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
      <Virtuoso
        style={{ height: '100%' }}
        data={logs}
        followOutput="auto"
        itemContent={(index: number, log: string): JSX.Element => {
          // Calculate true rolling index
          const trueIndex = totalLogsSeen - (logs.length - index);

          return (
            <div
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '11px',
                color: '#a3be8c', // Softer "Sage" green, easier on eyes
                padding: '2px 12px',
                borderBottom: '1px solid #1a1a1a',
                display: 'flex',
                gap: '12px',
                lineHeight: '1.4',
              }}
            >
              <span style={{ color: '#88c0d0', fontWeight: 'bold', minWidth: '45px' }}>
                {trueIndex.toString().padStart(5, '0')}
              </span>
              <span style={{ flex: 1 }}>{log}</span>
            </div>
          );
        }}
      />
    </div>
  );
};
