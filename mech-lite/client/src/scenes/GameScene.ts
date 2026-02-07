import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import {
  MatchState,
  PlacedUnit,
  UnitTypeId,
  TeamId,
  UpgradeId,
  Economy,
  ShopAction,
} from '../../../shared/src/types';
import {
  UNIT_DEFINITIONS,
  UPGRADE_DEFINITIONS,
  ECONOMY_CONSTANTS,
  BOARD_CONSTANTS,
  DEFAULT_MATCH_CONFIG,
} from '../../../shared/src/config';
import { MatchManager } from '../../../server/src/simulation/match-manager';

const CELL_SIZE = 40;
const BOARD_OFFSET_X = 20;
const BOARD_OFFSET_Y = 20;

/**
 * Main game scene: handles shop, planning, and board display.
 * Runs a local MatchManager for offline/local mode.
 */
export class GameScene extends Phaser.Scene {
  private matchManager!: MatchManager;
  private mode: string = 'local_1v1';
  private playerId: string = 'player_1';
  private teamId: TeamId = 'team1';

  // Board display
  private boardContainer!: Phaser.GameObjects.Container;
  private unitSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  // Shop UI
  private shopPanel!: Phaser.GameObjects.Container;
  private currencyText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  // Drag and drop
  private dragUnit: { typeId: UnitTypeId; sprite: Phaser.GameObjects.Image } | null = null;
  private selectedUnit: string | null = null;

  // State tracking
  private placementCounter = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { mode: string; matchId: string }): void {
    this.mode = data.mode || 'local_1v1';
  }

  create(): void {
    // Initialize local match manager
    const isCoop = this.mode.includes('coop');
    this.matchManager = new MatchManager(`local_${Date.now()}`, {
      mode: isCoop ? 'coop' : '1v1',
    });

    // Add local player
    this.matchManager.addPlayer({
      id: this.playerId,
      name: 'Player 1',
      team: 'team1',
      isBot: false,
      ready: false,
      connected: true,
    });

    // Start match (adds bots automatically)
    this.matchManager.startMatch();
    this.matchManager.drainMessages(); // Clear startup messages

    // Create UI
    this.createBoard();
    this.createShopPanel();
    this.createInfoPanel();
    this.createActionButtons();

    // Launch HUD overlay
    this.scene.launch('HUDScene');

    // Initial render
    this.refreshUI();
  }

  update(): void {
    // Update info display
    this.refreshInfoPanel();
  }

  // ── Board ──

  private createBoard(): void {
    this.boardContainer = this.add.container(BOARD_OFFSET_X, BOARD_OFFSET_Y);

    const config = DEFAULT_MATCH_CONFIG;

    // Draw grid
    for (let y = 0; y < config.boardHeight; y++) {
      for (let x = 0; x < config.boardWidth; x++) {
        // Determine zone
        let texture = 'grid_cell';
        if (y >= BOARD_CONSTANTS.TEAM1_DEPLOY_MIN_Y && y < BOARD_CONSTANTS.TEAM1_DEPLOY_MAX_Y) {
          texture = 'deploy_zone_team1';
        } else if (y >= BOARD_CONSTANTS.TEAM2_DEPLOY_MIN_Y && y < BOARD_CONSTANTS.TEAM2_DEPLOY_MAX_Y) {
          texture = 'deploy_zone_team2';
        }

        const cell = this.add.image(x * CELL_SIZE, y * CELL_SIZE, texture).setOrigin(0, 0);
        this.boardContainer.add(cell);
      }
    }

    // Zone labels
    const t1Label = this.add.text(
      BOARD_OFFSET_X + (config.boardWidth * CELL_SIZE) / 2,
      BOARD_OFFSET_Y + BOARD_CONSTANTS.TEAM1_DEPLOY_MAX_Y * CELL_SIZE - 15,
      '── YOUR DEPLOYMENT ZONE ──',
      { fontSize: '11px', fontFamily: 'monospace', color: '#4488ff' }
    ).setOrigin(0.5).setAlpha(0.6);

    const t2Label = this.add.text(
      BOARD_OFFSET_X + (config.boardWidth * CELL_SIZE) / 2,
      BOARD_OFFSET_Y + BOARD_CONSTANTS.TEAM2_DEPLOY_MIN_Y * CELL_SIZE + 10,
      '── ENEMY ZONE ──',
      { fontSize: '11px', fontFamily: 'monospace', color: '#ff4444' }
    ).setOrigin(0.5).setAlpha(0.6);

    // Mid-line
    const midY = (BOARD_CONSTANTS.TEAM1_DEPLOY_MAX_Y + BOARD_CONSTANTS.TEAM2_DEPLOY_MIN_Y) / 2;
    const line = this.add.graphics();
    line.lineStyle(2, 0x555577, 0.4);
    line.lineBetween(
      BOARD_OFFSET_X,
      BOARD_OFFSET_Y + midY * CELL_SIZE,
      BOARD_OFFSET_X + config.boardWidth * CELL_SIZE,
      BOARD_OFFSET_Y + midY * CELL_SIZE
    );

    // Board click handler for placing units
    const boardZone = this.add.zone(
      BOARD_OFFSET_X,
      BOARD_OFFSET_Y,
      config.boardWidth * CELL_SIZE,
      config.boardHeight * CELL_SIZE
    )
      .setOrigin(0, 0)
      .setInteractive();

    boardZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleBoardClick(pointer);
    });
  }

  private handleBoardClick(pointer: Phaser.Input.Pointer): void {
    const state = this.matchManager.getState();
    if (state.phase !== 'shopping' && state.phase !== 'planning') return;

    const gridX = (pointer.x - BOARD_OFFSET_X) / CELL_SIZE;
    const gridY = (pointer.y - BOARD_OFFSET_Y) / CELL_SIZE;

    // Check if click is in our deployment zone
    if (gridY < BOARD_CONSTANTS.TEAM1_DEPLOY_MIN_Y || gridY > BOARD_CONSTANTS.TEAM1_DEPLOY_MAX_Y) {
      return;
    }

    if (this.dragUnit) {
      // Place a new unit
      const instanceId = `unit_${this.playerId}_${this.placementCounter++}`;
      const placement: PlacedUnit = {
        instanceId,
        typeId: this.dragUnit.typeId,
        position: { x: gridX, y: gridY },
        facing: Math.PI / 2, // facing up (toward enemy)
        owner: this.teamId,
        playerId: this.playerId,
      };

      // Buy the unit
      this.matchManager.handleMessage(this.playerId, {
        type: 'shop_action',
        payload: { type: 'buy_unit', unitTypeId: this.dragUnit.typeId } as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      });

      // Place it
      this.matchManager.handleMessage(this.playerId, {
        type: 'place_unit',
        payload: placement as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      });

      this.matchManager.drainMessages();

      // Clear drag
      if (this.dragUnit.sprite) this.dragUnit.sprite.destroy();
      this.dragUnit = null;
      this.input.setDefaultCursor('default');

      this.refreshUI();
    } else if (this.selectedUnit) {
      // Move existing unit
      this.matchManager.handleMessage(this.playerId, {
        type: 'move_unit',
        payload: { instanceId: this.selectedUnit, position: { x: gridX, y: gridY } },
        timestamp: Date.now(),
      });
      this.matchManager.drainMessages();
      this.selectedUnit = null;
      this.refreshUI();
    }
  }

  // ── Shop Panel ──

  private createShopPanel(): void {
    const panelX = GAME_WIDTH - 280;
    const panelY = 20;

    this.shopPanel = this.add.container(panelX, panelY);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x16213e, 0.95);
    bg.fillRoundedRect(0, 0, 260, GAME_HEIGHT - 40, 8);
    bg.lineStyle(1, 0x333366, 1);
    bg.strokeRoundedRect(0, 0, 260, GAME_HEIGHT - 40, 8);
    this.shopPanel.add(bg);

    // Title
    this.shopPanel.add(
      this.add.text(130, 15, 'SHOP', {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#00ff88',
        fontStyle: 'bold',
      }).setOrigin(0.5)
    );

    // Currency display
    this.currencyText = this.add.text(130, 45, 'Credits: 300', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffcc44',
    }).setOrigin(0.5);
    this.shopPanel.add(this.currencyText);

    // Separator
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x444466, 0.5);
    sep.lineBetween(15, 65, 245, 65);
    this.shopPanel.add(sep);

    // Unit shop items
    this.createShopItems();

    // Upgrade section
    this.createUpgradeSection();
  }

  private createShopItems(): void {
    const allUnits: UnitTypeId[] = ['crawler', 'mustang', 'arclight', 'marksman', 'sledgehammer', 'vulcan', 'rhino'];
    let yOffset = 80;

    this.shopPanel.add(
      this.add.text(15, yOffset, 'UNITS', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#8888aa',
      })
    );
    yOffset += 20;

    for (const unitId of allUnits) {
      const def = UNIT_DEFINITIONS[unitId];
      const isStarter = ECONOMY_CONSTANTS.STARTING_UNLOCKED.includes(unitId);
      const unlockCost = (ECONOMY_CONSTANTS.UNLOCK_COSTS as Record<string, number>)[unitId];

      // Unit row
      const icon = this.add.image(30, yOffset + 12, `unit_${unitId}`).setScale(0.7);
      this.shopPanel.add(icon);

      const nameText = this.add.text(50, yOffset + 2, def.name, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ccddee',
      });
      this.shopPanel.add(nameText);

      const tierText = this.add.text(50, yOffset + 16, `T${def.tier} | ${def.cost}c`, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#888899',
      });
      this.shopPanel.add(tierText);

      // Buy button
      const buyBtn = this.add.text(190, yOffset + 8, isStarter ? 'BUY' : `UNLOCK ${unlockCost}c`, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#00ff88',
        backgroundColor: '#223344',
        padding: { x: 6, y: 3 },
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      buyBtn.on('pointerdown', () => {
        this.handleShopClick(unitId);
      });

      buyBtn.on('pointerover', () => buyBtn.setColor('#44ffaa'));
      buyBtn.on('pointerout', () => buyBtn.setColor('#00ff88'));

      this.shopPanel.add(buyBtn);

      // Store ref for dynamic updates
      (buyBtn as any).__unitId = unitId;

      yOffset += 38;
    }
  }

  private createUpgradeSection(): void {
    let yOffset = 360;

    this.shopPanel.add(
      this.add.text(15, yOffset, 'UPGRADES', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#8888aa',
      })
    );
    yOffset += 20;

    const upgrades: UpgradeId[] = ['damage_1', 'armor_1', 'hp_1', 'range_1', 'speed_1'];

    for (const upId of upgrades) {
      const def = UPGRADE_DEFINITIONS[upId];

      const label = this.add.text(15, yOffset, `${def.name} (${def.cost}c)`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#ccddee',
      });
      this.shopPanel.add(label);

      const desc = this.add.text(15, yOffset + 14, def.description, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#666688',
      });
      this.shopPanel.add(desc);

      const buyBtn = this.add.text(220, yOffset + 8, 'BUY', {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#ffcc44',
        backgroundColor: '#223344',
        padding: { x: 6, y: 3 },
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      buyBtn.on('pointerdown', () => {
        this.matchManager.handleMessage(this.playerId, {
          type: 'shop_action',
          payload: { type: 'buy_upgrade', upgradeId: upId } as unknown as Record<string, unknown>,
          timestamp: Date.now(),
        });
        this.matchManager.drainMessages();
        this.refreshUI();
      });

      this.shopPanel.add(buyBtn);
      yOffset += 34;
    }
  }

  private handleShopClick(unitId: UnitTypeId): void {
    const state = this.matchManager.getState();
    const economy = state.teams[this.teamId].economy;

    // Check if unlocked
    if (!economy.unlockedUnits.includes(unitId)) {
      // Try to unlock
      this.matchManager.handleMessage(this.playerId, {
        type: 'shop_action',
        payload: { type: 'unlock_unit', unitTypeId: unitId } as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      });
      this.matchManager.drainMessages();
      this.refreshUI();
      return;
    }

    // Start drag to place
    const def = UNIT_DEFINITIONS[unitId];
    if (economy.currency < def.cost) return;

    // Create ghost sprite following cursor
    const ghost = this.add.image(0, 0, `unit_${unitId}_ghost`).setAlpha(0.6).setDepth(100);

    this.dragUnit = { typeId: unitId, sprite: ghost };
    this.input.setDefaultCursor('crosshair');

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.dragUnit) {
        this.dragUnit.sprite.setPosition(pointer.x, pointer.y);
      }
    });
  }

  // ── Info Panel ──

  private createInfoPanel(): void {
    this.roundText = this.add.text(BOARD_OFFSET_X, GAME_HEIGHT - 60, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ccddee',
    });

    this.phaseText = this.add.text(BOARD_OFFSET_X, GAME_HEIGHT - 40, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00ff88',
    });

    this.scoreText = this.add.text(BOARD_OFFSET_X + 300, GAME_HEIGHT - 50, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
    });
  }

  private refreshInfoPanel(): void {
    const state = this.matchManager.getState();
    this.roundText.setText(`Round ${state.roundNumber} / ${state.maxRounds}`);
    this.phaseText.setText(`Phase: ${state.phase.toUpperCase()}`);

    const t1 = state.teams.team1.score;
    const t2 = state.teams.team2.score;
    this.scoreText.setText(`Score: YOU ${t1} - ${t2} ENEMY`);
  }

  // ── Action Buttons ──

  private createActionButtons(): void {
    // Ready / Commit button
    const readyBtn = this.add.text(GAME_WIDTH - 160, GAME_HEIGHT - 50, '  READY UP  ', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#226622',
      padding: { x: 12, y: 8 },
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    readyBtn.on('pointerdown', () => {
      this.commitRound();
    });

    readyBtn.on('pointerover', () => readyBtn.setBackgroundColor('#33aa33'));
    readyBtn.on('pointerout', () => readyBtn.setBackgroundColor('#226622'));

    // Remove last unit button
    const removeBtn = this.add.text(GAME_WIDTH - 160, GAME_HEIGHT - 90, 'REMOVE LAST', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ff6666',
      backgroundColor: '#442222',
      padding: { x: 8, y: 4 },
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    removeBtn.on('pointerdown', () => {
      const state = this.matchManager.getState();
      const placements = state.teams[this.teamId].placements;
      if (placements.length > 0) {
        const last = placements[placements.length - 1];
        this.matchManager.handleMessage(this.playerId, {
          type: 'remove_unit',
          payload: { instanceId: last.instanceId },
          timestamp: Date.now(),
        });
        this.matchManager.drainMessages();
        this.refreshUI();
      }
    });
  }

  private commitRound(): void {
    // Ready up — this triggers combat via MatchManager
    this.matchManager.handleMessage(this.playerId, {
      type: 'ready_up',
      payload: {},
      timestamp: Date.now(),
    });

    const messages = this.matchManager.drainMessages();

    // Find combat events
    const combatMsg = messages.find((m) => m.type === 'combat_events');
    const resultMsg = messages.find((m) => m.type === 'round_result');

    if (combatMsg) {
      // Transition to combat scene
      this.scene.start('CombatScene', {
        events: (combatMsg.payload as any).events,
        checksum: (combatMsg.payload as any).checksum,
        matchManager: this.matchManager,
        result: resultMsg?.payload,
        playerId: this.playerId,
        teamId: this.teamId,
        mode: this.mode,
      });
    }
  }

  // ── Rendering ──

  private refreshUI(): void {
    const state = this.matchManager.getState();
    const economy = state.teams[this.teamId].economy;

    // Update currency
    this.currencyText.setText(`Credits: ${economy.currency}`);

    // Update board units
    this.renderUnits(state);
  }

  private renderUnits(state: MatchState): void {
    // Clear existing sprites
    for (const [, container] of this.unitSprites) {
      container.destroy();
    }
    this.unitSprites.clear();

    // Render all placements
    for (const teamId of ['team1', 'team2'] as TeamId[]) {
      const team = state.teams[teamId];
      for (const unit of team.placements) {
        this.renderPlacedUnit(unit, teamId);
      }
    }
  }

  private renderPlacedUnit(unit: PlacedUnit, teamId: TeamId): void {
    const screenX = BOARD_OFFSET_X + unit.position.x * CELL_SIZE;
    const screenY = BOARD_OFFSET_Y + unit.position.y * CELL_SIZE;

    const container = this.add.container(screenX, screenY);

    // Team ring
    const ring = this.add.image(0, 0, `team_ring_${teamId}`);
    container.add(ring);

    // Unit sprite
    const sprite = this.add.image(0, 0, `unit_${unit.typeId}`);
    sprite.setRotation(unit.facing);
    container.add(sprite);

    // Name label
    const label = this.add.text(0, 18, UNIT_DEFINITIONS[unit.typeId].name, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: teamId === 'team1' ? '#88aaff' : '#ff8888',
    }).setOrigin(0.5);
    container.add(label);

    // Make own units interactive
    if (teamId === this.teamId && unit.playerId === this.playerId) {
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        this.selectedUnit = unit.instanceId;
      });
    }

    this.unitSprites.set(unit.instanceId, container);
  }
}
