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
});
