// src/components/CommandDeck/Status.tsx
import type { JSX } from 'react';

declare const BUILD_TIME: string;

export const Status = (): JSX.Element => {
  return (
    <div className="text-[10px] font-mono text-gray-500 border-t border-gray-800 pt-2">
      LAST_HMR_SYNC: {new Date().toLocaleTimeString()}
      <br />
      SESSION_START: {typeof BUILD_TIME !== 'undefined' ? BUILD_TIME : 'N/A'}
    </div>
  );
};
