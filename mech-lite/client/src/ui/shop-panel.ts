import { UnitTypeId, UpgradeId, Economy } from '../../../shared/src/types';
import { UNIT_DEFINITIONS, UPGRADE_DEFINITIONS, ECONOMY_CONSTANTS } from '../../../shared/src/config';

/**
 * Shop panel data logic (non-Phaser).
 * Used by GameScene to determine what's available and affordable.
 */
export interface ShopItem {
  id: string;
  type: 'unit' | 'upgrade' | 'unlock';
  name: string;
  cost: number;
  description: string;
  tier?: number;
  affordable: boolean;
  available: boolean;
}

export function getAvailableShopItems(economy: Economy, purchasedUpgrades: UpgradeId[]): ShopItem[] {
  const items: ShopItem[] = [];

  // Units that can be bought (already unlocked)
  for (const unitId of economy.unlockedUnits) {
    const def = UNIT_DEFINITIONS[unitId];
    items.push({
      id: unitId,
      type: 'unit',
      name: def.name,
      cost: def.cost,
      description: def.description,
      tier: def.tier,
      affordable: economy.currency >= def.cost,
      available: true,
    });
  }

  // Units that can be unlocked
  const allUnits: UnitTypeId[] = ['crawler', 'mustang', 'arclight', 'marksman', 'sledgehammer', 'vulcan', 'rhino'];
  for (const unitId of allUnits) {
    if (economy.unlockedUnits.includes(unitId)) continue;
    const unlockCost = (ECONOMY_CONSTANTS.UNLOCK_COSTS as Record<string, number>)[unitId];
    if (!unlockCost) continue;
    const def = UNIT_DEFINITIONS[unitId];
    items.push({
      id: unitId,
      type: 'unlock',
      name: `Unlock ${def.name}`,
      cost: unlockCost,
      description: def.description,
      tier: def.tier,
      affordable: economy.currency >= unlockCost,
      available: true,
    });
  }

  // Upgrades
  const allUpgrades: UpgradeId[] = ['damage_1', 'armor_1', 'hp_1', 'range_1', 'speed_1'];
  for (const upId of allUpgrades) {
    if (purchasedUpgrades.includes(upId)) continue;
    const def = UPGRADE_DEFINITIONS[upId];
    items.push({
      id: upId,
      type: 'upgrade',
      name: def.name,
      cost: def.cost,
      description: def.description,
      affordable: economy.currency >= def.cost,
      available: true,
    });
  }

  return items;
}

export function getUnitTooltip(unitId: UnitTypeId): string {
  const def = UNIT_DEFINITIONS[unitId];
  const s = def.stats;
  return [
    `${def.name} (Tier ${def.tier})`,
    `${def.description}`,
    ``,
    `HP: ${s.hp}  Armor: ${s.armor}`,
    `Damage: ${s.damage}  AtkSpd: ${s.attackSpeed}/s`,
    `Range: ${s.range}  Speed: ${s.moveSpeed}`,
    `Targeting: ${s.targetingType}`,
    `Cost: ${def.cost}`,
  ].join('\n');
}
