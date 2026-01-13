// src/components/CommandDeck/Status.tsx
import { JSX } from 'react';

declare const __BUILD_TIME__: string;

export const Status = (): JSX.Element => {
  return (
    <div className="text-[10px] font-mono text-gray-500 border-t border-gray-800 pt-2">
      LAST_HMR_SYNC: {new Date().toLocaleTimeString()}
      <br />
      SESSION_START: {typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'N/A'}
    </div>
  );
};
