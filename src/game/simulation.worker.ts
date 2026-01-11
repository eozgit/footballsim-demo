/* global self */
import { initiateGame, MatchDetails, playIteration, Team } from 'footballsim';

// We keep the matchState in the worker's scope
let matchState: MatchDetails;

self.onmessage = async (e: MessageEvent): Promise<void> => {
  const { type, data } = e.data as { type: string; data: unknown };

  switch (type) {
    case 'INIT_MATCH': {
      // data contains { teamA, teamB } from your JSON files
      const pitchDetails = { pitchHeight: 1050, pitchWidth: 680, goalWidth: 90 };
      const { teamA, teamB } = data as { teamA: Team; teamB: Team };
      matchState = await initiateGame(teamA, teamB, pitchDetails);
      console.log('INIT!!!', matchState);
      self.postMessage({ type: 'MATCH_INITIALIZED', state: matchState });
      break;
    }
    case 'PLAY_TICK':
      if (matchState) {
        // Returns the next state based on the current one
        matchState = await playIteration(matchState);
        self.postMessage({ type: 'STATE_UPDATED', state: matchState });
      }
      break;

    default:
      console.warn(`Unknown worker command: ${type}`);
  }
};
