// Shared types for Mechabellum Lite

// ── Unit Definitions ──

export type UnitTypeId =
  | 'crawler'
  | 'mustang'
  | 'arclight'
  | 'marksman'
  | 'sledgehammer'
  | 'vulcan'
  | 'rhino';

export type UnitTier = 1 | 2 | 3;

export type TargetingType = 'nearest' | 'highest_hp' | 'lowest_hp' | 'prefer_large' | 'prefer_small';

export interface UnitStats {
  hp: number;
  armor: number;
  damage: number;
  attackSpeed: number; // attacks per second
  range: number; // grid units
  moveSpeed: number; // grid units per second
  targetingType: TargetingType;
}

export interface UnitDefinition {
  id: UnitTypeId;
  name: string;
  tier: UnitTier;
  cost: number;
  stats: UnitStats;
  description: string;
  size: number; // 1 = small, 2 = medium, 3 = large
}

// ── Board / Placement ──

export interface Position {
  x: number;
  y: number;
}

export interface PlacedUnit {
  instanceId: string;
  typeId: UnitTypeId;
  position: Position;
  facing: number; // radians, 0 = right
  targetingOverride?: TargetingType;
  owner: TeamId;
  playerId: string;
}

// ── Teams & Players ──

export type TeamId = 'team1' | 'team2';

export interface Player {
  id: string;
  name: string;
  team: TeamId;
  isBot: boolean;
  ready: boolean;
  connected: boolean;
  deploymentZone?: 'left' | 'right'; // co-op zone assignment
}

// ── Economy ──

export interface Economy {
  currency: number;
  income: number;
  unlockedUnits: UnitTypeId[];
}

// ── Shop ──

export interface ShopAction {
  type: 'buy_unit' | 'unlock_unit' | 'buy_upgrade';
  unitTypeId?: UnitTypeId;
  upgradeId?: string;
}

// ── Upgrade system ──

export type UpgradeId = 'damage_1' | 'armor_1' | 'speed_1' | 'range_1' | 'hp_1';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  cost: number;
  appliesTo: UnitTypeId | 'all';
  statModifier: Partial<UnitStats>;
  description: string;
}

// ── Round / Match State ──

export type MatchPhase = 'lobby' | 'shopping' | 'planning' | 'committed' | 'combat' | 'results' | 'finished';

export interface RoundInputSnapshot {
  roundNumber: number;
  placements: PlacedUnit[];
  shopActions: ShopAction[];
  timestamp: number;
}

export interface TeamState {
  teamId: TeamId;
  players: Player[];
  economy: Economy;
  placements: PlacedUnit[];
  purchasedUpgrades: UpgradeId[];
  score: number;
  baseHp: number;
}

export interface MatchState {
  matchId: string;
  phase: MatchPhase;
  roundNumber: number;
  maxRounds: number;
  targetScore: number;
  teams: Record<TeamId, TeamState>;
  battleLog?: BattleEvent[];
  winner?: TeamId;
}

export interface MatchConfig {
  mode: 'coop' | '1v1';
  maxRounds: number;
  targetScore: number;
  startingCurrency: number;
  incomePerRound: number;
  incomeScaling: number;
  planningTimeSeconds: number;
  boardWidth: number;
  boardHeight: number;
}

// ── Combat Simulation ──

export interface CombatUnit {
  instanceId: string;
  typeId: UnitTypeId;
  owner: TeamId;
  position: Position;
  facing: number;
  hp: number;
  maxHp: number;
  armor: number;
  damage: number;
  attackSpeed: number;
  range: number;
  moveSpeed: number;
  targetingType: TargetingType;
  attackCooldown: number;
  targetId?: string;
  alive: boolean;
  size: number;
}

export interface CombatState {
  tick: number;
  units: CombatUnit[];
  events: BattleEvent[];
  finished: boolean;
  winner?: TeamId;
}

// ── Battle Events ──

export type BattleEventType =
  | 'combat_start'
  | 'unit_move'
  | 'unit_attack'
  | 'unit_damage'
  | 'unit_death'
  | 'combat_end'
  | 'round_result';

export interface BattleEvent {
  tick: number;
  type: BattleEventType;
  data: Record<string, unknown>;
}

// ── Networking ──

export type ClientMessageType =
  | 'join_match'
  | 'place_unit'
  | 'remove_unit'
  | 'move_unit'
  | 'shop_action'
  | 'set_targeting'
  | 'ready_up'
  | 'unready'
  | 'request_state'
  | 'chat';

export interface ClientMessage {
  type: ClientMessageType;
  payload: Record<string, unknown>;
  timestamp: number;
}

export type ServerMessageType =
  | 'match_state'
  | 'phase_change'
  | 'player_joined'
  | 'player_left'
  | 'player_ready'
  | 'combat_events'
  | 'round_result'
  | 'error'
  | 'chat';

export interface ServerMessage {
  type: ServerMessageType;
  payload: Record<string, unknown>;
  timestamp: number;
}
