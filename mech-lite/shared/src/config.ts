import {
  UnitDefinition,
  UnitTypeId,
  MatchConfig,
  UpgradeDefinition,
  UpgradeId,
} from './types';

// ── Unit Definitions ──

export const UNIT_DEFINITIONS: Record<UnitTypeId, UnitDefinition> = {
  // Tier 1
  crawler: {
    id: 'crawler',
    name: 'Crawler',
    tier: 1,
    cost: 50,
    size: 1,
    description: 'Swarm melee unit. Cheap and fast, overwhelms in numbers.',
    stats: {
      hp: 40,
      armor: 0,
      damage: 8,
      attackSpeed: 1.5,
      range: 1.2,
      moveSpeed: 4.0,
      targetingType: 'nearest',
    },
  },
  mustang: {
    id: 'mustang',
    name: 'Mustang',
    tier: 1,
    cost: 100,
    size: 1,
    description: 'Light ranged DPS. Versatile and cheap.',
    stats: {
      hp: 60,
      armor: 1,
      damage: 12,
      attackSpeed: 1.2,
      range: 6.0,
      moveSpeed: 2.5,
      targetingType: 'nearest',
    },
  },

  // Tier 2
  arclight: {
    id: 'arclight',
    name: 'Arclight',
    tier: 2,
    cost: 200,
    size: 2,
    description: 'Chain control unit. Damages and slows groups.',
    stats: {
      hp: 120,
      armor: 2,
      damage: 18,
      attackSpeed: 0.8,
      range: 5.0,
      moveSpeed: 2.0,
      targetingType: 'nearest',
    },
  },
  marksman: {
    id: 'marksman',
    name: 'Marksman',
    tier: 2,
    cost: 250,
    size: 2,
    description: 'Single-target sniper. Prioritizes high-HP targets.',
    stats: {
      hp: 80,
      armor: 1,
      damage: 45,
      attackSpeed: 0.5,
      range: 10.0,
      moveSpeed: 1.5,
      targetingType: 'highest_hp',
    },
  },
  sledgehammer: {
    id: 'sledgehammer',
    name: 'Sledgehammer',
    tier: 2,
    cost: 250,
    size: 2,
    description: 'AoE artillery. Devastating against clusters.',
    stats: {
      hp: 100,
      armor: 2,
      damage: 35,
      attackSpeed: 0.4,
      range: 8.0,
      moveSpeed: 1.2,
      targetingType: 'prefer_small',
    },
  },

  // Tier 3
  vulcan: {
    id: 'vulcan',
    name: 'Vulcan',
    tier: 3,
    cost: 400,
    size: 3,
    description: 'Anti-swarm anchor. High rate of fire, area denial.',
    stats: {
      hp: 200,
      armor: 4,
      damage: 10,
      attackSpeed: 3.0,
      range: 5.0,
      moveSpeed: 1.0,
      targetingType: 'prefer_small',
    },
  },
  rhino: {
    id: 'rhino',
    name: 'Rhino',
    tier: 3,
    cost: 450,
    size: 3,
    description: 'Siege frontliner. Heavy armor and high HP.',
    stats: {
      hp: 350,
      armor: 6,
      damage: 25,
      attackSpeed: 0.7,
      range: 2.0,
      moveSpeed: 1.8,
      targetingType: 'nearest',
    },
  },
};

// ── Upgrade Definitions ──

export const UPGRADE_DEFINITIONS: Record<UpgradeId, UpgradeDefinition> = {
  damage_1: {
    id: 'damage_1',
    name: 'Damage Boost I',
    cost: 150,
    appliesTo: 'all',
    statModifier: { damage: 5 },
    description: '+5 damage to all units',
  },
  armor_1: {
    id: 'armor_1',
    name: 'Armor Plating I',
    cost: 150,
    appliesTo: 'all',
    statModifier: { armor: 2 },
    description: '+2 armor to all units',
  },
  speed_1: {
    id: 'speed_1',
    name: 'Overcharge Engines I',
    cost: 100,
    appliesTo: 'all',
    statModifier: { moveSpeed: 0.5 },
    description: '+0.5 move speed to all units',
  },
  range_1: {
    id: 'range_1',
    name: 'Extended Optics I',
    cost: 150,
    appliesTo: 'all',
    statModifier: { range: 1.0 },
    description: '+1 range to all units',
  },
  hp_1: {
    id: 'hp_1',
    name: 'Reinforced Chassis I',
    cost: 200,
    appliesTo: 'all',
    statModifier: { hp: 20 },
    description: '+20 HP to all units',
  },
};

// ── Match Config Defaults ──

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  mode: 'coop',
  maxRounds: 7,
  targetScore: 4,
  startingCurrency: 300,
  incomePerRound: 150,
  incomeScaling: 1.15,
  planningTimeSeconds: 60,
  boardWidth: 24,
  boardHeight: 16,
};

// ── Combat Constants ──

export const COMBAT_CONSTANTS = {
  TICK_RATE: 20, // ticks per second
  TICK_DURATION: 1 / 20, // seconds per tick
  MAX_TICKS: 2000, // 100 seconds max combat
  AoE_RADIUS: 2.0, // for splash units like sledgehammer
  CHAIN_RANGE: 3.0, // for chain units like arclight
  CHAIN_TARGETS: 3, // max chain bounces
  BASE_DAMAGE_ON_WIN: 1, // score gained per round win
  OVERKILL_BONUS_DIVISOR: 200, // remaining HP / this = bonus score
};

// ── Board Constants ──

export const BOARD_CONSTANTS = {
  TEAM1_DEPLOY_MIN_Y: 0,
  TEAM1_DEPLOY_MAX_Y: 6,
  TEAM2_DEPLOY_MIN_Y: 10,
  TEAM2_DEPLOY_MAX_Y: 16,
  COOP_LEFT_ZONE_MAX_X: 12,
  COOP_RIGHT_ZONE_MIN_X: 12,
};

// ── Economy Constants ──

export const ECONOMY_CONSTANTS = {
  STARTING_UNLOCKED: ['crawler', 'mustang'] as UnitTypeId[],
  UNLOCK_COSTS: {
    arclight: 150,
    marksman: 200,
    sledgehammer: 200,
    vulcan: 350,
    rhino: 350,
  } as Partial<Record<UnitTypeId, number>>,
};
