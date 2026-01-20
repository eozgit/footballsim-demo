import type { MatchDetails } from 'footballsim';

import type { SimulationState } from './useSimulationStore';
import { useSimulationStore } from './useSimulationStore';

export class SimulationBridge {
  /**
   * Orchestrates the synchronization between the engine state and the UI store.
   * Refactored to stay below the complexity threshold of 12.
   */
  public static sync(state: MatchDetails): void {
    const store = useSimulationStore.getState();

    this.syncTeamNames(state, store);
    this.syncScoreboard(state, store);
    this.syncLogs(state, store);
  }

  private static syncTeamNames(state: MatchDetails, store: SimulationState): void {
    if (store.teams.home === 'HOME' && state.kickOffTeam?.name) {
      store.setTeams(state.kickOffTeam.name, state.secondTeam?.name || 'AWAY');
    }
  }

  private static syncScoreboard(state: MatchDetails, store: SimulationState): void {
    const homeGoals = state.kickOffTeamStatistics?.goals;

    const awayGoals = state.secondTeamStatistics?.goals;

    if (typeof homeGoals === 'number' && typeof awayGoals === 'number') {
      if (homeGoals !== store.score.home || awayGoals !== store.score.away) {
        store.updateScore(homeGoals, awayGoals);
      }
    }
  }

  private static syncLogs(state: MatchDetails, store: SimulationState): void {
    if (state.iterationLog && state.iterationLog.length > 0) {
      store.appendLogs(state.iterationLog);
    }
  }
}
