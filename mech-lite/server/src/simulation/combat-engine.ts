import {
  CombatUnit,
  CombatState,
  BattleEvent,
  PlacedUnit,
  TeamId,
  Position,
  TargetingType,
  UnitTypeId,
  UpgradeId,
} from '../../../shared/src/types';
import {
  UNIT_DEFINITIONS,
  UPGRADE_DEFINITIONS,
  COMBAT_CONSTANTS,
} from '../../../shared/src/config';

/**
 * Deterministic combat simulation engine.
 * Fixed-timestep, no randomness, fully replayable.
 */
export class CombatEngine {
  private state: CombatState;
  private aoeUnits: Set<UnitTypeId> = new Set(['sledgehammer']);
  private chainUnits: Set<UnitTypeId> = new Set(['arclight']);

  constructor(
    team1Units: PlacedUnit[],
    team2Units: PlacedUnit[],
    team1Upgrades: UpgradeId[] = [],
    team2Upgrades: UpgradeId[] = []
  ) {
    const units: CombatUnit[] = [
      ...this.buildCombatUnits(team1Units, team1Upgrades),
      ...this.buildCombatUnits(team2Units, team2Upgrades),
    ];

    this.state = {
      tick: 0,
      units,
      events: [],
      finished: false,
    };

    this.state.events.push({
      tick: 0,
      type: 'combat_start',
      data: { unitCount: units.length },
    });
  }

  private buildCombatUnits(placed: PlacedUnit[], upgrades: UpgradeId[]): CombatUnit[] {
    return placed.map((p) => {
      const def = UNIT_DEFINITIONS[p.typeId];
      const stats = { ...def.stats };

      // Apply upgrades
      for (const upId of upgrades) {
        const upDef = UPGRADE_DEFINITIONS[upId];
        if (upDef.appliesTo === 'all' || upDef.appliesTo === p.typeId) {
          for (const [key, val] of Object.entries(upDef.statModifier)) {
            if (key in stats && typeof val === 'number') {
              (stats as Record<string, number>)[key] += val;
            }
          }
        }
      }

      return {
        instanceId: p.instanceId,
        typeId: p.typeId,
        owner: p.owner,
        position: { ...p.position },
        facing: p.facing,
        hp: stats.hp,
        maxHp: stats.hp,
        armor: stats.armor,
        damage: stats.damage,
        attackSpeed: stats.attackSpeed,
        range: stats.range,
        moveSpeed: stats.moveSpeed,
        targetingType: p.targetingOverride || stats.targetingType,
        attackCooldown: 0,
        alive: true,
        size: def.size,
      };
    });
  }

  /** Run the entire combat simulation to completion. */
  simulate(): CombatState {
    while (!this.state.finished && this.state.tick < COMBAT_CONSTANTS.MAX_TICKS) {
      this.tick();
    }

    if (!this.state.finished) {
      // Timeout — determine winner by remaining HP
      this.resolveTimeout();
    }

    return this.state;
  }

  /** Advance one simulation tick. */
  private tick(): void {
    this.state.tick++;
    const dt = COMBAT_CONSTANTS.TICK_DURATION;

    const alive = this.state.units.filter((u) => u.alive);
    const team1Alive = alive.filter((u) => u.owner === 'team1');
    const team2Alive = alive.filter((u) => u.owner === 'team2');

    // Check win condition
    if (team1Alive.length === 0 || team2Alive.length === 0) {
      this.state.finished = true;
      const winner: TeamId | undefined =
        team1Alive.length > 0 ? 'team1' : team2Alive.length > 0 ? 'team2' : undefined;
      this.state.winner = winner;
      this.state.events.push({
        tick: this.state.tick,
        type: 'combat_end',
        data: {
          winner: winner || 'draw',
          remainingUnits: alive.map((u) => ({
            instanceId: u.instanceId,
            hp: u.hp,
            typeId: u.typeId,
            owner: u.owner,
          })),
        },
      });
      return;
    }

    // Process each alive unit deterministically (sorted by instanceId for consistency)
    const sorted = [...alive].sort((a, b) => a.instanceId.localeCompare(b.instanceId));

    for (const unit of sorted) {
      if (!unit.alive) continue;

      const enemies = alive.filter((e) => e.owner !== unit.owner && e.alive);
      if (enemies.length === 0) continue;

      // Find target
      const target = this.findTarget(unit, enemies);
      if (!target) continue;

      const dist = this.distance(unit.position, target.position);

      if (dist <= unit.range) {
        // In range — attack if cooldown is ready
        unit.attackCooldown -= dt;
        if (unit.attackCooldown <= 0) {
          this.performAttack(unit, target, alive);
          unit.attackCooldown = 1 / unit.attackSpeed;
        }
      } else {
        // Move toward target
        this.moveToward(unit, target.position, dt);
      }
    }
  }

  private findTarget(unit: CombatUnit, enemies: CombatUnit[]): CombatUnit | null {
    if (enemies.length === 0) return null;

    switch (unit.targetingType) {
      case 'highest_hp':
        return enemies.reduce((best, e) => (e.hp > best.hp ? e : best));
      case 'lowest_hp':
        return enemies.reduce((best, e) => (e.hp < best.hp ? e : best));
      case 'prefer_large':
        return this.preferBySize(unit, enemies, 'large');
      case 'prefer_small':
        return this.preferBySize(unit, enemies, 'small');
      case 'nearest':
      default:
        return enemies.reduce((best, e) => {
          const dBest = this.distance(unit.position, best.position);
          const dE = this.distance(unit.position, e.position);
          return dE < dBest ? e : best;
        });
    }
  }

  private preferBySize(
    unit: CombatUnit,
    enemies: CombatUnit[],
    preference: 'large' | 'small'
  ): CombatUnit {
    // Sort by size preference, then by distance
    const sorted = [...enemies].sort((a, b) => {
      const sizeComp = preference === 'large' ? b.size - a.size : a.size - b.size;
      if (sizeComp !== 0) return sizeComp;
      return this.distance(unit.position, a.position) - this.distance(unit.position, b.position);
    });
    return sorted[0];
  }

  private performAttack(attacker: CombatUnit, target: CombatUnit, allUnits: CombatUnit[]): void {
    if (this.aoeUnits.has(attacker.typeId)) {
      this.performAoEAttack(attacker, target, allUnits);
    } else if (this.chainUnits.has(attacker.typeId)) {
      this.performChainAttack(attacker, target, allUnits);
    } else {
      this.applySingleDamage(attacker, target);
    }

    this.state.events.push({
      tick: this.state.tick,
      type: 'unit_attack',
      data: {
        attackerId: attacker.instanceId,
        targetId: target.instanceId,
        attackType: this.aoeUnits.has(attacker.typeId)
          ? 'aoe'
          : this.chainUnits.has(attacker.typeId)
            ? 'chain'
            : 'single',
      },
    });
  }

  private performAoEAttack(
    attacker: CombatUnit,
    target: CombatUnit,
    allUnits: CombatUnit[]
  ): void {
    const enemies = allUnits.filter(
      (u) => u.owner !== attacker.owner && u.alive
    );
    const splashTargets = enemies.filter(
      (u) => this.distance(u.position, target.position) <= COMBAT_CONSTANTS.AoE_RADIUS
    );

    for (const t of splashTargets) {
      // Splash does 60% to non-primary targets
      const dmgMult = t.instanceId === target.instanceId ? 1.0 : 0.6;
      this.applySingleDamage(attacker, t, dmgMult);
    }
  }

  private performChainAttack(
    attacker: CombatUnit,
    target: CombatUnit,
    allUnits: CombatUnit[]
  ): void {
    const enemies = allUnits.filter(
      (u) => u.owner !== attacker.owner && u.alive
    );
    const hit = new Set<string>();
    let current = target;

    for (let i = 0; i < COMBAT_CONSTANTS.CHAIN_TARGETS; i++) {
      if (!current || !current.alive) break;
      hit.add(current.instanceId);

      // Chain does 80% reduced per bounce
      const dmgMult = Math.pow(0.8, i);
      this.applySingleDamage(attacker, current, dmgMult);

      // Find next chain target
      const nextTargets = enemies
        .filter(
          (e) =>
            e.alive && !hit.has(e.instanceId) &&
            this.distance(e.position, current.position) <= COMBAT_CONSTANTS.CHAIN_RANGE
        )
        .sort(
          (a, b) =>
            this.distance(a.position, current.position) -
            this.distance(b.position, current.position)
        );

      current = nextTargets[0];
    }
  }

  private applySingleDamage(
    attacker: CombatUnit,
    target: CombatUnit,
    multiplier: number = 1.0
  ): void {
    // Damage = max(1, damage * multiplier - armor)
    const rawDamage = attacker.damage * multiplier;
    const finalDamage = Math.max(1, Math.floor(rawDamage - target.armor));

    target.hp -= finalDamage;

    this.state.events.push({
      tick: this.state.tick,
      type: 'unit_damage',
      data: {
        attackerId: attacker.instanceId,
        targetId: target.instanceId,
        damage: finalDamage,
        remainingHp: target.hp,
      },
    });

    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
      this.state.events.push({
        tick: this.state.tick,
        type: 'unit_death',
        data: {
          unitId: target.instanceId,
          typeId: target.typeId,
          killedBy: attacker.instanceId,
          position: { ...target.position },
        },
      });
    }
  }

  private moveToward(unit: CombatUnit, target: Position, dt: number): void {
    const dx = target.x - unit.position.x;
    const dy = target.y - unit.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.01) return;

    const step = unit.moveSpeed * dt;
    const ratio = Math.min(step / dist, 1.0);

    const newX = unit.position.x + dx * ratio;
    const newY = unit.position.y + dy * ratio;

    unit.position.x = newX;
    unit.position.y = newY;
    unit.facing = Math.atan2(dy, dx);

    // Only emit move events every 5 ticks to reduce log size
    if (this.state.tick % 5 === 0) {
      this.state.events.push({
        tick: this.state.tick,
        type: 'unit_move',
        data: {
          unitId: unit.instanceId,
          x: Math.round(newX * 100) / 100,
          y: Math.round(newY * 100) / 100,
          facing: unit.facing,
        },
      });
    }
  }

  private resolveTimeout(): void {
    // Sum remaining HP per team
    const team1Hp = this.state.units
      .filter((u) => u.owner === 'team1' && u.alive)
      .reduce((s, u) => s + u.hp, 0);
    const team2Hp = this.state.units
      .filter((u) => u.owner === 'team2' && u.alive)
      .reduce((s, u) => s + u.hp, 0);

    this.state.finished = true;
    this.state.winner = team1Hp > team2Hp ? 'team1' : team2Hp > team1Hp ? 'team2' : undefined;

    this.state.events.push({
      tick: this.state.tick,
      type: 'combat_end',
      data: {
        winner: this.state.winner || 'draw',
        reason: 'timeout',
        team1Hp,
        team2Hp,
      },
    });
  }

  private distance(a: Position, b: Position): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** Get a determinism checksum for the current state. */
  static checksum(state: CombatState): number {
    let hash = 0;
    for (const unit of state.units) {
      hash = (hash * 31 + Math.floor(unit.hp * 100)) | 0;
      hash = (hash * 31 + Math.floor(unit.position.x * 100)) | 0;
      hash = (hash * 31 + Math.floor(unit.position.y * 100)) | 0;
      hash = (hash * 31 + (unit.alive ? 1 : 0)) | 0;
    }
    return hash >>> 0; // unsigned
  }
}
