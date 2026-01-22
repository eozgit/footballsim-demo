import { useControls, folder, button } from 'leva';
import type { StoreType } from 'leva/dist/declarations/src/types';
import { useState, useEffect } from 'react';

import { PITCH_STYLES, useSimulationStore } from '../../bridge/useSimulationStore';
interface TeamListItem {
  file: string;
  name: string;
  description: string;
}
export const SimulationControls = ({ store }: { store: StoreType }): null => {
  const {
    isPlaying,
    setPlaying,
    showLogs,
    toggleLogs,
    pitchTexture,
    setPitchTexture,
    showPlayerNames,
    setShowPlayerNames,
    showIntentLine,
    setShowIntentLine,
    homeTeam,
    setHomeTeam,
    awayTeam,
    setAwayTeam,
  } = useSimulationStore();

  const [teamOptions, setTeamOptions] = useState<Record<string, string>>({});

  // Fetch the teams list on mount
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/teams/list.json`)
      .then((res) => res.json())
      .then((data: { teams: TeamListItem[] }) => {
        // Map to { [DisplayName]: "filename" } for Leva options
        const options = data.teams.reduce(
          (acc, team) => {
            acc[team.name] = team.file;

            return acc;
          },
          {} as Record<string, string>,
        );

        setTeamOptions(options);
      })
      .catch((err) => console.error('Failed to load teams list:', err));
  }, []);
  useControls(
    {
      SIMULATION: folder({
        // Team Selection
        'HOME TEAM': {
          value: homeTeam,
          options: teamOptions,
          label: 'HOME',
          onChange: (v: string) => {
            if (v && v !== useSimulationStore.getState().homeTeam) {
              setHomeTeam(v);
              window.dispatchEvent(new CustomEvent('reload-simulation'));
            }
          },
        },
        'AWAY TEAM': {
          value: awayTeam,
          options: teamOptions,
          label: 'AWAY',
          onChange: (v: string) => {
            if (v && v !== useSimulationStore.getState().awayTeam) {
              setAwayTeam(v);
              window.dispatchEvent(new CustomEvent('reload-simulation'));
            }
          },
        },
        RUNNING: {
          value: isPlaying,
          label: 'ACTIVE',
          onChange: (v: boolean): void => {
            if (v !== useSimulationStore.getState().isPlaying) {
              setPlaying(v);
            }
          },
        },
        DUMP_LOGS: {
          value: showLogs,
          label: 'TELEMETRY',
          onChange: (v): void => {
            if (v !== useSimulationStore.getState().showLogs) {
              toggleLogs();
            }
          },
        },
        PITCH_STYLE: {
          value: pitchTexture,
          options: PITCH_STYLES,
          label: 'SURFACE',
          onChange: (v: string): void => setPitchTexture(v),
        },
        PLAYER_NAMES: {
          value: showPlayerNames,
          label: 'SHOW NAMES',
          onChange: (v: boolean): void => setShowPlayerNames(v),
        },
        INTENT_MARKERS: {
          value: showIntentLine,
          label: 'SHOW INTENT',
          onChange: (v: boolean): void => setShowIntentLine(v),
        },
      }),
      // NEW KITS FOLDER
      KITS: folder({
        'HOME KIT': button((): void => {
          window.dispatchEvent(new CustomEvent('reroll-home'));
        }),
        'AWAY KIT': button((): void => {
          window.dispatchEvent(new CustomEvent('reroll-away'));
        }),
      }),
    },
    { store },
    [isPlaying, showLogs, teamOptions, homeTeam, awayTeam],
  );

  return null;
};
