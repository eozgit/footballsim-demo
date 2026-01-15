// src/game/services/TeamProvider.ts
import type { MatchDetails, Team } from 'footballsim';

export interface TeamStyle {
  body: number;
  detail: number;
  gk: number;
}

export class TeamProvider {
  private colorCache: Record<string, string>;
  private GK_COLORS = [0x00ff00, 0xffff00, 0xffa500, 0xff00ff, 0x00ffff, 0xe6ff00];
  constructor(colorsJson: Record<string, string>) {
    this.colorCache = colorsJson;
  }

  private getHexColor(name: string): number {
    const hex = this.colorCache[name];

    return hex ? parseInt(hex, 16) : 0xffffff;
  }

  /**
   * Generates a randomized kit pair for both teams.
   * Can be called at any time to "re-roll" the current kit colors.
   */
  public generateKitPair(state: MatchDetails): { home: TeamStyle; away: TeamStyle } {
    const home = this.calculateTeamStyle(state.kickOffTeam);
    const away = this.calculateTeamStyle(state.secondTeam);

    // Ensure GKs don't clash (simplified)
    away.gk =
      away.gk === home.gk
        ? this.GK_COLORS[(this.GK_COLORS.indexOf(away.gk) + 1) % this.GK_COLORS.length]
        : away.gk;

    return { home, away };
  }

  /**
   * Logic to pick primary and secondary colors based on weighted probability.
   */
  private calculateTeamStyle(team: Team): TeamStyle {
    let pool = [
      { name: team.primaryColour, weight: 5 },
      { name: team.secondaryColour, weight: 4 },
      { name: team.awayColour, weight: 1 },
    ].filter((c): c is { name: string; weight: number } => !!c.name);

    if (pool.length === 0) {
      pool = [{ name: 'White', weight: 1 }];
    }

    const pickFromPool = (currentPool: typeof pool): { name: string; weight: number } => {
      const totalWeight = currentPool.reduce((sum, item): number => sum + item.weight, 0);
      let random = Math.random() * totalWeight;

      for (const item of currentPool) {
        if (random < item.weight) return item;
        random -= item.weight;
      }

      return currentPool[0];
    };

    const first = pickFromPool(pool);
    const remainingPool = pool.filter((c): boolean => c.name !== first.name);

    let secondName: string;

    if (remainingPool.length > 0) {
      secondName = pickFromPool(remainingPool).name;
    } else {
      const firstName = first?.name || 'White';

      secondName = firstName.toLowerCase() === 'white' ? 'Black' : 'White';
    }

    return {
      body: this.getHexColor(first.name),
      detail: this.getHexColor(secondName),
      gk: this.GK_COLORS[Math.floor(Math.random() * this.GK_COLORS.length)],
    };
  }

  /**
   * Maintained for compatibility with existing logic while using new internal methods.
   */
  public getStyles(state: MatchDetails): Map<number, TeamStyle> {
    const kits = this.generateKitPair(state);
    const styles = new Map<number, TeamStyle>();

    styles.set(state.kickOffTeam.teamID, kits.home);
    styles.set(state.secondTeam.teamID, kits.away);

    return styles;
  }
}
