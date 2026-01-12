import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from './useSimulationStore';

describe('useSimulationStore', () => {
  // Reset store before each test
  beforeEach(() => {
    const { getState } = useSimulationStore;
    // Note: If you add a reset function to your store, use it here.
    // Otherwise, we manually reset to default values.
    useSimulationStore.setState({
      logs: [],
      score: { home: 0, away: 0 },
      teams: { home: 'HOME', away: 'AWAY' },
    });
  });

  it('should update score correctly', () => {
    useSimulationStore.getState().updateScore(2, 1);
    expect(useSimulationStore.getState().score).toEqual({ home: 2, away: 1 });
  });

  it('should cap logs at 100 entries', () => {
    const manyLogs = Array.from({ length: 150 }, (_, i) => `Log ${i}`);
    useSimulationStore.getState().appendLogs(manyLogs);

    const finalLogs = useSimulationStore.getState().logs;
    expect(finalLogs.length).toBe(100);
    expect(finalLogs[99]).toBe('Log 149'); // Should keep the latest ones
  });
});
