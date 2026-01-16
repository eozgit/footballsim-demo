/* global self */
import type { MatchDetails, Team } from 'footballsim';
import { initiateGame, playIteration } from 'footballsim';

let matchState: MatchDetails;
let isRunning = false;

// --- CONFIGURATION ---
const THROTTLE_MS = 100; // Aim for 10 iterations per second

const runSimulation = (): void => {
  if (!isRunning || !matchState) return;

  const startTime = performance.now();

  // 1. Execute Logic
  matchState = playIteration(matchState);

  const endTime = performance.now();
  const logicDuration = endTime - startTime;

  // 2. Report State + Monitoring Data
  self.postMessage({
    type: 'STATE_UPDATED',
    state: matchState,
    monitor: {
      logicDuration: logicDuration.toFixed(2), // How long the math took
      idleTarget: THROTTLE_MS,
    },
  });

  // 3. Schedule next run based on throttle
  // We use setTimeout to ensure we don't stack calls if math gets heavy
  setTimeout(runSimulation, THROTTLE_MS);
};

self.onmessage = (e: MessageEvent): void => {
  const { type, data } = e.data as { type: string; data: unknown };

  switch (type) {
    case 'INIT_MATCH': {
      const pitchDetails = { pitchHeight: 1050, pitchWidth: 680, goalWidth: 90 };
      const { teamA, teamB } = data as { teamA: Team; teamB: Team };

      matchState = initiateGame(teamA, teamB, pitchDetails);
      isRunning = true;

      self.postMessage({ type: 'MATCH_INITIALIZED', state: matchState });

      // Kick off the independent loop
      runSimulation();
      break;
    }

    case 'PAUSE_MATCH':
      isRunning = false;
      break;

    case 'RESUME_MATCH':
      if (!isRunning) {
        isRunning = true;
        runSimulation();
      }

      break;

    default:
      console.warn(`Unknown worker command: ${type}`);
  }
};
