import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import {
  BattleEvent,
  TeamId,
  CombatUnit,
  Position,
} from '../../../shared/src/types';
import {
  UNIT_DEFINITIONS,
  COMBAT_CONSTANTS,
} from '../../../shared/src/config';
import { MatchManager } from '../../../server/src/simulation/match-manager';

const CELL_SIZE = 40;
const BOARD_OFFSET_X = 20;
const BOARD_OFFSET_Y = 20;

interface UnitVisual {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Graphics;
  maxHp: number;
  currentHp: number;
  alive: boolean;
}

/**
 * Combat playback scene.
 * Replays battle events from the deterministic simulation.
 */
export class CombatScene extends Phaser.Scene {
  private events: BattleEvent[] = [];
  private matchManager!: MatchManager;
  private result: any;
  private playerId: string = '';
  private teamId: TeamId = 'team1';
  private mode: string = '';

  // Playback
  private playbackTick = 0;
  private playbackSpeed = 1;
  private eventIndex = 0;
  private playing = true;
  private tickAccumulator = 0;

  // Visuals
  private unitVisuals: Map<string, UnitVisual> = new Map();
  private speedText!: Phaser.GameObjects.Text;
  private tickText!: Phaser.GameObjects.Text;
  private checksumText!: Phaser.GameObjects.Text;
  private checksum: number = 0;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: any): void {
    this.events = data.events || [];
    this.matchManager = data.matchManager;
    this.result = data.result;
    this.playerId = data.playerId;
    this.teamId = data.teamId;
    this.mode = data.mode;
    this.checksum = data.checksum || 0;
  }

  create(): void {
    this.playbackTick = 0;
    this.eventIndex = 0;
    this.playing = true;
    this.tickAccumulator = 0;
    this.playbackSpeed = 1;
    this.unitVisuals.clear();

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d1117);

    // Draw board grid (simplified)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x222244, 0.2);
    for (let x = 0; x <= 24; x++) {
      grid.lineBetween(
        BOARD_OFFSET_X + x * CELL_SIZE, BOARD_OFFSET_Y,
        BOARD_OFFSET_X + x * CELL_SIZE, BOARD_OFFSET_Y + 16 * CELL_SIZE
      );
    }
    for (let y = 0; y <= 16; y++) {
      grid.lineBetween(
        BOARD_OFFSET_X, BOARD_OFFSET_Y + y * CELL_SIZE,
        BOARD_OFFSET_X + 24 * CELL_SIZE, BOARD_OFFSET_Y + y * CELL_SIZE
      );
    }

    // Midline
    grid.lineStyle(2, 0x444466, 0.4);
    grid.lineBetween(
      BOARD_OFFSET_X, BOARD_OFFSET_Y + 8 * CELL_SIZE,
      BOARD_OFFSET_X + 24 * CELL_SIZE, BOARD_OFFSET_Y + 8 * CELL_SIZE
    );

    // Header
    this.add.text(GAME_WIDTH / 2, 5, '⚔ COMBAT ⚔', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ff6644',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Playback info
    this.tickText = this.add.text(20, GAME_HEIGHT - 35, 'Tick: 0', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888899',
    });

    this.speedText = this.add.text(150, GAME_HEIGHT - 35, 'Speed: 1x', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888899',
    });

    this.checksumText = this.add.text(300, GAME_HEIGHT - 35, `Checksum: ${this.checksum}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#555566',
    });

    // Controls
    this.createPlaybackControls();

    // Place initial units from combat_start events
    this.initializeUnitsFromEvents();
  }

  update(_time: number, delta: number): void {
    if (!this.playing) return;

    this.tickAccumulator += (delta / 1000) * COMBAT_CONSTANTS.TICK_RATE * this.playbackSpeed;

    while (this.tickAccumulator >= 1 && this.eventIndex < this.events.length) {
      this.tickAccumulator -= 1;
      this.playbackTick++;
      this.processEventsForTick(this.playbackTick);
    }

    this.tickText.setText(`Tick: ${this.playbackTick}`);

    // Check if combat is over
    if (this.eventIndex >= this.events.length && this.playing) {
      this.playing = false;
      this.showResult();
    }
  }

  private initializeUnitsFromEvents(): void {
    // Find all units that participate by scanning move/attack/damage events
    const unitPositions = new Map<string, { x: number; y: number; typeId: string; owner: string }>();

    for (const event of this.events) {
      if (event.type === 'unit_move') {
        const d = event.data as any;
        if (!unitPositions.has(d.unitId)) {
          unitPositions.set(d.unitId, {
            x: d.x,
            y: d.y,
            typeId: this.guessTypeFromId(d.unitId),
            owner: d.unitId.includes('team2') || d.unitId.includes('bot_bot_team2') ? 'team2' : 'team1',
          });
        }
      }
      if (event.type === 'unit_damage') {
        const d = event.data as any;
        // Track targets to know about units
        if (!unitPositions.has(d.targetId)) {
          unitPositions.set(d.targetId, {
            x: 12, y: 8,
            typeId: this.guessTypeFromId(d.targetId),
            owner: d.targetId.includes('team2') || d.targetId.includes('bot_bot_team2') ? 'team2' : 'team1',
          });
        }
      }
    }

    // Also check placements from match state
    if (this.matchManager) {
      const state = this.matchManager.getState();
      for (const teamId of ['team1', 'team2'] as TeamId[]) {
        for (const unit of state.teams[teamId].placements) {
          if (!unitPositions.has(unit.instanceId)) {
            unitPositions.set(unit.instanceId, {
              x: unit.position.x,
              y: unit.position.y,
              typeId: unit.typeId,
              owner: teamId,
            });
          } else {
            const existing = unitPositions.get(unit.instanceId)!;
            existing.typeId = unit.typeId;
            existing.owner = teamId;
          }
        }
      }
    }

    // Create sprites for all known units
    for (const [instanceId, info] of unitPositions) {
      this.createUnitVisual(instanceId, info.typeId, info.owner as TeamId, info.x, info.y);
    }
  }

  private guessTypeFromId(instanceId: string): string {
    // Default guess
    return 'mustang';
  }

  private createUnitVisual(
    instanceId: string,
    typeId: string,
    owner: TeamId,
    x: number,
    y: number
  ): void {
    const screenX = BOARD_OFFSET_X + x * CELL_SIZE;
    const screenY = BOARD_OFFSET_Y + y * CELL_SIZE;

    const container = this.add.container(screenX, screenY);

    // Team ring
    const ring = this.add.image(0, 0, `team_ring_${owner}`);
    container.add(ring);

    // Unit sprite
    const texKey = `unit_${typeId}`;
    const sprite = this.textures.exists(texKey)
      ? this.add.image(0, 0, texKey)
      : this.add.image(0, 0, 'unit_mustang');
    container.add(sprite);

    // HP bar
    const hpBar = this.add.graphics();
    container.add(hpBar);

    const def = UNIT_DEFINITIONS[typeId as keyof typeof UNIT_DEFINITIONS];
    const maxHp = def ? def.stats.hp : 100;

    this.drawHpBar(hpBar, maxHp, maxHp);

    this.unitVisuals.set(instanceId, {
      container,
      sprite,
      hpBar,
      maxHp,
      currentHp: maxHp,
      alive: true,
    });
  }

  private drawHpBar(g: Phaser.GameObjects.Graphics, current: number, max: number): void {
    g.clear();
    const width = 28;
    const height = 3;
    const yOffset = -18;

    // Background
    g.fillStyle(0x222222, 1);
    g.fillRect(-width / 2, yOffset, width, height);

    // Fill
    const ratio = Math.max(0, current / max);
    const color = ratio > 0.5 ? 0x44cc44 : ratio > 0.25 ? 0xcccc44 : 0xcc4444;
    g.fillStyle(color, 1);
    g.fillRect(-width / 2, yOffset, width * ratio, height);
  }

  private processEventsForTick(tick: number): void {
    while (this.eventIndex < this.events.length && this.events[this.eventIndex].tick <= tick) {
      const event = this.events[this.eventIndex];
      this.processEvent(event);
      this.eventIndex++;
    }
  }

  private processEvent(event: BattleEvent): void {
    const data = event.data as any;

    switch (event.type) {
      case 'unit_move': {
        const visual = this.unitVisuals.get(data.unitId);
        if (visual && visual.alive) {
          const targetX = BOARD_OFFSET_X + data.x * CELL_SIZE;
          const targetY = BOARD_OFFSET_Y + data.y * CELL_SIZE;

          this.tweens.add({
            targets: visual.container,
            x: targetX,
            y: targetY,
            duration: 200 / this.playbackSpeed,
            ease: 'Linear',
          });

          if (data.facing !== undefined) {
            visual.sprite.setRotation(data.facing);
          }
        }
        break;
      }

      case 'unit_attack': {
        const attacker = this.unitVisuals.get(data.attackerId);
        const target = this.unitVisuals.get(data.targetId);

        if (attacker && target && attacker.alive && target.alive) {
          // Flash attacker
          this.tweens.add({
            targets: attacker.sprite,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 80 / this.playbackSpeed,
            yoyo: true,
          });

          // Projectile
          const proj = this.add.image(
            attacker.container.x,
            attacker.container.y,
            'projectile'
          ).setDepth(50);

          this.tweens.add({
            targets: proj,
            x: target.container.x,
            y: target.container.y,
            duration: 150 / this.playbackSpeed,
            onComplete: () => proj.destroy(),
          });
        }
        break;
      }

      case 'unit_damage': {
        const target = this.unitVisuals.get(data.targetId);
        if (target) {
          target.currentHp = Math.max(0, data.remainingHp);
          this.drawHpBar(target.hpBar, target.currentHp, target.maxHp);

          // Damage flash
          this.tweens.add({
            targets: target.sprite,
            tint: 0xff0000,
            duration: 60 / this.playbackSpeed,
            onComplete: () => target.sprite.clearTint(),
          });

          // Damage number
          const dmgText = this.add.text(
            target.container.x + Phaser.Math.Between(-10, 10),
            target.container.y - 25,
            `-${data.damage}`,
            { fontSize: '12px', fontFamily: 'monospace', color: '#ff4444', fontStyle: 'bold' }
          ).setOrigin(0.5).setDepth(60);

          this.tweens.add({
            targets: dmgText,
            y: dmgText.y - 20,
            alpha: 0,
            duration: 600 / this.playbackSpeed,
            onComplete: () => dmgText.destroy(),
          });
        }
        break;
      }

      case 'unit_death': {
        const visual = this.unitVisuals.get(data.unitId);
        if (visual) {
          visual.alive = false;

          // Death animation
          const expl = this.add.image(
            visual.container.x,
            visual.container.y,
            'explosion'
          ).setDepth(70).setScale(0.5);

          this.tweens.add({
            targets: expl,
            scale: 1.5,
            alpha: 0,
            duration: 400 / this.playbackSpeed,
            onComplete: () => expl.destroy(),
          });

          this.tweens.add({
            targets: visual.container,
            alpha: 0,
            scale: 0.3,
            duration: 300 / this.playbackSpeed,
          });
        }
        break;
      }

      case 'combat_end': {
        // Will be handled in showResult
        break;
      }
    }
  }

  private createPlaybackControls(): void {
    // Pause/Play
    const pauseBtn = this.add.text(GAME_WIDTH - 200, GAME_HEIGHT - 40, '⏸ PAUSE', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ccddee',
      backgroundColor: '#333355',
      padding: { x: 8, y: 4 },
    })
      .setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerdown', () => {
      this.playing = !this.playing;
      pauseBtn.setText(this.playing ? '⏸ PAUSE' : '▶ PLAY');
    });

    // Speed control
    const speedBtn = this.add.text(GAME_WIDTH - 90, GAME_HEIGHT - 40, '⏩ 2x', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ccddee',
      backgroundColor: '#333355',
      padding: { x: 8, y: 4 },
    })
      .setInteractive({ useHandCursor: true });

    speedBtn.on('pointerdown', () => {
      this.playbackSpeed = this.playbackSpeed >= 4 ? 1 : this.playbackSpeed * 2;
      speedBtn.setText(`⏩ ${this.playbackSpeed}x`);
      this.speedText.setText(`Speed: ${this.playbackSpeed}x`);
    });

    // Skip
    const skipBtn = this.add.text(GAME_WIDTH - 200, GAME_HEIGHT - 70, 'SKIP >>>', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888899',
      backgroundColor: '#222233',
      padding: { x: 8, y: 4 },
    })
      .setInteractive({ useHandCursor: true });

    skipBtn.on('pointerdown', () => {
      this.playing = false;
      this.eventIndex = this.events.length;
      this.showResult();
    });
  }

  private showResult(): void {
    // Dim the background
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.6
    ).setDepth(80);

    const resultData = this.result || {};
    const winner = resultData.winner || 'draw';
    const isWin = winner === this.teamId;
    const isDraw = winner === 'draw';

    const resultLabel = isDraw ? 'DRAW' : isWin ? 'VICTORY!' : 'DEFEAT';
    const resultColor = isDraw ? '#cccc44' : isWin ? '#00ff88' : '#ff4444';

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, resultLabel, {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: resultColor,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(90);

    const scores = resultData.scores || { team1: 0, team2: 0 };
    this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20,
      `Score: ${scores.team1} - ${scores.team2}`,
      {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#ccddee',
      }
    ).setOrigin(0.5).setDepth(90);

    // Continue button
    const continueBtn = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80,
      'CONTINUE',
      {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#00ff88',
        backgroundColor: '#224422',
        padding: { x: 20, y: 10 },
      }
    )
      .setOrigin(0.5)
      .setDepth(90)
      .setInteractive({ useHandCursor: true });

    continueBtn.on('pointerdown', () => {
      this.proceedToNextPhase();
    });
  }

  private proceedToNextPhase(): void {
    const state = this.matchManager.getState();

    if (state.phase === 'finished') {
      this.scene.start('ResultsScene', {
        matchManager: this.matchManager,
        playerId: this.playerId,
        teamId: this.teamId,
      });
    } else {
      // Go back to planning for next round
      this.scene.start('GameScene', {
        mode: this.mode,
        matchId: state.matchId,
        matchManager: this.matchManager,
        playerId: this.playerId,
        teamId: this.teamId,
      });
    }
  }
}
