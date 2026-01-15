import type { JSX} from 'react';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';

import { useSimulationStore } from './bridge/useSimulationStore';
import { EventBus } from './game/EventBus';
import StartGame from './game/main';
import { MatchScene } from './game/scenes/MatchScene';

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame(
  { currentActiveScene },
  ref
): JSX.Element {
  const game = useRef<Phaser.Game | null>(null);

  // 1. Subscribe to the simulation playback state
  const isPlaying = useSimulationStore((state): boolean => state.isPlaying);
  const pitchTexture = useSimulationStore((state): string => state.pitchTexture);

  useEffect((): void => {
    const activeScene = game.current?.scene.getScene('MatchScene') as MatchScene;

    if (activeScene?.updatePitchTexture) {
      activeScene.updatePitchTexture(pitchTexture);
    }
  }, [pitchTexture]);
  // 2. Reactively sync store state to the running Phaser Scene
  useEffect((): void => {
    const activeScene = game.current?.scene.getScene('MatchScene') as MatchScene;

    if (activeScene && typeof activeScene.updateSimulationStatus === 'function') {
      activeScene.updateSimulationStatus(isPlaying);
    }
  }, [isPlaying]);

  useLayoutEffect((): (() => void) => {
    if (game.current === null) {
      game.current = StartGame('game-container');

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: null });
      } else if (ref) {
        ref.current = { game: game.current, scene: null };
      }
    }

    return (): void => {
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, [ref]);

  useEffect((): (() => void) => {
    const onSceneReady = (scene_instance: Phaser.Scene): void => {
      // 3. Ensure new scenes match the current UI state immediately upon entry
      if (scene_instance instanceof MatchScene) {
        scene_instance.updateSimulationStatus(isPlaying);
      }

      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(scene_instance);
      }

      if (typeof ref === 'function') {
        ref({ game: game.current, scene: scene_instance });
      } else if (ref) {
        ref.current = { game: game.current, scene: scene_instance };
      }
    };

    EventBus.on('current-scene-ready', onSceneReady);

    return (): void => {
      EventBus.removeListener('current-scene-ready', onSceneReady);
    };
  }, [currentActiveScene, ref, isPlaying]);

  return <div id="game-container"></div>;
});
