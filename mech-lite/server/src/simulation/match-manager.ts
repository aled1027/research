import {
  MatchState,
  MatchConfig,
  MatchPhase,
  TeamId,
  TeamState,
  Player,
  PlacedUnit,
  ShopAction,
  Economy,
  ServerMessage,
  ClientMessage,
  UnitTypeId,
  UpgradeId,
  BattleEvent,
} from '../../../shared/src/types';
import {
  DEFAULT_MATCH_CONFIG,
  UNIT_DEFINITIONS,
  ECONOMY_CONSTANTS,
  COMBAT_CONSTANTS,
  UPGRADE_DEFINITIONS,
} from '../../../shared/src/config';
import { CombatEngine } from './combat-engine';
import { BotAI } from '../ai/bot-ai';

/**
 * Manages a single match lifecycle from lobby to finished.
 */
export class MatchManager {
  private state: MatchState;
  private config: MatchConfig;
  private bots: Map<string, BotAI> = new Map();
  private messageQueue: ServerMessage[] = [];
  private planningTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(matchId: string, config: Partial<MatchConfig> = {}) {
    this.config = { ...DEFAULT_MATCH_CONFIG, ...config };
    this.state = this.createInitialState(matchId);
  }

  private createInitialState(matchId: string): MatchState {
    const makeTeamState = (teamId: TeamId): TeamState => ({
      teamId,
      players: [],
      economy: {
        currency: this.config.startingCurrency,
        income: this.config.incomePerRound,
        unlockedUnits: [...ECONOMY_CONSTANTS.STARTING_UNLOCKED],
      },
      placements: [],
      purchasedUpgrades: [],
      score: 0,
      baseHp: 100,
    });

    return {
      matchId,
      phase: 'lobby',
      roundNumber: 0,
      maxRounds: this.config.maxRounds,
      targetScore: this.config.targetScore,
      teams: {
        team1: makeTeamState('team1'),
        team2: makeTeamState('team2'),
      },
    };
  }

  // ── Player Management ──

  addPlayer(player: Player): void {
    const team = this.state.teams[player.team];
    if (team.players.length >= 2) {
      this.enqueueMessage({
        type: 'error',
        payload: { message: 'Team is full' },
        timestamp: Date.now(),
      });
      return;
    }

    // Assign deployment zone in co-op
    if (this.config.mode === 'coop' && !player.isBot) {
      const existingHumans = team.players.filter((p) => !p.isBot);
      player.deploymentZone = existingHumans.length === 0 ? 'left' : 'right';
    }

    team.players.push(player);
    this.enqueueMessage({
      type: 'player_joined',
      payload: { player },
      timestamp: Date.now(),
    });
  }

  addBot(teamId: TeamId, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): void {
    const botId = `bot_${teamId}_${Date.now()}`;
    const bot = new BotAI(teamId, botId, difficulty, this.state.roundNumber + 42);
    this.bots.set(botId, bot);

    this.addPlayer({
      id: botId,
      name: `Bot (${difficulty})`,
      team: teamId,
      isBot: true,
      ready: false,
      connected: true,
    });
  }

  removePlayer(playerId: string): void {
    for (const teamId of ['team1', 'team2'] as TeamId[]) {
      const team = this.state.teams[teamId];
      const idx = team.players.findIndex((p) => p.id === playerId);
      if (idx !== -1) {
        const player = team.players[idx];
        player.connected = false;

        this.enqueueMessage({
          type: 'player_left',
          payload: { playerId, teamId },
          timestamp: Date.now(),
        });
        break;
      }
    }
  }

  // ── Phase Transitions ──

  startMatch(): void {
    if (this.state.phase !== 'lobby') return;

    // Ensure we have bots if needed
    if (this.config.mode === 'coop') {
      const team2 = this.state.teams.team2;
      while (team2.players.length < 2) {
        this.addBot('team2', 'medium');
      }
    } else {
      // 1v1
      const team2 = this.state.teams.team2;
      if (team2.players.filter((p) => p.isBot).length === 0 && team2.players.length === 0) {
        this.addBot('team2', 'medium');
      }
    }

    this.state.roundNumber = 1;
    this.transitionToShopping();
  }

  private transitionToShopping(): void {
    this.state.phase = 'shopping';

    // Apply income
    for (const teamId of ['team1', 'team2'] as TeamId[]) {
      const team = this.state.teams[teamId];
      const incomeMultiplier = Math.pow(
        this.config.incomeScaling,
        this.state.roundNumber - 1
      );
      const income = Math.floor(team.economy.income * incomeMultiplier);
      team.economy.currency += income;
    }

    // Reset ready states
    for (const team of Object.values(this.state.teams)) {
      for (const player of team.players) {
        player.ready = false;
      }
    }

    this.broadcastPhaseChange();
  }

  private transitionToPlanning(): void {
    this.state.phase = 'planning';
    this.broadcastPhaseChange();
  }

  private transitionToCommitted(): void {
    this.state.phase = 'committed';

    // Generate bot plans
    for (const [botId, bot] of this.bots) {
      const player = this.findPlayer(botId);
      if (!player) continue;
      const team = this.state.teams[player.team];
      const enemyTeamId: TeamId = player.team === 'team1' ? 'team2' : 'team1';
      const enemyTeam = this.state.teams[enemyTeamId];

      const decision = bot.generatePlan(
        this.state.roundNumber,
        team.economy,
        team.placements,
        enemyTeam.placements
      );

      // Apply bot shop actions
      for (const action of decision.shopActions) {
        this.processShopAction(player.team, action);
      }

      // Apply bot upgrades
      for (const upg of decision.upgrades) {
        if (!team.purchasedUpgrades.includes(upg)) {
          team.purchasedUpgrades.push(upg);
        }
      }

      // Set bot placements
      const botPlacements = team.placements.filter((p) => p.playerId !== botId);
      team.placements = [...botPlacements, ...decision.placements];
    }

    this.broadcastPhaseChange();
    this.runCombat();
  }

  private runCombat(): void {
    this.state.phase = 'combat';
    this.broadcastPhaseChange();

    const team1 = this.state.teams.team1;
    const team2 = this.state.teams.team2;

    const engine = new CombatEngine(
      team1.placements,
      team2.placements,
      team1.purchasedUpgrades,
      team2.purchasedUpgrades
    );

    const result = engine.simulate();
    this.state.battleLog = result.events;

    // Stream combat events to clients
    this.enqueueMessage({
      type: 'combat_events',
      payload: {
        events: result.events,
        checksum: CombatEngine.checksum(result),
      },
      timestamp: Date.now(),
    });

    // Process results
    this.processRoundResult(result.winner);
  }

  private processRoundResult(winner?: TeamId): void {
    this.state.phase = 'results';

    if (winner) {
      const winTeam = this.state.teams[winner];
      winTeam.score += COMBAT_CONSTANTS.BASE_DAMAGE_ON_WIN;
    }

    this.enqueueMessage({
      type: 'round_result',
      payload: {
        roundNumber: this.state.roundNumber,
        winner: winner || 'draw',
        scores: {
          team1: this.state.teams.team1.score,
          team2: this.state.teams.team2.score,
        },
      },
      timestamp: Date.now(),
    });

    // Check match end
    const t1Score = this.state.teams.team1.score;
    const t2Score = this.state.teams.team2.score;

    if (
      t1Score >= this.config.targetScore ||
      t2Score >= this.config.targetScore ||
      this.state.roundNumber >= this.config.maxRounds
    ) {
      this.endMatch();
    } else {
      // Next round
      this.state.roundNumber++;
      this.transitionToShopping();
    }
  }

  private endMatch(): void {
    this.state.phase = 'finished';
    const t1Score = this.state.teams.team1.score;
    const t2Score = this.state.teams.team2.score;
    this.state.winner = t1Score > t2Score ? 'team1' : t2Score > t1Score ? 'team2' : undefined;

    this.broadcastPhaseChange();
  }

  // ── Player Actions ──

  handleMessage(playerId: string, msg: ClientMessage): void {
    const player = this.findPlayer(playerId);
    if (!player) return;

    switch (msg.type) {
      case 'shop_action':
        if (this.state.phase === 'shopping' || this.state.phase === 'planning') {
          this.processShopAction(player.team, msg.payload as unknown as ShopAction);
        }
        break;

      case 'place_unit':
        if (this.state.phase === 'planning' || this.state.phase === 'shopping') {
          this.placeUnit(player, msg.payload as unknown as PlacedUnit);
        }
        break;

      case 'remove_unit':
        if (this.state.phase === 'planning' || this.state.phase === 'shopping') {
          this.removeUnit(player.team, msg.payload.instanceId as string);
        }
        break;

      case 'move_unit':
        if (this.state.phase === 'planning' || this.state.phase === 'shopping') {
          this.moveUnit(
            player.team,
            msg.payload.instanceId as string,
            msg.payload.position as { x: number; y: number }
          );
        }
        break;

      case 'set_targeting':
        this.setTargeting(
          player.team,
          msg.payload.instanceId as string,
          msg.payload.targetingType as string
        );
        break;

      case 'ready_up':
        this.readyUp(playerId);
        break;

      case 'unready':
        this.unready(playerId);
        break;

      case 'request_state':
        this.enqueueMessage({
          type: 'match_state',
          payload: { state: this.getState() },
          timestamp: Date.now(),
        });
        break;
    }
  }

  private processShopAction(teamId: TeamId, action: ShopAction): void {
    const team = this.state.teams[teamId];

    switch (action.type) {
      case 'buy_unit': {
        const unitId = action.unitTypeId!;
        if (!team.economy.unlockedUnits.includes(unitId)) return;
        const cost = UNIT_DEFINITIONS[unitId].cost;
        if (team.economy.currency < cost) return;
        team.economy.currency -= cost;
        break;
      }

      case 'unlock_unit': {
        const unitId = action.unitTypeId!;
        if (team.economy.unlockedUnits.includes(unitId)) return;
        const unlockCost =
          (ECONOMY_CONSTANTS.UNLOCK_COSTS as Record<string, number>)[unitId];
        if (!unlockCost || team.economy.currency < unlockCost) return;
        team.economy.currency -= unlockCost;
        team.economy.unlockedUnits.push(unitId);
        break;
      }

      case 'buy_upgrade': {
        const upgradeId = action.upgradeId as UpgradeId;
        if (!upgradeId) return;
        const upDef = UPGRADE_DEFINITIONS[upgradeId];
        if (!upDef || team.economy.currency < upDef.cost) return;
        if (team.purchasedUpgrades.includes(upgradeId)) return;
        team.economy.currency -= upDef.cost;
        team.purchasedUpgrades.push(upgradeId);
        break;
      }
    }
  }

  private placeUnit(player: Player, placement: PlacedUnit): void {
    const team = this.state.teams[player.team];
    placement.owner = player.team;
    placement.playerId = player.id;
    team.placements.push(placement);
  }

  private removeUnit(teamId: TeamId, instanceId: string): void {
    const team = this.state.teams[teamId];
    team.placements = team.placements.filter((p) => p.instanceId !== instanceId);
  }

  private moveUnit(teamId: TeamId, instanceId: string, position: { x: number; y: number }): void {
    const team = this.state.teams[teamId];
    const unit = team.placements.find((p) => p.instanceId === instanceId);
    if (unit) {
      unit.position = position;
    }
  }

  private setTargeting(teamId: TeamId, instanceId: string, targeting: string): void {
    const team = this.state.teams[teamId];
    const unit = team.placements.find((p) => p.instanceId === instanceId);
    if (unit) {
      unit.targetingOverride = targeting as PlacedUnit['targetingOverride'];
    }
  }

  private readyUp(playerId: string): void {
    const player = this.findPlayer(playerId);
    if (!player) return;

    player.ready = true;

    this.enqueueMessage({
      type: 'player_ready',
      payload: { playerId, ready: true },
      timestamp: Date.now(),
    });

    // Auto-ready bots
    for (const team of Object.values(this.state.teams)) {
      for (const p of team.players) {
        if (p.isBot) p.ready = true;
      }
    }

    // Check if all players are ready
    this.checkAllReady();
  }

  private unready(playerId: string): void {
    const player = this.findPlayer(playerId);
    if (!player) return;
    player.ready = false;
  }

  private checkAllReady(): void {
    const allReady = Object.values(this.state.teams).every((team) =>
      team.players.every((p) => p.ready || !p.connected)
    );

    if (allReady) {
      if (this.state.phase === 'shopping') {
        this.transitionToPlanning();
        // Auto-commit in planning for simplicity — players already placed during shopping
        this.transitionToCommitted();
      } else if (this.state.phase === 'planning') {
        this.transitionToCommitted();
      }
    }
  }

  // ── Utilities ──

  private findPlayer(playerId: string): Player | undefined {
    for (const team of Object.values(this.state.teams)) {
      const p = team.players.find((p) => p.id === playerId);
      if (p) return p;
    }
    return undefined;
  }

  private broadcastPhaseChange(): void {
    this.enqueueMessage({
      type: 'phase_change',
      payload: { phase: this.state.phase, roundNumber: this.state.roundNumber },
      timestamp: Date.now(),
    });
  }

  private enqueueMessage(msg: ServerMessage): void {
    this.messageQueue.push(msg);
  }

  /** Drain all pending messages. */
  drainMessages(): ServerMessage[] {
    const msgs = [...this.messageQueue];
    this.messageQueue = [];
    return msgs;
  }

  getState(): MatchState {
    return { ...this.state };
  }

  getConfig(): MatchConfig {
    return { ...this.config };
  }
}
