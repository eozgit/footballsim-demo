import SimWorker from './simulation.worker?worker';
import { useSimulationStore } from '../bridge/useSimulationStore';
import { MatchDetails, Team } from 'footballsim';

export class MatchManager {
  private worker: Worker;
  private onUpdateCallback: (state: MatchDetails) => void;

  constructor(onUpdate: (state: MatchDetails) => void) {
    this.worker = new SimWorker();
    this.onUpdateCallback = onUpdate;
    this.setupWorkerListener();
  }

  private setupWorkerListener(): void {
    this.worker.onmessage = (e: MessageEvent): void => {
      const { type, state } = e.data as { type: string; state: MatchDetails };

      if (type === 'STATE_UPDATED' && state) {
        // 1. Tell Phaser to move the ball and players
        this.onUpdateCallback(state);

        // 2. Sync the React UI (Store)
        const store = useSimulationStore.getState();

        // Sync Names
        if (store.teams.home === 'HOME' && state.kickOffTeam?.name) {
          store.setTeams(state.kickOffTeam.name, state.secondTeam?.name || 'AWAY');
        }

        // Sync Score
        if (
          state.kickOffTeamStatistics.goals !== store.score.home ||
          state.secondTeamStatistics.goals !== store.score.away
        ) {
          store.updateScore(state.kickOffTeamStatistics.goals, state.secondTeamStatistics.goals);
        }

        // Sync Logs
        if (state.iterationLog && state.iterationLog.length > 0) {
          store.appendLogs(state.iterationLog);
        }
      }
    };
  }

  public initMatch(teamA: Team, teamB: Team): void {
    this.worker.postMessage({ type: 'INIT_MATCH', data: { teamA, teamB } });
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      console.log('Worker terminated successfully.');
    }
  }
}
