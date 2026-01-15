import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

import { useSimulationStore } from '../bridge/useSimulationStore';

beforeEach(() => {
  // Reset Vitest mocks
  vi.clearAllMocks();

  // Reset the Zustand store to its initial state
  useSimulationStore.setState({
    isPlaying: false, // Changed from isPaused
    showLogs: true,
    logs: [],
    totalLogsSeen: 0, // Added to prevent carry-over
    score: { home: 0, away: 0 },
    teams: { home: 'HOME', away: 'AWAY' },
  });
});
// Mock Phaser since it requires a Canvas which JSDOM doesn't fully support
vi.mock('phaser', () => ({
  default: {
    Events: { EventEmitter: vi.fn(() => ({ on: vi.fn(), emit: vi.fn() })) },
    Scene: class {},
    Game: class {
      destroy = vi.fn();
    },
    AUTO: 0,
    Canvas: 1,
  },
  Scene: class {},
  Game: class {
    destroy = vi.fn();
  },
  Events: { EventEmitter: vi.fn(() => ({ on: vi.fn(), emit: vi.fn(), removeListener: vi.fn() })) },
}));

// Mocking the worker import for Vite
vi.mock('../game/simulation.worker?worker', () => {
  return {
    default: class {
      onmessage = vi.fn();
      postMessage = vi.fn();
      terminate = vi.fn();
    },
  };
});
