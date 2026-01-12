import { describe, it, expect, vi } from 'vitest';
import { SimulationBridge } from './SimulationBridge';
import { useSimulationStore } from './useSimulationStore';

describe('SimulationBridge', () => {
  it('should sync engine state to the store', () => {
    const mockState = {
      kickOffTeam: { name: 'Galatasaray' },
      secondTeam: { name: 'Legends' },
      kickOffTeamStatistics: { goals: 3 },
      secondTeamStatistics: { goals: 2 },
      iterationLog: ['Goal scored!'],
    } as any;

    SimulationBridge.sync(mockState);

    const store = useSimulationStore.getState();
    expect(store.teams.home).toBe('Galatasaray');
    expect(store.score).toEqual({ home: 3, away: 2 });
    expect(store.logs).toContain('Goal scored!');
  });
  it('should handle partial state updates without crashing', () => {
    // Test with missing statistics or logs
    const partialState = {
      kickOffTeam: { name: 'Solo Team' },
      // Missing stats and logs
    } as any;

    expect(() => SimulationBridge.sync(partialState)).not.toThrow();
    expect(useSimulationStore.getState().teams.home).toBe('Solo Team');
  });
});
