import { BattleEvent } from '../../../shared/src/types';

/**
 * Combat log system for debug display.
 * Provides human-readable descriptions of battle events.
 */
export class CombatLog {
  private entries: string[] = [];

  addEvent(event: BattleEvent): void {
    const desc = this.describeEvent(event);
    if (desc) {
      this.entries.push(`[${event.tick}] ${desc}`);
    }
  }

  addEvents(events: BattleEvent[]): void {
    for (const event of events) {
      this.addEvent(event);
    }
  }

  getEntries(): string[] {
    return [...this.entries];
  }

  getRecentEntries(count: number): string[] {
    return this.entries.slice(-count);
  }

  clear(): void {
    this.entries = [];
  }

  private describeEvent(event: BattleEvent): string | null {
    const d = event.data as Record<string, any>;

    switch (event.type) {
      case 'combat_start':
        return `Combat begins with ${d.unitCount} units`;

      case 'unit_move':
        return null; // Too many move events, skip

      case 'unit_attack':
        return `${d.attackerId} attacks ${d.targetId} (${d.attackType})`;

      case 'unit_damage':
        return `${d.targetId} takes ${d.damage} damage (${d.remainingHp} HP left)`;

      case 'unit_death':
        return `${d.unitId} (${d.typeId}) destroyed by ${d.killedBy}`;

      case 'combat_end':
        return `Combat ends — Winner: ${d.winner}${d.reason ? ` (${d.reason})` : ''}`;

      case 'round_result':
        return `Round ${d.roundNumber} complete — ${d.winner} wins`;

      default:
        return null;
    }
  }
}
