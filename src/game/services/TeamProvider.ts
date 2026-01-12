// src/game/services/TeamProvider.ts
import { MatchDetails } from 'footballsim';

export interface TeamStyle {
  body: number;
  detail: number;
}

export class TeamProvider {
  private colorCache: Record<string, string>;

  constructor(colorsJson: Record<string, string>) {
    this.colorCache = colorsJson;
  }

  private getHexColor(name: string): number {
    const hex = this.colorCache[name];
    return hex ? parseInt(hex, 16) : 0xffffff;
  }

  /**
   * Resolves the visual styles for both teams based on match state
   */
  public getStyles(state: MatchDetails): Map<number, TeamStyle> {
    const styles = new Map<number, TeamStyle>();

    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      const primary = team.primaryColour || 'White';
      const secondary = team.secondaryColour || 'Black';

      styles.set(team.teamID, {
        body: this.getHexColor(primary),
        detail: this.getHexColor(secondary),
      });
    });

    return styles;
  }
}
