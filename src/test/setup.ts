import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
