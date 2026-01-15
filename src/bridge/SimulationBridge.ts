import type { MatchDetails } from 'footballsim';

import { useSimulationStore } from './useSimulationStore';

export class SimulationBridge {
  public static sync(state: MatchDetails): void {
    const store = useSimulationStore.getState();

    // 1. Sync Team Names
    if (store.teams.home === 'HOME' && state.kickOffTeam?.name) {
      store.setTeams(state.kickOffTeam.name, state.secondTeam?.name || 'AWAY');
    }

    // 2. Sync Scoreboard (Safe Navigation)
    const homeGoals = state.kickOffTeamStatistics?.goals;
    const awayGoals = state.secondTeamStatistics?.goals;

    if (typeof homeGoals === 'number' && typeof awayGoals === 'number') {
      if (homeGoals !== store.score.home || awayGoals !== store.score.away) {
        store.updateScore(homeGoals, awayGoals);
      }
    }

    // 3. Sync Match Logs
    if (state.iterationLog && state.iterationLog.length > 0) {
      store.appendLogs(state.iterationLog);
    }
  }
}
