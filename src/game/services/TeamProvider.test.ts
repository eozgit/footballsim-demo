import { describe, it, expect, vi } from 'vitest';
import { TeamProvider } from './TeamProvider';

describe('TeamProvider', () => {
  const mockColors = { Red: 'ff0000', Blue: '0000ff' };
  const provider = new TeamProvider(mockColors);

  it('should resolve hex strings to numbers', () => {
    // @ts-ignore - accessing private for test or change to public
    const color = provider['getHexColor']('Red');
    expect(color).toBe(0xff0000);
  });

  it('should return white for unknown colors', () => {
    const color = provider['getHexColor']('GhostColor');
    expect(color).toBe(0xffffff);
  });

  it('should generate correct TeamStyles from MatchDetails', () => {
    // Force Math.random to return 0 so the first item in the pool (Primary) is always picked
    const randomMock = vi.spyOn(Math, 'random').mockReturnValue(0);

    const mockMatch = {
      kickOffTeam: { teamID: 1, primaryColour: 'Red', secondaryColour: 'Blue' },
      secondTeam: { teamID: 2, primaryColour: 'Blue', secondaryColour: 'Red' },
    } as any;

    const styles = provider.getStyles(mockMatch);

    // With random mocked to 0, it should be 100% predictable
    expect(styles.get(1)).toEqual({ body: 0xff0000, detail: 0x0000ff });

    randomMock.mockRestore(); // Clean up
  });

  it('should fallback to White and Black if colors are missing from state', () => {
    // Also mock here for consistency
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const minimalistMatch = {
      kickOffTeam: { teamID: 1 },
      secondTeam: { teamID: 2 },
    } as any;

    const styles = provider.getStyles(minimalistMatch);
    expect(styles.get(1)).toEqual({ body: 0xffffff, detail: 0xffffff });

    vi.restoreAllMocks();
  });
});
