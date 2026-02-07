import {
  PlacedUnit,
  TeamId,
  UnitTypeId,
  ShopAction,
  Economy,
  UpgradeId,
  PlacedUnit as PlacedUnitType,
} from '../../../shared/src/types';
import {
  UNIT_DEFINITIONS,
  ECONOMY_CONSTANTS,
  BOARD_CONSTANTS,
  DEFAULT_MATCH_CONFIG,
} from '../../../shared/src/config';

type Difficulty = 'easy' | 'medium' | 'hard';

interface BotDecision {
  shopActions: ShopAction[];
  placements: PlacedUnit[];
  upgrades: UpgradeId[];
}

/**
 * Bot AI opponent.
 * Uses composition-based logic, not cheating stats.
 * Difficulty scales by composition quality, not stat bonuses.
 */
export class BotAI {
  private difficulty: Difficulty;
  private teamId: TeamId;
  private botId: string;
  private rng: SeededRNG;

  constructor(teamId: TeamId, botId: string, difficulty: Difficulty = 'medium', seed: number = 42) {
    this.teamId = teamId;
    this.botId = botId;
    this.difficulty = difficulty;
    this.rng = new SeededRNG(seed);
  }

  /**
   * Generate a full plan for one round.
   */
  generatePlan(
    roundNumber: number,
    economy: Economy,
    existingPlacements: PlacedUnit[],
    enemyPreviousPlacements: PlacedUnit[]
  ): BotDecision {
    const phase = this.getPhase(roundNumber);
    const shopActions: ShopAction[] = [];
    const upgrades: UpgradeId[] = [];
    let currency = economy.currency;
    const unlockedUnits = [...economy.unlockedUnits];

    // Phase-appropriate unlocks
    const unlockPriority = this.getUnlockPriority(phase);
    for (const unitId of unlockPriority) {
      if (unlockedUnits.includes(unitId)) continue;
      const cost = (ECONOMY_CONSTANTS.UNLOCK_COSTS as Record<string, number>)[unitId];
      if (cost && currency >= cost) {
        shopActions.push({ type: 'unlock_unit', unitTypeId: unitId });
        currency -= cost;
        unlockedUnits.push(unitId);
      }
    }

    // Buy upgrades occasionally
    if (roundNumber >= 3 && this.difficulty !== 'easy' && currency >= 150) {
      const upgradeChoice = this.pickUpgrade(roundNumber);
      if (upgradeChoice) {
        shopActions.push({ type: 'buy_upgrade', upgradeId: upgradeChoice });
        currency -= 150;
        upgrades.push(upgradeChoice);
      }
    }

    // Build composition
    const composition = this.buildComposition(phase, currency, unlockedUnits, enemyPreviousPlacements);
    for (const unit of composition.units) {
      shopActions.push({ type: 'buy_unit', unitTypeId: unit });
      currency -= UNIT_DEFINITIONS[unit].cost;
    }

    // Place units
    const allUnits = [...existingPlacements.map((p) => p.typeId), ...composition.units];
    const placements = this.generatePlacements(allUnits, existingPlacements);

    return { shopActions, placements, upgrades };
  }

  private getPhase(round: number): 'early' | 'mid' | 'late' {
    if (round <= 2) return 'early';
    if (round <= 5) return 'mid';
    return 'late';
  }

  private getUnlockPriority(phase: 'early' | 'mid' | 'late'): UnitTypeId[] {
    switch (phase) {
      case 'early':
        return [];
      case 'mid':
        return ['arclight', 'marksman', 'sledgehammer'];
      case 'late':
        return ['vulcan', 'rhino', 'marksman', 'sledgehammer'];
    }
  }

  private pickUpgrade(round: number): UpgradeId | null {
    const options: UpgradeId[] = ['damage_1', 'armor_1', 'hp_1', 'range_1', 'speed_1'];
    // Deterministic selection based on round
    return options[(round * 7) % options.length];
  }

  private buildComposition(
    phase: 'early' | 'mid' | 'late',
    budget: number,
    available: UnitTypeId[],
    _enemyPrev: PlacedUnit[]
  ): { units: UnitTypeId[] } {
    const units: UnitTypeId[] = [];

    // Strategy templates per phase
    const templates: Record<string, UnitTypeId[]> = {
      early_easy: ['crawler', 'crawler', 'crawler', 'mustang'],
      early_medium: ['crawler', 'crawler', 'mustang', 'mustang'],
      early_hard: ['crawler', 'mustang', 'mustang', 'mustang'],
      mid_easy: ['crawler', 'crawler', 'mustang', 'arclight'],
      mid_medium: ['mustang', 'mustang', 'arclight', 'marksman'],
      mid_hard: ['marksman', 'sledgehammer', 'arclight', 'mustang', 'mustang'],
      late_easy: ['crawler', 'crawler', 'mustang', 'vulcan'],
      late_medium: ['rhino', 'vulcan', 'marksman', 'mustang'],
      late_hard: ['rhino', 'rhino', 'vulcan', 'marksman', 'sledgehammer'],
    };

    const key = `${phase}_${this.difficulty}`;
    const template = templates[key] || templates[`${phase}_medium`];

    for (const unitId of template) {
      if (!available.includes(unitId)) continue;
      const cost = UNIT_DEFINITIONS[unitId].cost;
      if (budget >= cost) {
        units.push(unitId);
        budget -= cost;
      }
    }

    // Spend remaining budget on cheap units
    while (budget >= UNIT_DEFINITIONS.crawler.cost) {
      if (available.includes('mustang') && budget >= UNIT_DEFINITIONS.mustang.cost) {
        units.push('mustang');
        budget -= UNIT_DEFINITIONS.mustang.cost;
      } else {
        units.push('crawler');
        budget -= UNIT_DEFINITIONS.crawler.cost;
      }
    }

    return { units };
  }

  private generatePlacements(
    unitTypes: UnitTypeId[],
    _existing: PlacedUnit[]
  ): PlacedUnit[] {
    const placements: PlacedUnit[] = [];
    const deployMinY =
      this.teamId === 'team2'
        ? BOARD_CONSTANTS.TEAM2_DEPLOY_MIN_Y
        : BOARD_CONSTANTS.TEAM1_DEPLOY_MIN_Y;
    const deployMaxY =
      this.teamId === 'team2'
        ? BOARD_CONSTANTS.TEAM2_DEPLOY_MAX_Y
        : BOARD_CONSTANTS.TEAM1_DEPLOY_MAX_Y;
    const boardWidth = DEFAULT_MATCH_CONFIG.boardWidth;

    // Arrange in rows with slight randomization
    let col = 0;
    let row = 0;
    const unitsPerRow = Math.ceil(Math.sqrt(unitTypes.length)) + 1;
    const rowHeight = (deployMaxY - deployMinY) / 4;
    const colWidth = boardWidth / (unitsPerRow + 1);

    // Sort units: ranged in back, melee in front
    const sorted = [...unitTypes].sort((a, b) => {
      return UNIT_DEFINITIONS[a].stats.range - UNIT_DEFINITIONS[b].stats.range;
    });

    for (let i = 0; i < sorted.length; i++) {
      const unitId = sorted[i];
      const def = UNIT_DEFINITIONS[unitId];

      // Front-line units go first (lower range = front)
      const rowOffset = row * rowHeight;
      const y =
        this.teamId === 'team2'
          ? deployMaxY - rowOffset - 1
          : deployMinY + rowOffset + 1;

      const x = (col + 1) * colWidth;
      const jitterX = this.rng.next() * 0.5 - 0.25;
      const jitterY = this.rng.next() * 0.5 - 0.25;

      placements.push({
        instanceId: `bot_${this.botId}_${i}`,
        typeId: unitId,
        position: {
          x: Math.min(Math.max(x + jitterX, 1), boardWidth - 1),
          y: Math.min(Math.max(y + jitterY, deployMinY + 0.5), deployMaxY - 0.5),
        },
        facing: this.teamId === 'team2' ? -Math.PI / 2 : Math.PI / 2,
        owner: this.teamId,
        playerId: this.botId,
      });

      col++;
      if (col >= unitsPerRow) {
        col = 0;
        row++;
      }
    }

    return placements;
  }
}

/** Simple seeded PRNG for deterministic bot decisions. */
class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    // xorshift32
    this.state ^= this.state << 13;
    this.state ^= this.state >> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 0xffffffff;
  }
}
