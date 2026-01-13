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

  public getStyles(state: MatchDetails): Map<number, TeamStyle> {
    const styles = new Map<number, TeamStyle>();

    [state.kickOffTeam, state.secondTeam].forEach((team): void => {
      // 1. Create pool and ensure it's never empty
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

      // 2. Pick Body
      const first = pickFromPool(pool);

      // 3. Pick Detail
      const remainingPool = pool.filter((c): boolean => c.name !== first.name);
      let secondName: string;

      if (remainingPool.length > 0) {
        secondName = pickFromPool(remainingPool).name;
      } else {
        // Safe check: if first is somehow still undefined (it shouldn't be now)
        const firstName = first?.name || 'White';
        secondName = firstName.toLowerCase() === 'white' ? 'Black' : 'White';
      }

      styles.set(team.teamID, {
        body: this.getHexColor(first.name),
        detail: this.getHexColor(secondName),
      });
    });

    return styles;
  }
}
