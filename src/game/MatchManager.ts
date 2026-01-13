// src/game/MatchManager.ts
import SimWorker from './simulation.worker?worker';
import { MatchDetails, Team } from 'footballsim';
import { SimulationBridge } from '../bridge/SimulationBridge';

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
        this.onUpdateCallback(state);
        SimulationBridge.sync(state);
      }
    };
  }

  public pause(): void {
    this.worker.postMessage({ type: 'PAUSE_MATCH' });
  }

  public resume(): void {
    this.worker.postMessage({ type: 'RESUME_MATCH' });
  }

  public initMatch(teamA: Team, teamB: Team): void {
    this.worker.postMessage({ type: 'INIT_MATCH', data: { teamA, teamB } });
  }

  public terminate(): void {
    this.worker?.terminate();
  }
}
