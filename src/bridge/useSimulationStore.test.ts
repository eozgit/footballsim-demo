import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from './useSimulationStore';

describe('useSimulationStore', () => {
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
  it('should not append logs if showLogs is false', () => {
    useSimulationStore.setState({ showLogs: false });
    useSimulationStore.getState().appendLogs(['Test Log']);
    expect(useSimulationStore.getState().logs).toHaveLength(0);
  });

  it('should not append logs if input array is empty', () => {
    useSimulationStore.getState().appendLogs([]);
    expect(useSimulationStore.getState().totalLogsSeen).toBe(0);
  });
  it('should toggle logs visibility', () => {
    const initial = useSimulationStore.getState().showLogs;
    useSimulationStore.getState().toggleLogs();
    expect(useSimulationStore.getState().showLogs).toBe(!initial);
  });

  it('should update playing state', () => {
    useSimulationStore.getState().setPlaying(true);
    expect(useSimulationStore.getState().isPlaying).toBe(true);
  });
});
