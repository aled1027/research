import { describe, it, expect } from 'vitest';
import { BotAI } from '../server/src/ai/bot-ai';
import { Economy, PlacedUnit, UnitTypeId } from '../shared/src/types';
import { ECONOMY_CONSTANTS, BOARD_CONSTANTS, UNIT_DEFINITIONS } from '../shared/src/config';

function makeEconomy(currency: number, unlocked: UnitTypeId[] = ['crawler', 'mustang']): Economy {
  return {
    currency,
    income: 150,
    unlockedUnits: unlocked,
  };
}

describe('BotAI', () => {
  it('should generate a valid plan for early rounds', () => {
    const bot = new BotAI('team2', 'bot_1', 'medium', 42);
    const economy = makeEconomy(300);
    const plan = bot.generatePlan(1, economy, [], []);

    expect(plan.placements.length).toBeGreaterThan(0);
    expect(plan.shopActions.length).toBeGreaterThan(0);

    // All placements should be in team2 deploy zone
    for (const p of plan.placements) {
      expect(p.position.y).toBeGreaterThanOrEqual(BOARD_CONSTANTS.TEAM2_DEPLOY_MIN_Y);
      expect(p.position.y).toBeLessThanOrEqual(BOARD_CONSTANTS.TEAM2_DEPLOY_MAX_Y);
    }
  });

  it('should respect budget constraints', () => {
    const bot = new BotAI('team2', 'bot_1', 'medium', 42);
    const economy = makeEconomy(100); // Very low budget

    const plan = bot.generatePlan(1, economy, [], []);

    // Total cost of purchased units should not exceed budget
    let totalCost = 0;
    for (const action of plan.shopActions) {
      if (action.type === 'buy_unit' && action.unitTypeId) {
        totalCost += UNIT_DEFINITIONS[action.unitTypeId].cost;
      }
    }
    expect(totalCost).toBeLessThanOrEqual(economy.currency);
  });

  it('should unlock units in mid-game', () => {
    const bot = new BotAI('team2', 'bot_1', 'medium', 42);
    const economy = makeEconomy(500);

    const plan = bot.generatePlan(4, economy, [], []);

    // Mid-game bot should try to unlock tier 2 units
    const unlockActions = plan.shopActions.filter((a) => a.type === 'unlock_unit');
    expect(unlockActions.length).toBeGreaterThan(0);
  });

  it('should produce deterministic results with same seed', () => {
    const bot1 = new BotAI('team2', 'bot_1', 'medium', 42);
    const bot2 = new BotAI('team2', 'bot_1', 'medium', 42);
    const economy = makeEconomy(300);

    const plan1 = bot1.generatePlan(1, economy, [], []);
    const plan2 = bot2.generatePlan(1, economy, [], []);

    expect(plan1.placements.length).toBe(plan2.placements.length);
    for (let i = 0; i < plan1.placements.length; i++) {
      expect(plan1.placements[i].typeId).toBe(plan2.placements[i].typeId);
    }
  });

  it('should scale difficulty appropriately', () => {
    const easyBot = new BotAI('team2', 'bot_easy', 'easy', 42);
    const hardBot = new BotAI('team2', 'bot_hard', 'hard', 42);
    const economy = makeEconomy(500, ['crawler', 'mustang', 'arclight', 'marksman', 'sledgehammer']);

    const easyPlan = easyBot.generatePlan(4, economy, [], []);
    const hardPlan = hardBot.generatePlan(4, economy, [], []);

    // Hard bot should have a different composition than easy
    const easyTypes = easyPlan.placements.map((p) => p.typeId).sort();
    const hardTypes = hardPlan.placements.map((p) => p.typeId).sort();

    // They use different templates so compositions should differ
    expect(easyTypes).not.toEqual(hardTypes);
  });

  it('should buy upgrades in later rounds on medium/hard', () => {
    const bot = new BotAI('team2', 'bot_1', 'medium', 42);
    const economy = makeEconomy(1000);

    const plan = bot.generatePlan(4, economy, [], []);

    expect(plan.upgrades.length).toBeGreaterThan(0);
  });

  it('should not buy upgrades on easy difficulty', () => {
    const bot = new BotAI('team2', 'bot_1', 'easy', 42);
    const economy = makeEconomy(600);

    const plan = bot.generatePlan(4, economy, [], []);

    expect(plan.upgrades.length).toBe(0);
  });
});
