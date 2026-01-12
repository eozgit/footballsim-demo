import { describe, it, expect } from 'vitest';
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
    const mockMatch = {
      kickOffTeam: { teamID: 1, primaryColour: 'Red', secondaryColour: 'Blue' },
      secondTeam: { teamID: 2, primaryColour: 'Blue', secondaryColour: 'Red' },
    } as any;

    const styles = provider.getStyles(mockMatch);
    expect(styles.get(1)).toEqual({ body: 0xff0000, detail: 0x0000ff });
  });
});
