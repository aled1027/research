// Unit definitions for Mechabellum Lite
// Stats are balanced for gameplay, inspired by the original

const UNIT_DEFS = {
    crawler: {
        name: 'Crawler',
        cost: 100,
        tier: 1,
        count: 24,        // units per squad
        hp: 28,           // per unit
        attack: 12,
        attackInterval: 0.8,
        range: 30,        // melee range (pixels)
        speed: 2.8,
        splashRadius: 0,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.SMALL,
        color: 0x88aa44,
        description: 'Fast melee swarm. Overwhelms single targets.',
        shape: 'triangle',
        techs: [
            { name: 'Frenzy', description: '+40% attack speed', cost: 100, effect: { attackIntervalMult: 0.6 } },
            { name: 'Armor Plating', description: '+60% HP', cost: 100, effect: { hpMult: 1.6 } },
        ]
    },
    fang: {
        name: 'Fang',
        cost: 100,
        tier: 1,
        count: 16,
        hp: 45,
        attack: 14,
        attackInterval: 1.0,
        range: 180,
        speed: 1.2,
        splashRadius: 0,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.BOTH,
        size: SIZE.SMALL,
        color: 0x6688cc,
        description: 'Basic ranged infantry. Versatile and cheap.',
        shape: 'square',
        techs: [
            { name: 'Rapid Fire', description: '+30% attack speed', cost: 100, effect: { attackIntervalMult: 0.7 } },
            { name: 'Long Range', description: '+40% range', cost: 100, effect: { rangeMult: 1.4 } },
        ]
    },
    mustang: {
        name: 'Mustang',
        cost: 200,
        tier: 1,
        count: 8,
        hp: 85,
        attack: 28,
        attackInterval: 1.2,
        range: 220,
        speed: 2.6,
        splashRadius: 0,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.BOTH,
        size: SIZE.SMALL,
        color: 0xccaa44,
        description: 'Fast light tank. Good all-rounder.',
        shape: 'diamond',
        techs: [
            { name: 'Missile Barrage', description: 'Splash damage (20px)', cost: 150, effect: { splashRadius: 20 } },
            { name: 'Turbo Engine', description: '+50% speed', cost: 150, effect: { speedMult: 1.5 } },
        ]
    },
    arclight: {
        name: 'Arclight',
        cost: 200,
        tier: 2,
        count: 6,
        hp: 130,
        attack: 35,
        attackInterval: 1.5,
        range: 200,
        speed: 1.4,
        splashRadius: 30,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.MEDIUM,
        color: 0x44cccc,
        description: 'Energy beam. Good crowd control vs light units.',
        shape: 'hexagon',
        techs: [
            { name: 'Chain Lightning', description: '+50% splash radius', cost: 200, effect: { splashRadiusMult: 1.5 } },
            { name: 'Overcharge', description: '+50% damage', cost: 200, effect: { attackMult: 1.5 } },
        ]
    },
    steelball: {
        name: 'Steel Ball',
        cost: 200,
        tier: 2,
        count: 6,
        hp: 200,
        attack: 40,
        attackInterval: 1.0,
        range: 60,
        speed: 2.6,
        splashRadius: 0,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.MEDIUM,
        color: 0xaaaaaa,
        description: 'High-speed laser bot. Shreds mobs at close range.',
        shape: 'circle',
        techs: [
            { name: 'Magnetic Shield', description: '+80% HP', cost: 200, effect: { hpMult: 1.8 } },
            { name: 'Laser Boost', description: '+60% damage', cost: 200, effect: { attackMult: 1.6 } },
        ]
    },
    sledgehammer: {
        name: 'Sledgehammer',
        cost: 300,
        tier: 2,
        count: 4,
        hp: 350,
        attack: 55,
        attackInterval: 2.0,
        range: 160,
        speed: 1.0,
        splashRadius: 25,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.MEDIUM,
        color: 0x888844,
        description: 'Heavy tank. Slow but tough with splash damage.',
        shape: 'square',
        techs: [
            { name: 'Heavy Armor', description: '+60% HP', cost: 200, effect: { hpMult: 1.6 } },
            { name: 'AP Rounds', description: '+70% damage', cost: 200, effect: { attackMult: 1.7 } },
        ]
    },
    stormcaller: {
        name: 'Stormcaller',
        cost: 300,
        tier: 2,
        count: 3,
        hp: 120,
        attack: 70,
        attackInterval: 3.0,
        range: 350,
        speed: 0.8,
        splashRadius: 50,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.MEDIUM,
        color: 0xcc6644,
        description: 'Artillery. Devastating long-range area damage.',
        shape: 'triangle',
        techs: [
            { name: 'Cluster Rockets', description: '+60% splash radius', cost: 250, effect: { splashRadiusMult: 1.6 } },
            { name: 'Incendiary', description: '+40% damage', cost: 250, effect: { attackMult: 1.4 } },
        ]
    },
    wasp: {
        name: 'Wasp',
        cost: 200,
        tier: 2,
        count: 8,
        hp: 55,
        attack: 22,
        attackInterval: 0.8,
        range: 160,
        speed: 2.8,
        splashRadius: 0,
        moveType: MOVE_TYPE.AIR,
        targetType: TARGET.BOTH,
        size: SIZE.SMALL,
        color: 0xcccc44,
        description: 'Swift light aircraft. Fast but fragile.',
        shape: 'triangle',
        techs: [
            { name: 'Evasion', description: '+50% HP (evasion)', cost: 150, effect: { hpMult: 1.5 } },
            { name: 'Strafing Run', description: '+40% attack speed', cost: 150, effect: { attackIntervalMult: 0.6 } },
        ]
    },
    phoenix: {
        name: 'Phoenix',
        cost: 300,
        tier: 3,
        count: 4,
        hp: 140,
        attack: 65,
        attackInterval: 1.8,
        range: 280,
        speed: 2.4,
        splashRadius: 0,
        moveType: MOVE_TYPE.AIR,
        targetType: TARGET.BOTH,
        size: SIZE.MEDIUM,
        color: 0xff6644,
        description: 'Strike aircraft. High DPS from range.',
        shape: 'diamond',
        techs: [
            { name: 'Napalm Bombs', description: 'Splash damage (30px)', cost: 250, effect: { splashRadius: 30 } },
            { name: 'Afterburner', description: '+40% speed, +30% range', cost: 250, effect: { speedMult: 1.4, rangeMult: 1.3 } },
        ]
    },
    marksman: {
        name: 'Marksman',
        cost: 300,
        tier: 3,
        count: 1,
        hp: 280,
        attack: 200,
        attackInterval: 2.5,
        range: 380,
        speed: 1.4,
        splashRadius: 0,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.BOTH,
        size: SIZE.LARGE,
        color: 0x44cc88,
        description: 'Sniper. Extreme range, huge single-target damage.',
        shape: 'diamond',
        techs: [
            { name: 'Piercing Shot', description: 'Hits 3 targets in line', cost: 250, effect: { pierce: 3 } },
            { name: 'Camo Netting', description: '+60% HP', cost: 250, effect: { hpMult: 1.6 } },
        ]
    },
    vulcan: {
        name: 'Vulcan',
        cost: 400,
        tier: 4,
        count: 1,
        hp: 800,
        attack: 45,
        attackInterval: 0.3,
        range: 100,
        speed: 1.0,
        splashRadius: 40,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.GIANT,
        color: 0xff4400,
        description: 'Giant flamethrower. Melts swarms in seconds.',
        shape: 'hexagon',
        techs: [
            { name: 'Inferno', description: '+40% splash, +20% damage', cost: 300, effect: { splashRadiusMult: 1.4, attackMult: 1.2 } },
            { name: 'Titan Armor', description: '+50% HP', cost: 300, effect: { hpMult: 1.5 } },
        ]
    },
    meltingpoint: {
        name: 'Melting Point',
        cost: 400,
        tier: 4,
        count: 1,
        hp: 650,
        attack: 180,
        attackInterval: 2.0,
        range: 320,
        speed: 1.0,
        splashRadius: 0,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.BOTH,
        size: SIZE.GIANT,
        color: 0xff0066,
        description: 'Giant laser. Obliterates high-HP targets.',
        shape: 'hexagon',
        techs: [
            { name: 'Beam Sweep', description: 'Splash damage (25px)', cost: 300, effect: { splashRadius: 25 } },
            { name: 'Focus Lens', description: '+50% damage, +20% range', cost: 300, effect: { attackMult: 1.5, rangeMult: 1.2 } },
        ]
    },
    fortress: {
        name: 'Fortress',
        cost: 500,
        tier: 4,
        count: 1,
        hp: 1200,
        attack: 120,
        attackInterval: 2.5,
        range: 280,
        speed: 0.8,
        splashRadius: 35,
        moveType: MOVE_TYPE.GROUND,
        targetType: TARGET.GROUND,
        size: SIZE.GIANT,
        color: 0x8866cc,
        description: 'Massive mech. Best all-around giant unit.',
        shape: 'hexagon',
        techs: [
            { name: 'Missile Salvo', description: '+60% splash, +30% damage', cost: 400, effect: { splashRadiusMult: 1.6, attackMult: 1.3 } },
            { name: 'Fortress Shield', description: '+40% HP', cost: 400, effect: { hpMult: 1.4 } },
        ]
    },
    overlord: {
        name: 'Overlord',
        cost: 500,
        tier: 4,
        count: 1,
        hp: 700,
        attack: 100,
        attackInterval: 2.0,
        range: 250,
        speed: 1.6,
        splashRadius: 45,
        moveType: MOVE_TYPE.AIR,
        targetType: TARGET.BOTH,
        size: SIZE.GIANT,
        color: 0xcc44cc,
        description: 'Giant aircraft. Devastating aerial splash damage.',
        shape: 'hexagon',
        techs: [
            { name: 'Carpet Bomb', description: '+50% splash radius', cost: 400, effect: { splashRadiusMult: 1.5 } },
            { name: 'Heavy Plating', description: '+50% HP', cost: 400, effect: { hpMult: 1.5 } },
        ]
    },
};

// Helper to get sorted unit list by cost
function getUnitList() {
    return Object.keys(UNIT_DEFS).sort((a, b) => UNIT_DEFS[a].cost - UNIT_DEFS[b].cost);
}

// Create a unit instance from a definition
function createUnitInstance(typeKey, owner, gridCol, gridRow) {
    const def = UNIT_DEFS[typeKey];
    if (!def) return null;

    return {
        type: typeKey,
        owner: owner, // 'player' or 'enemy'
        gridCol: gridCol,
        gridRow: gridRow,
        def: def,
        // Runtime stats (can be modified by techs)
        maxHp: def.hp,
        hp: def.hp,
        attack: def.attack,
        attackInterval: def.attackInterval,
        range: def.range,
        speed: def.speed,
        splashRadius: def.splashRadius,
        targetType: def.targetType,
        count: def.count,
        currentCount: def.count,
        // Tech upgrades applied
        appliedTechs: [],
        // Battle state
        attackCooldown: 0,
        targetId: null,
        isAlive: true,
    };
}

// Apply a tech upgrade to a unit instance
function applyTech(unit, techIndex) {
    const tech = unit.def.techs[techIndex];
    if (!tech || unit.appliedTechs.includes(techIndex)) return false;

    const effect = tech.effect;
    if (effect.hpMult) {
        unit.maxHp = Math.round(unit.maxHp * effect.hpMult);
        unit.hp = Math.round(unit.hp * effect.hpMult);
    }
    if (effect.attackMult) {
        unit.attack = Math.round(unit.attack * effect.attackMult);
    }
    if (effect.attackIntervalMult) {
        unit.attackInterval *= effect.attackIntervalMult;
    }
    if (effect.rangeMult) {
        unit.range = Math.round(unit.range * effect.rangeMult);
    }
    if (effect.speedMult) {
        unit.speed *= effect.speedMult;
    }
    if (effect.splashRadiusMult) {
        unit.splashRadius = Math.round(unit.splashRadius * effect.splashRadiusMult);
    }
    if (effect.splashRadius) {
        unit.splashRadius = effect.splashRadius;
    }
    if (effect.pierce) {
        unit.pierce = effect.pierce;
    }

    unit.appliedTechs.push(techIndex);
    return true;
}
