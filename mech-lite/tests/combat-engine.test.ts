import { describe, it, expect } from 'vitest';
import { CombatEngine } from '../server/src/simulation/combat-engine';
import { PlacedUnit, CombatState, UnitTypeId } from '../shared/src/types';

function makePlacement(
  id: string,
  typeId: UnitTypeId,
  owner: 'team1' | 'team2',
  x: number,
  y: number
): PlacedUnit {
  return {
    instanceId: id,
    typeId,
    position: { x, y },
    facing: owner === 'team1' ? Math.PI / 2 : -Math.PI / 2,
    owner,
    playerId: `player_${owner}`,
  };
}

describe('CombatEngine', () => {
  it('should simulate combat between two teams', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'mustang', 'team1', 5, 3),
      makePlacement('t1_1', 'mustang', 'team1', 10, 3),
    ];

    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'crawler', 'team2', 5, 13),
      makePlacement('t2_1', 'crawler', 'team2', 10, 13),
    ];

    const engine = new CombatEngine(team1, team2);
    const result = engine.simulate();

    expect(result.finished).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0].type).toBe('combat_start');
    expect(result.events[result.events.length - 1].type).toBe('combat_end');
  });

  it('should produce deterministic results', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'mustang', 'team1', 5, 3),
      makePlacement('t1_1', 'crawler', 'team1', 8, 4),
    ];

    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'mustang', 'team2', 5, 13),
      makePlacement('t2_1', 'crawler', 'team2', 8, 12),
    ];

    const engine1 = new CombatEngine(team1, team2);
    const result1 = engine1.simulate();

    const engine2 = new CombatEngine(team1, team2);
    const result2 = engine2.simulate();

    // Same checksum = deterministic
    expect(CombatEngine.checksum(result1)).toBe(CombatEngine.checksum(result2));
    expect(result1.winner).toBe(result2.winner);
    expect(result1.tick).toBe(result2.tick);
  });

  it('should handle empty teams', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'mustang', 'team1', 5, 3),
    ];
    const team2: PlacedUnit[] = [];

    const engine = new CombatEngine(team1, team2);
    const result = engine.simulate();

    expect(result.finished).toBe(true);
    expect(result.winner).toBe('team1');
  });

  it('should apply upgrades to unit stats', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'mustang', 'team1', 5, 3),
    ];
    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'mustang', 'team2', 5, 13),
    ];

    // Without upgrades
    const engine1 = new CombatEngine(team1, team2);
    const result1 = engine1.simulate();

    // With damage upgrade for team1
    const engine2 = new CombatEngine(team1, team2, ['damage_1'], []);
    const result2 = engine2.simulate();

    // Team1 with damage upgrade should win faster (fewer ticks)
    // or have a different outcome
    expect(result2.finished).toBe(true);
    // The upgraded team should perform differently
    expect(CombatEngine.checksum(result1)).not.toBe(CombatEngine.checksum(result2));
  });

  it('should handle AoE attacks (sledgehammer)', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'sledgehammer', 'team1', 12, 3),
    ];
    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'crawler', 'team2', 11, 13),
      makePlacement('t2_1', 'crawler', 'team2', 12, 13),
      makePlacement('t2_2', 'crawler', 'team2', 13, 13),
    ];

    const engine = new CombatEngine(team1, team2);
    const result = engine.simulate();

    expect(result.finished).toBe(true);
    // Sledgehammer has AoE, so multiple damage events per attack
    const damageEvents = result.events.filter((e) => e.type === 'unit_damage');
    expect(damageEvents.length).toBeGreaterThan(3);
  });

  it('should handle chain attacks (arclight)', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'arclight', 'team1', 12, 3),
    ];
    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'crawler', 'team2', 12, 12),
      makePlacement('t2_1', 'crawler', 'team2', 13, 12),
      makePlacement('t2_2', 'crawler', 'team2', 14, 12),
    ];

    const engine = new CombatEngine(team1, team2);
    const result = engine.simulate();

    expect(result.finished).toBe(true);
    // Arclight should chain between close enemies
    const attackEvents = result.events.filter((e) => e.type === 'unit_attack');
    expect(attackEvents.length).toBeGreaterThan(0);
  });

  it('should respect targeting types', () => {
    // Marksman should target highest HP
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'marksman', 'team1', 12, 3),
    ];
    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'crawler', 'team2', 10, 10), // low HP
      makePlacement('t2_1', 'rhino', 'team2', 14, 10), // high HP
    ];

    const engine = new CombatEngine(team1, team2);
    const result = engine.simulate();

    // Find the first attack by marksman
    const firstAttack = result.events.find(
      (e) => e.type === 'unit_attack' && (e.data as any).attackerId === 't1_0'
    );

    expect(firstAttack).toBeDefined();
    // Marksman should target rhino (highest HP) first
    expect((firstAttack!.data as any).targetId).toBe('t2_1');
  });

  it('should produce checksum for state verification', () => {
    const team1: PlacedUnit[] = [
      makePlacement('t1_0', 'mustang', 'team1', 5, 3),
    ];
    const team2: PlacedUnit[] = [
      makePlacement('t2_0', 'mustang', 'team2', 5, 13),
    ];

    const engine = new CombatEngine(team1, team2);
    const result = engine.simulate();

    const checksum = CombatEngine.checksum(result);
    expect(typeof checksum).toBe('number');
    expect(checksum).toBeGreaterThan(0);
  });
});
