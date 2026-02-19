// Reinforcement cards system - presented between rounds
// Cards provide global buffs, free units, or special abilities

const CARD_RARITY = {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
};

const CARD_RARITY_COLORS = {
    common: '#88aacc',
    rare: '#ffcc44',
    epic: '#cc66ff',
};

const CARD_DEFS = [
    // Common cards
    {
        id: 'supply_boost',
        name: 'Supply Cache',
        description: '+100 bonus supply this round',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.playerSupply += 100; },
    },
    {
        id: 'extra_deploy',
        name: 'Logistics Support',
        description: '+2 deployment slots this round',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.maxDeploys += 2; },
    },
    {
        id: 'free_fang',
        name: 'Fang Reinforcement',
        description: 'Free Fang squad deployed',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.freeUnits.push('fang'); },
    },
    {
        id: 'free_crawler',
        name: 'Crawler Swarm',
        description: 'Free Crawler squad deployed',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.freeUnits.push('crawler'); },
    },
    {
        id: 'minor_hp_buff',
        name: 'Reinforced Plating',
        description: 'All your units get +10% HP',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.globalBuffs.hpMult = (state.globalBuffs.hpMult || 1) * 1.1; },
    },
    {
        id: 'minor_dmg_buff',
        name: 'Ammo Upgrade',
        description: 'All your units get +10% damage',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.globalBuffs.attackMult = (state.globalBuffs.attackMult || 1) * 1.1; },
    },
    {
        id: 'minor_speed_buff',
        name: 'Engine Boost',
        description: 'All your units get +15% speed',
        rarity: CARD_RARITY.COMMON,
        effect: (state) => { state.globalBuffs.speedMult = (state.globalBuffs.speedMult || 1) * 1.15; },
    },
    // Rare cards
    {
        id: 'supply_boom',
        name: 'War Bonds',
        description: '+250 bonus supply this round',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.playerSupply += 250; },
    },
    {
        id: 'free_mustang',
        name: 'Mustang Division',
        description: 'Free Mustang squad deployed',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.freeUnits.push('mustang'); },
    },
    {
        id: 'free_phoenix',
        name: 'Air Strike Package',
        description: 'Free Phoenix squad deployed',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.freeUnits.push('phoenix'); },
    },
    {
        id: 'hp_buff',
        name: 'Titan Alloy',
        description: 'All your units get +25% HP',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.globalBuffs.hpMult = (state.globalBuffs.hpMult || 1) * 1.25; },
    },
    {
        id: 'dmg_buff',
        name: 'Weapons Lab',
        description: 'All your units get +25% damage',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.globalBuffs.attackMult = (state.globalBuffs.attackMult || 1) * 1.25; },
    },
    {
        id: 'range_buff',
        name: 'Advanced Targeting',
        description: 'All your units get +20% range',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.globalBuffs.rangeMult = (state.globalBuffs.rangeMult || 1) * 1.2; },
    },
    {
        id: 'base_repair',
        name: 'Emergency Repair',
        description: 'Restore 5 base HP',
        rarity: CARD_RARITY.RARE,
        effect: (state) => { state.playerHP = Math.min(STARTING_HP, state.playerHP + 5); },
    },
    // Epic cards
    {
        id: 'free_fortress',
        name: 'Fortress Drop',
        description: 'Free Fortress deployed!',
        rarity: CARD_RARITY.EPIC,
        effect: (state) => { state.freeUnits.push('fortress'); },
    },
    {
        id: 'free_overlord',
        name: 'Overlord Arrival',
        description: 'Free Overlord deployed!',
        rarity: CARD_RARITY.EPIC,
        effect: (state) => { state.freeUnits.push('overlord'); },
    },
    {
        id: 'mega_supply',
        name: 'War Chest',
        description: '+500 bonus supply this round',
        rarity: CARD_RARITY.EPIC,
        effect: (state) => { state.playerSupply += 500; },
    },
    {
        id: 'double_deploy',
        name: 'Mass Mobilization',
        description: '+4 deployment slots this round',
        rarity: CARD_RARITY.EPIC,
        effect: (state) => { state.maxDeploys += 4; },
    },
    {
        id: 'mega_buff',
        name: 'Experimental Tech',
        description: 'All units: +20% HP, damage, and speed',
        rarity: CARD_RARITY.EPIC,
        effect: (state) => {
            state.globalBuffs.hpMult = (state.globalBuffs.hpMult || 1) * 1.2;
            state.globalBuffs.attackMult = (state.globalBuffs.attackMult || 1) * 1.2;
            state.globalBuffs.speedMult = (state.globalBuffs.speedMult || 1) * 1.2;
        },
    },
];

// Pick N random cards with rarity weighting
function pickCards(count, round) {
    const weights = {
        [CARD_RARITY.COMMON]: Math.max(1, 60 - round * 5),
        [CARD_RARITY.RARE]: 25 + round * 3,
        [CARD_RARITY.EPIC]: 5 + round * 2,
    };

    const pool = [];
    for (const card of CARD_DEFS) {
        const w = weights[card.rarity] || 10;
        for (let i = 0; i < w; i++) {
            pool.push(card);
        }
    }

    const picked = [];
    const usedIds = new Set();

    while (picked.length < count && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        const card = pool[idx];
        if (!usedIds.has(card.id)) {
            picked.push(card);
            usedIds.add(card.id);
        }
        pool.splice(idx, 1);
    }

    return picked;
}
