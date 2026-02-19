// Battle scene - handles auto-combat simulation
class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data) {
        this.round = data.round;
        this.playerHP = data.playerHP;
        this.enemyHP = data.enemyHP;
        this.difficulty = data.difficulty;
        this.playerSupply = data.playerSupply;
        this.enemySupply = data.enemySupply;
        this.unitIdCounter = data.unitIdCounter;
        this.totalPlayerSupply = data.totalPlayerSupply;
        this.totalEnemySupply = data.totalEnemySupply;
        this.globalBuffs = data.globalBuffs || {};

        // Deep clone units for battle (so originals aren't mutated)
        this.playerUnits = data.playerUnits.map(u => this.cloneUnit(u));
        this.enemyUnits = data.enemyUnits.map(u => this.cloneUnit(u));

        this.battleOver = false;
        this.battleSpeed = 1;
        this.projectiles = [];
        this.effects = [];
    }

    cloneUnit(unit) {
        const clone = { ...unit };
        clone.appliedTechs = [...unit.appliedTechs];
        // Set initial world position from grid
        clone.worldX = FIELD_X + unit.gridCol * CELL_WIDTH + CELL_WIDTH / 2;
        clone.worldY = FIELD_Y + unit.gridRow * CELL_HEIGHT + CELL_HEIGHT / 2;
        clone.targetId = null;
        clone.attackCooldown = Math.random() * unit.attackInterval * 0.5; // stagger initial attacks
        clone.isAlive = true;
        clone.currentCount = unit.currentCount || unit.count || unit.def.count;
        clone.totalSquadHp = clone.hp * clone.currentCount;
        clone.maxTotalSquadHp = clone.maxHp * clone.currentCount;
        return clone;
    }

    create() {
        // Background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x080812);

        // Draw battlefield grid (simplified)
        this.drawBattlefieldBg();

        // Create sprite groups
        this.unitSpriteMap = {};
        this.projectileSprites = [];

        // Spawn unit sprites
        this.spawnBattleUnits();

        // Top bar
        this.createBattleTopBar();

        // Speed controls
        this.createSpeedControls();

        // Start battle loop
        this.battleTimer = 0;
        this.maxBattleTime = 90; // seconds

        // Particles group for effects
        this.effectsGroup = this.add.group();
    }

    drawBattlefieldBg() {
        const gfx = this.add.graphics();

        // Subtle grid
        gfx.lineStyle(1, COLORS.GRID_LINE, 0.15);
        for (let col = 0; col <= GRID_COLS; col++) {
            gfx.lineBetween(FIELD_X + col * CELL_WIDTH, FIELD_Y, FIELD_X + col * CELL_WIDTH, FIELD_Y + FIELD_HEIGHT);
        }
        for (let row = 0; row <= GRID_ROWS; row++) {
            gfx.lineBetween(FIELD_X, FIELD_Y + row * CELL_HEIGHT, FIELD_X + FIELD_WIDTH, FIELD_Y + row * CELL_HEIGHT);
        }

        // Center divider
        gfx.lineStyle(1, 0x334455, 0.4);
        gfx.lineBetween(FIELD_X, FIELD_Y + 5 * CELL_HEIGHT, FIELD_X + FIELD_WIDTH, FIELD_Y + 5 * CELL_HEIGHT);

        // Zone colors
        gfx.fillStyle(COLORS.GRID_PLAYER, 0.15);
        gfx.fillRect(FIELD_X, FIELD_Y + 5 * CELL_HEIGHT, FIELD_WIDTH, 5 * CELL_HEIGHT);
        gfx.fillStyle(COLORS.GRID_ENEMY, 0.15);
        gfx.fillRect(FIELD_X, FIELD_Y, FIELD_WIDTH, 5 * CELL_HEIGHT);
    }

    spawnBattleUnits() {
        const allUnits = [...this.playerUnits, ...this.enemyUnits];

        for (const unit of allUnits) {
            const spriteName = `unit_${unit.type}_${unit.owner}`;
            const sprite = this.add.image(unit.worldX, unit.worldY, spriteName);

            // HP bar
            const hpBarWidth = 30;
            const hpBg = this.add.rectangle(unit.worldX, unit.worldY - 20, hpBarWidth, 4, 0x333333);
            const hpFill = this.add.rectangle(unit.worldX, unit.worldY - 20, hpBarWidth, 4,
                unit.owner === 'player' ? COLORS.PLAYER : COLORS.ENEMY);

            // Count text
            let countText = null;
            if (unit.currentCount > 1) {
                countText = this.add.text(unit.worldX + 12, unit.worldY + 10, `${unit.currentCount}`, {
                    fontSize: '9px', fontFamily: 'monospace', color: '#ffffff',
                    backgroundColor: '#00000088', padding: { x: 1, y: 0 },
                }).setOrigin(0.5);
            }

            this.unitSpriteMap[unit.id] = {
                sprite, hpBg, hpFill, countText,
                hpBarWidth,
            };
        }
    }

    createBattleTopBar() {
        // Background
        this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, COLORS.UI_BG, 0.9);

        // Round
        this.add.text(GAME_WIDTH / 2, 12, `ROUND ${this.round} - BATTLE`, {
            fontSize: '18px', fontFamily: 'monospace', color: '#ff8844', fontStyle: 'bold',
        }).setOrigin(0.5);

        // Timer
        this.timerText = this.add.text(GAME_WIDTH / 2, 40, '90s', {
            fontSize: '14px', fontFamily: 'monospace', color: '#88aacc',
        }).setOrigin(0.5);

        // Player HP
        this.add.text(20, 10, 'YOUR BASE', {
            fontSize: '11px', fontFamily: 'monospace', color: '#88aacc',
        });
        this.playerHPText = this.add.text(20, 28, `HP: ${this.playerHP}/${STARTING_HP}`, {
            fontSize: '14px', fontFamily: 'monospace', color: '#4488ff', fontStyle: 'bold',
        });

        // Player unit count
        this.playerCountText = this.add.text(20, 46, `Units: ${this.playerUnits.length}`, {
            fontSize: '11px', fontFamily: 'monospace', color: '#6699aa',
        });

        // Enemy HP
        this.add.text(GAME_WIDTH - 180, 10, 'ENEMY BASE', {
            fontSize: '11px', fontFamily: 'monospace', color: '#cc8888',
        });
        this.enemyHPText = this.add.text(GAME_WIDTH - 180, 28, `HP: ${this.enemyHP}/${STARTING_HP}`, {
            fontSize: '14px', fontFamily: 'monospace', color: '#ff4444', fontStyle: 'bold',
        });

        // Enemy unit count
        this.enemyCountText = this.add.text(GAME_WIDTH - 180, 46, `Units: ${this.enemyUnits.length}`, {
            fontSize: '11px', fontFamily: 'monospace', color: '#aa6666',
        });
    }

    createSpeedControls() {
        const y = FIELD_Y + FIELD_HEIGHT + 30;

        this.add.text(GAME_WIDTH / 2 - 100, y, 'Speed:', {
            fontSize: '14px', fontFamily: 'monospace', color: '#88aacc',
        });

        const speeds = [1, 2, 4];
        speeds.forEach((spd, i) => {
            const btn = this.add.rectangle(GAME_WIDTH / 2 - 20 + i * 50, y + 8, 40, 24,
                spd === this.battleSpeed ? COLORS.UI_HIGHLIGHT : 0x1a2a3a
            ).setInteractive({ useHandCursor: true });

            const label = this.add.text(GAME_WIDTH / 2 - 20 + i * 50, y + 8, `${spd}x`, {
                fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.battleSpeed = spd;
                // Update button colors would need references stored
            });

            // Store for skip button reference
            if (i === 0) this.speedBtn1 = btn;
        });

        // Skip to end button
        const skipBtn = this.add.rectangle(GAME_WIDTH / 2 + 150, y + 8, 100, 24, 0x442244)
            .setInteractive({ useHandCursor: true });
        this.add.text(GAME_WIDTH / 2 + 150, y + 8, 'Skip >>>', {
            fontSize: '12px', fontFamily: 'monospace', color: '#cc88cc',
        }).setOrigin(0.5);
        skipBtn.on('pointerdown', () => {
            this.battleSpeed = 20;
        });
    }

    update(time, delta) {
        if (this.battleOver) return;

        const dt = (delta / 1000) * this.battleSpeed;
        this.battleTimer += dt;

        // Update timer display
        const remaining = Math.max(0, this.maxBattleTime - this.battleTimer);
        this.timerText.setText(`${Math.ceil(remaining)}s`);

        // Update all units
        this.updateUnits(dt);

        // Update projectiles
        this.updateProjectiles(dt);

        // Check win conditions
        this.checkBattleEnd();

        // Update unit counts
        const alivePlayer = this.playerUnits.filter(u => u.isAlive).length;
        const aliveEnemy = this.enemyUnits.filter(u => u.isAlive).length;
        this.playerCountText.setText(`Units: ${alivePlayer}`);
        this.enemyCountText.setText(`Units: ${aliveEnemy}`);

        // Time limit
        if (this.battleTimer >= this.maxBattleTime) {
            this.endBattle('draw');
        }
    }

    updateUnits(dt) {
        const allUnits = [...this.playerUnits, ...this.enemyUnits];

        for (const unit of allUnits) {
            if (!unit.isAlive) continue;

            // Cooldown always ticks down
            unit.attackCooldown -= dt;

            // Find target
            const enemies = unit.owner === 'player' ? this.enemyUnits : this.playerUnits;
            const target = this.findTarget(unit, enemies);

            if (target) {
                const dx = target.worldX - unit.worldX;
                const dy = target.worldY - unit.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= unit.range) {
                    // In range - attack
                    if (unit.attackCooldown <= 0) {
                        this.performAttack(unit, target, dist);
                        unit.attackCooldown = unit.attackInterval;
                    }
                } else {
                    // Move toward target
                    const moveSpeed = unit.speed * 30 * dt;
                    const moveX = (dx / dist) * moveSpeed;
                    const moveY = (dy / dist) * moveSpeed;
                    unit.worldX += moveX;
                    unit.worldY += moveY;
                }
            } else {
                // No target - move forward
                const direction = unit.owner === 'player' ? -1 : 1;
                unit.worldY += direction * unit.speed * 15 * dt;
            }

            // Clamp to field
            unit.worldX = Phaser.Math.Clamp(unit.worldX, FIELD_X + 10, FIELD_X + FIELD_WIDTH - 10);
            unit.worldY = Phaser.Math.Clamp(unit.worldY, FIELD_Y + 10, FIELD_Y + FIELD_HEIGHT - 10);
        }

        // Simple separation: push apart friendly units that are too close
        for (const unit of allUnits) {
            if (!unit.isAlive) continue;
            const allies = unit.owner === 'player' ? this.playerUnits : this.enemyUnits;
            for (const ally of allies) {
                if (ally === unit || !ally.isAlive) continue;
                const dx = unit.worldX - ally.worldX;
                const dy = unit.worldY - ally.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = 18;
                if (dist < minDist && dist > 0) {
                    const push = (minDist - dist) * 0.3;
                    unit.worldX += (dx / dist) * push;
                    unit.worldY += (dy / dist) * push;
                }
            }
        }

        // Update all sprites
        for (const unit of allUnits) {
            if (!unit.isAlive) continue;
            this.updateUnitSprite(unit);
        }
    }

    findTarget(unit, enemies) {
        let bestTarget = null;
        let bestDist = Infinity;

        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;

            // Check targeting type
            if (unit.targetType === TARGET.GROUND && enemy.def.moveType === MOVE_TYPE.AIR) continue;
            if (unit.targetType === TARGET.AIR && enemy.def.moveType === MOVE_TYPE.GROUND) continue;

            const dx = enemy.worldX - unit.worldX;
            const dy = enemy.worldY - unit.worldY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Prefer closest target
            if (dist < bestDist) {
                bestDist = dist;
                bestTarget = enemy;
            }
        }

        return bestTarget;
    }

    performAttack(attacker, target, dist) {
        const damage = attacker.attack;

        // Create projectile visual
        this.createProjectile(attacker, target, damage);

        // Direct damage (applied with slight delay for visual effect)
        this.time.delayedCall(Math.min(300, dist * 2) / this.battleSpeed, () => {
            if (!target.isAlive) return;

            // Apply damage to target
            this.applyDamage(target, damage, attacker);

            // Splash damage
            if (attacker.splashRadius > 0) {
                const enemies = attacker.owner === 'player' ? this.enemyUnits : this.playerUnits;
                for (const nearby of enemies) {
                    if (nearby === target || !nearby.isAlive) continue;
                    const ndx = nearby.worldX - target.worldX;
                    const ndy = nearby.worldY - target.worldY;
                    const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
                    if (ndist <= attacker.splashRadius) {
                        const splashDmg = Math.round(damage * (1 - ndist / attacker.splashRadius) * 0.7);
                        if (splashDmg > 0) {
                            this.applyDamage(nearby, splashDmg, attacker);
                        }
                    }
                }

                // Splash visual
                this.createExplosion(target.worldX, target.worldY, attacker.splashRadius);
            }

            // Pierce (Marksman tech)
            if (attacker.pierce && attacker.pierce > 1) {
                const enemies = attacker.owner === 'player' ? this.enemyUnits : this.playerUnits;
                let pierceCount = 1;
                const dx = target.worldX - attacker.worldX;
                const dy = target.worldY - attacker.worldY;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ndx = dx / len;
                const ndy = dy / len;

                for (const nearby of enemies) {
                    if (nearby === target || !nearby.isAlive || pierceCount >= attacker.pierce) continue;
                    // Check if roughly in line
                    const edx = nearby.worldX - attacker.worldX;
                    const edy = nearby.worldY - attacker.worldY;
                    const dot = edx * ndx + edy * ndy;
                    if (dot > 0) {
                        const perpDist = Math.abs(edx * ndy - edy * ndx);
                        if (perpDist < 30) {
                            this.applyDamage(nearby, Math.round(damage * 0.7), attacker);
                            pierceCount++;
                        }
                    }
                }
            }
        });
    }

    applyDamage(unit, damage, attacker) {
        if (!unit.isAlive) return;

        unit.totalSquadHp -= damage;

        // Calculate remaining individual units
        if (unit.totalSquadHp <= 0) {
            unit.totalSquadHp = 0;
            unit.currentCount = 0;
            unit.hp = 0;
            this.killUnit(unit);
        } else {
            // How many full units remain
            const newCount = Math.ceil(unit.totalSquadHp / unit.maxHp);
            if (newCount < unit.currentCount) {
                unit.currentCount = newCount;
                // Last unit gets remaining HP
                unit.hp = unit.totalSquadHp - (newCount - 1) * unit.maxHp;
            } else {
                unit.hp = unit.totalSquadHp - (unit.currentCount - 1) * unit.maxHp;
            }
        }

        // Damage number
        if (this.battleSpeed <= 4) {
            this.showDamageNumber(unit.worldX, unit.worldY, damage);
        }
    }

    killUnit(unit) {
        unit.isAlive = false;

        const spriteData = this.unitSpriteMap[unit.id];
        if (spriteData) {
            // Death animation
            if (spriteData.sprite) {
                this.tweens.add({
                    targets: spriteData.sprite,
                    alpha: 0,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 300 / this.battleSpeed,
                    onComplete: () => {
                        spriteData.sprite.destroy();
                    }
                });
            }
            if (spriteData.hpBg) spriteData.hpBg.destroy();
            if (spriteData.hpFill) spriteData.hpFill.destroy();
            if (spriteData.countText) spriteData.countText.destroy();

            // Explosion effect
            this.createExplosion(unit.worldX, unit.worldY, 15);
        }
    }

    updateUnitSprite(unit) {
        const spriteData = this.unitSpriteMap[unit.id];
        if (!spriteData || !unit.isAlive) return;

        spriteData.sprite.setPosition(unit.worldX, unit.worldY);
        spriteData.hpBg.setPosition(unit.worldX, unit.worldY - 20);

        // HP bar
        const pct = unit.totalSquadHp / unit.maxTotalSquadHp;
        const barWidth = spriteData.hpBarWidth * pct;
        spriteData.hpFill.setPosition(unit.worldX - spriteData.hpBarWidth / 2 + barWidth / 2, unit.worldY - 20);
        spriteData.hpFill.setDisplaySize(Math.max(0, barWidth), 4);
        spriteData.hpFill.setFillStyle(pct > 0.5 ? COLORS.HP_GREEN : COLORS.HP_RED);

        // Count text
        if (spriteData.countText) {
            spriteData.countText.setPosition(unit.worldX + 12, unit.worldY + 10);
            spriteData.countText.setText(`${unit.currentCount}`);
        }
    }

    createProjectile(attacker, target, damage) {
        if (this.battleSpeed > 4) return; // skip visuals at high speed

        let projType = 'projectile_bullet';
        if (attacker.splashRadius > 20) projType = 'projectile_missile';
        if (attacker.type === 'arclight' || attacker.type === 'meltingpoint' || attacker.type === 'steelball') {
            projType = 'projectile_laser';
        }

        // For laser types, draw a line instead of projectile
        if (projType === 'projectile_laser') {
            const line = this.add.graphics();
            const color = attacker.owner === 'player' ? 0x4488ff : 0xff4444;
            line.lineStyle(2, color, 0.8);
            line.lineBetween(attacker.worldX, attacker.worldY, target.worldX, target.worldY);
            this.tweens.add({
                targets: line,
                alpha: 0,
                duration: 200 / this.battleSpeed,
                onComplete: () => line.destroy(),
            });
            return;
        }

        const proj = this.add.image(attacker.worldX, attacker.worldY, projType);
        const angle = Phaser.Math.Angle.Between(attacker.worldX, attacker.worldY, target.worldX, target.worldY);
        proj.setRotation(angle);

        const dx = target.worldX - attacker.worldX;
        const dy = target.worldY - attacker.worldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.min(500, dist * 2) / this.battleSpeed;

        this.tweens.add({
            targets: proj,
            x: target.worldX,
            y: target.worldY,
            duration: duration,
            onComplete: () => proj.destroy(),
        });
    }

    createExplosion(x, y, radius) {
        if (this.battleSpeed > 4) return;

        const size = Math.min(4, Math.max(1, Math.ceil(radius / 15)));
        const exp = this.add.image(x, y, `explosion_${size}`);
        this.tweens.add({
            targets: exp,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 400 / this.battleSpeed,
            onComplete: () => exp.destroy(),
        });
    }

    showDamageNumber(x, y, damage) {
        const dmgText = this.add.text(
            x + Phaser.Math.Between(-10, 10),
            y - 10,
            `-${damage}`,
            {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#ff6644',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText,
            y: y - 40,
            alpha: 0,
            duration: 600 / this.battleSpeed,
            onComplete: () => dmgText.destroy(),
        });
    }

    updateProjectiles(dt) {
        // Projectiles are handled by tweens, nothing extra needed
    }

    checkBattleEnd() {
        if (this.battleOver) return;

        const playerAlive = this.playerUnits.filter(u => u.isAlive);
        const enemyAlive = this.enemyUnits.filter(u => u.isAlive);

        if (playerAlive.length === 0 && enemyAlive.length === 0) {
            this.endBattle('draw');
        } else if (playerAlive.length === 0) {
            this.endBattle('enemy');
        } else if (enemyAlive.length === 0) {
            this.endBattle('player');
        }
    }

    endBattle(winner) {
        this.battleOver = true;

        // Calculate damage to loser's base
        let playerDmg = 0;
        let enemyDmg = 0;

        if (winner === 'player') {
            // Surviving player units deal damage to enemy base
            const surviving = this.playerUnits.filter(u => u.isAlive);
            enemyDmg = surviving.reduce((sum, u) => sum + u.currentCount, 0);
            enemyDmg = Math.min(enemyDmg, 10); // cap per round
        } else if (winner === 'enemy') {
            const surviving = this.enemyUnits.filter(u => u.isAlive);
            playerDmg = surviving.reduce((sum, u) => sum + u.currentCount, 0);
            playerDmg = Math.min(playerDmg, 10);
        }
        // Draw = no damage

        this.playerHP = Math.max(0, this.playerHP - playerDmg);
        this.enemyHP = Math.max(0, this.enemyHP - enemyDmg);

        // Show result
        this.showBattleResult(winner, playerDmg, enemyDmg);
    }

    showBattleResult(winner, playerDmg, enemyDmg) {
        // Overlay
        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
            .setDepth(200);

        let title, titleColor, subtitle;
        if (winner === 'player') {
            title = 'VICTORY!';
            titleColor = '#44ff44';
            subtitle = `Enemy base takes ${enemyDmg} damage! (${this.enemyHP} HP remaining)`;
        } else if (winner === 'enemy') {
            title = 'DEFEAT!';
            titleColor = '#ff4444';
            subtitle = `Your base takes ${playerDmg} damage! (${this.playerHP} HP remaining)`;
        } else {
            title = 'DRAW!';
            titleColor = '#ffcc00';
            subtitle = 'No damage dealt to either base.';
        }

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, title, {
            fontSize: '48px', fontFamily: 'monospace', color: titleColor, fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(201);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, subtitle, {
            fontSize: '18px', fontFamily: 'monospace', color: '#ccddee',
        }).setOrigin(0.5).setDepth(201);

        // Check game over
        if (this.playerHP <= 0 || this.enemyHP <= 0) {
            const gameOverText = this.playerHP <= 0 ? 'GAME OVER - YOU LOSE' : 'GAME OVER - YOU WIN!';
            const gameOverColor = this.playerHP <= 0 ? '#ff4444' : '#44ff44';

            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, gameOverText, {
                fontSize: '28px', fontFamily: 'monospace', color: gameOverColor, fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(201);

            // Return to menu button
            const menuBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 200, 50, COLORS.BUTTON)
                .setInteractive({ useHandCursor: true }).setDepth(201);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 'Main Menu', {
                fontSize: '18px', fontFamily: 'monospace', color: '#ffffff',
            }).setOrigin(0.5).setDepth(201);

            menuBtn.on('pointerdown', () => {
                this.scene.start('MenuScene');
            });

            // Play Again button
            const playBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, 200, 50, 0x1f6feb)
                .setInteractive({ useHandCursor: true }).setDepth(201);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, 'Play Again', {
                fontSize: '18px', fontFamily: 'monospace', color: '#ffffff',
            }).setOrigin(0.5).setDepth(201);

            playBtn.on('pointerdown', () => {
                this.scene.start('GameScene', { difficulty: this.difficulty });
            });

        } else {
            // Next round button
            const nextBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 250, 50, COLORS.BUTTON)
                .setInteractive({ useHandCursor: true }).setDepth(201);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'Next Round', {
                fontSize: '20px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(201);

            nextBtn.on('pointerdown', () => {
                this.goToNextRound();
            });

            // Auto-advance after delay
            this.input.keyboard.on('keydown-SPACE', () => {
                this.goToNextRound();
            });
        }
    }

    goToNextRound() {
        if (this._transitioned) return;
        this._transitioned = true;

        const nextRound = this.round + 1;
        const newSupplyGain = BASE_SUPPLY_PER_ROUND * nextRound;

        // Surviving units carry over (reset positions to player zone)
        const survivingPlayer = this.playerUnits.filter(u => u.isAlive).map((u, i) => {
            // Reset to player zone grid positions
            u.gridRow = PLAYER_ZONE_START_ROW + Math.floor(i / GRID_COLS);
            u.gridCol = i % GRID_COLS;
            u.attackCooldown = 0;
            u.targetId = null;
            return u;
        });

        const survivingEnemy = this.enemyUnits.filter(u => u.isAlive).map((u, i) => {
            u.gridRow = Math.floor(i / GRID_COLS);
            u.gridCol = i % GRID_COLS;
            u.attackCooldown = 0;
            u.targetId = null;
            return u;
        });

        // Calculate new supply (unspent carries over + new round supply)
        const newPlayerSupply = this.playerSupply + newSupplyGain;
        const newEnemySupply = this.enemySupply + newSupplyGain;

        const gameData = {
            round: nextRound,
            playerHP: this.playerHP,
            enemyHP: this.enemyHP,
            playerUnits: survivingPlayer,
            enemyUnits: survivingEnemy,
            playerSupply: newPlayerSupply,
            enemySupply: newEnemySupply,
            difficulty: this.difficulty,
            unitIdCounter: this.unitIdCounter,
            totalPlayerSupply: newPlayerSupply,
            totalEnemySupply: newEnemySupply,
            globalBuffs: this.globalBuffs || {},
        };

        // Go to card selection from round 2 onwards
        if (nextRound >= 2) {
            this.scene.start('CardScene', gameData);
        } else {
            this.scene.start('GameScene', gameData);
        }
    }
}
