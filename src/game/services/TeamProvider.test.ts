import type { MatchDetails } from 'footballsim';
import { describe, it, expect, vi } from 'vitest';

import { TeamProvider } from './TeamProvider';

describe('TeamProvider', () => {
  const mockColors = { Red: 'ff0000', Blue: '0000ff' };

  const provider = new TeamProvider(mockColors);

  it('should resolve hex strings to numbers', () => {
    const color = provider['getHexColor']('Red');

    expect(color).toBe(0xff0000);
  });

  it('should return white for unknown colors', () => {
    const color = provider['getHexColor']('GhostColor');

    expect(color).toBe(0xffffff);
  });

  it('should generate correct TeamStyles from MatchDetails', () => {
    // Force Math.random to return 0
    // This affects color picking AND GK selection (picks first GK color: 0x00ff00)
    const randomMock = vi.spyOn(provider as any, 'getSecureRandom').mockReturnValue(0);

    const mockMatch = {
      kickOffTeam: { teamID: 1, primaryColour: 'Red', secondaryColour: 'Blue' },
      secondTeam: { teamID: 2, primaryColour: 'Blue', secondaryColour: 'Red' },
    } as MatchDetails;

    const styles = provider.getStyles(mockMatch);

    // Update expected object to include 'gk'
    expect(styles.get(1)).toEqual({
      body: 0xff0000,
      detail: 0x0000ff,
      gk: 0x00ff00,
    });

    randomMock.mockRestore();
  });

  it('should fallback to White and Black if colors are missing from state', () => {
    vi.spyOn(provider as any, 'getSecureRandom').mockReturnValue(0);

    const minimalistMatch = {
      kickOffTeam: { teamID: 1 },
      secondTeam: { teamID: 2 },
    } as MatchDetails;

    const styles = provider.getStyles(minimalistMatch);

    // Update expected object to include 'gk'
    expect(styles.get(1)).toEqual({
      body: 0xffffff,
      detail: 0xffffff,
      gk: 0x00ff00,
    });

    vi.restoreAllMocks();
  });
});
