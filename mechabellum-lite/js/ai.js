// AI opponent logic for Mechabellum Lite

class MechabellumAI {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.preferredUnits = [];
        this.strategy = this.pickStrategy();
    }

    pickStrategy() {
        const strategies = ['swarm', 'heavy', 'balanced', 'air', 'sniper'];
        return strategies[Math.floor(Math.random() * strategies.length)];
    }

    // Decide what to deploy given current supply and round info
    makeDeploymentDecisions(supply, round, existingUnits, playerUnits) {
        const decisions = [];
        let remainingSupply = supply;

        // Determine how many new squads to deploy (up to MAX_NEW_DEPLOYMENTS)
        const maxDeploys = MAX_NEW_DEPLOYMENTS;

        // Strategy-based unit preferences
        const unitPrefs = this.getUnitPreferences(round, playerUnits);

        for (let i = 0; i < maxDeploys && remainingSupply >= 100; i++) {
            // Pick a unit we can afford
            const affordable = unitPrefs.filter(u => UNIT_DEFS[u].cost <= remainingSupply);
            if (affordable.length === 0) break;

            // Weighted random selection (prefer earlier in list)
            const weights = affordable.map((_, idx) => Math.max(1, affordable.length - idx));
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let roll = Math.random() * totalWeight;
            let chosen = affordable[0];
            for (let j = 0; j < affordable.length; j++) {
                roll -= weights[j];
                if (roll <= 0) {
                    chosen = affordable[j];
                    break;
                }
            }

            const def = UNIT_DEFS[chosen];
            remainingSupply -= def.cost;

            // Pick a grid position (enemy side: rows 0-4, mirrored so row 0 is their back)
            const row = Math.floor(Math.random() * 5); // rows 0-4 for enemy
            const col = 1 + Math.floor(Math.random() * 14); // avoid extreme edges usually

            decisions.push({
                unitType: chosen,
                gridCol: col,
                gridRow: row,
            });
        }

        // Spend remaining on tech upgrades for existing units
        const techDecisions = this.pickTechUpgrades(remainingSupply, existingUnits);

        return { deployments: decisions, techs: techDecisions, supplySpent: supply - remainingSupply };
    }

    getUnitPreferences(round, playerUnits) {
        // Analyze player units to counter
        const playerHasSwarm = playerUnits.some(u => u.def.count >= 10);
        const playerHasGiant = playerUnits.some(u => u.def.size === SIZE.GIANT);
        const playerHasAir = playerUnits.some(u => u.def.moveType === MOVE_TYPE.AIR);

        let prefs = [];

        switch (this.strategy) {
            case 'swarm':
                prefs = ['crawler', 'fang', 'mustang', 'wasp', 'steelball'];
                if (round >= 3) prefs.push('stormcaller', 'arclight');
                if (round >= 5) prefs.push('vulcan');
                break;
            case 'heavy':
                prefs = ['sledgehammer', 'steelball', 'arclight'];
                if (round >= 2) prefs.push('fang', 'mustang');
                if (round >= 4) prefs.push('fortress', 'meltingpoint');
                break;
            case 'air':
                prefs = ['wasp', 'fang', 'mustang'];
                if (round >= 3) prefs.push('phoenix', 'overlord');
                if (round >= 2) prefs.push('arclight');
                break;
            case 'sniper':
                prefs = ['fang', 'mustang', 'marksman'];
                if (round >= 3) prefs.push('stormcaller', 'meltingpoint');
                if (round >= 2) prefs.push('sledgehammer');
                break;
            default: // balanced
                prefs = ['fang', 'mustang', 'crawler'];
                if (round >= 2) prefs.push('arclight', 'steelball', 'sledgehammer');
                if (round >= 3) prefs.push('stormcaller', 'phoenix', 'marksman');
                if (round >= 5) prefs.push('vulcan', 'meltingpoint', 'fortress', 'overlord');
                break;
        }

        // Counter-picks
        if (playerHasSwarm && !prefs.includes('vulcan') && round >= 4) {
            prefs.unshift('vulcan');
        }
        if (playerHasSwarm && !prefs.includes('stormcaller') && round >= 2) {
            prefs.unshift('stormcaller');
        }
        if (playerHasGiant && !prefs.includes('meltingpoint') && round >= 4) {
            prefs.unshift('meltingpoint');
        }
        if (playerHasGiant && !prefs.includes('marksman')) {
            prefs.unshift('marksman');
        }
        if (playerHasAir && !prefs.includes('fang')) {
            prefs.unshift('fang');
        }
        if (playerHasAir && !prefs.includes('mustang')) {
            prefs.unshift('mustang');
        }

        return prefs;
    }

    pickTechUpgrades(supply, existingUnits) {
        const techs = [];
        let remaining = supply;

        // Sort units by cost (upgrade expensive ones first)
        const sortedUnits = [...existingUnits].sort((a, b) => b.def.cost - a.def.cost);

        for (const unit of sortedUnits) {
            for (let i = 0; i < unit.def.techs.length; i++) {
                if (unit.appliedTechs.includes(i)) continue;
                const tech = unit.def.techs[i];
                if (tech.cost <= remaining && Math.random() > 0.4) {
                    techs.push({ unitId: unit.id, techIndex: i });
                    remaining -= tech.cost;
                }
            }
        }

        return techs;
    }
}
