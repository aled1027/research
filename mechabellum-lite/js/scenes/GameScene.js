// Main game scene - handles deployment/planning phase
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'normal';
        this.round = data.round || 1;
        this.playerHP = data.playerHP !== undefined ? data.playerHP : STARTING_HP;
        this.enemyHP = data.enemyHP !== undefined ? data.enemyHP : STARTING_HP;
        this.playerSupply = data.playerSupply || BASE_SUPPLY_PER_ROUND;
        this.enemySupply = data.enemySupply || BASE_SUPPLY_PER_ROUND;
        this.playerUnits = data.playerUnits || []; // surviving units from previous rounds
        this.enemyUnits = data.enemyUnits || [];
        this.deploymentsThisRound = 0;
        this.selectedUnitType = null;
        this.unitIdCounter = data.unitIdCounter || 0;
        this.totalPlayerSupply = data.totalPlayerSupply || BASE_SUPPLY_PER_ROUND;
        this.totalEnemySupply = data.totalEnemySupply || BASE_SUPPLY_PER_ROUND;
        this.globalBuffs = data.globalBuffs || {};
        this.freeUnits = data.freeUnits || [];
        this.maxDeploys = data.maxDeploys || MAX_NEW_DEPLOYMENTS;
    }

    create() {
        // AI
        this.ai = new MechabellumAI(this.difficulty);

        // Apply global buffs to existing units
        this.applyGlobalBuffs();

        // Draw battlefield
        this.drawBattlefield();

        // Draw existing units
        this.drawExistingUnits();

        // Place free units from card selections
        this.placeFreeUnits();

        // Create UI
        this.createTopBar();
        this.createShopPanel();
        this.createBottomBar();

        // Tooltip
        this.createTooltip();

        // Input handling
        this.setupInput();

        // Planning timer
        this.planningTimeLeft = PLANNING_TIME;
        this.timerText = null;
        this.createTimer();
    }

    applyGlobalBuffs() {
        if (!this.globalBuffs) return;
        for (const unit of this.playerUnits) {
            if (this.globalBuffs.hpMult) {
                unit.maxHp = Math.round(unit.maxHp * this.globalBuffs.hpMult);
                unit.hp = Math.round(unit.hp * this.globalBuffs.hpMult);
            }
            if (this.globalBuffs.attackMult) {
                unit.attack = Math.round(unit.attack * this.globalBuffs.attackMult);
            }
            if (this.globalBuffs.speedMult) {
                unit.speed *= this.globalBuffs.speedMult;
            }
            if (this.globalBuffs.rangeMult) {
                unit.range = Math.round(unit.range * this.globalBuffs.rangeMult);
            }
        }
        // Reset buffs after applying (they're one-round only in this implementation)
        // Actually, keep them - they should persist. But don't double-apply.
        // We track via a flag on each unit.
    }

    placeFreeUnits() {
        if (!this.freeUnits || this.freeUnits.length === 0) return;

        for (const unitType of this.freeUnits) {
            // Find an empty cell in player zone
            let placed = false;
            for (let row = PLAYER_ZONE_START_ROW; row < GRID_ROWS && !placed; row++) {
                for (let col = 0; col < GRID_COLS && !placed; col++) {
                    if (!this.gridCells[row][col].occupied) {
                        const unit = createUnitInstance(unitType, 'player', col, row);
                        unit.id = this.unitIdCounter++;
                        this.playerUnits.push(unit);
                        this.gridCells[row][col].occupied = true;
                        this.gridCells[row][col].unitId = unit.id;
                        this.drawUnitOnGrid(unit);
                        placed = true;
                    }
                }
            }
        }
        this.freeUnits = [];
    }

    drawBattlefield() {
        // Background
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

        // Grid cells
        this.gridCells = [];
        for (let row = 0; row < GRID_ROWS; row++) {
            this.gridCells[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                const x = FIELD_X + col * CELL_WIDTH;
                const y = FIELD_Y + row * CELL_HEIGHT;
                const isPlayerZone = row >= PLAYER_ZONE_START_ROW;
                const isFlank = this.round >= 2 && !isPlayerZone &&
                    (FLANK_COLS_LEFT.includes(col) || FLANK_COLS_RIGHT.includes(col));

                let cellColor = isPlayerZone ? COLORS.GRID_PLAYER : COLORS.GRID_ENEMY;
                if (isFlank) cellColor = 0x1a2222;

                const cell = this.add.rectangle(
                    x + CELL_WIDTH / 2, y + CELL_HEIGHT / 2,
                    CELL_WIDTH - 1, CELL_HEIGHT - 1,
                    cellColor, 0.6
                );

                this.gridCells[row][col] = {
                    rect: cell,
                    occupied: false,
                    unitId: null,
                };
            }
        }

        // Grid lines
        const gridGfx = this.add.graphics();
        gridGfx.lineStyle(1, COLORS.GRID_LINE, 0.3);

        for (let col = 0; col <= GRID_COLS; col++) {
            gridGfx.lineBetween(
                FIELD_X + col * CELL_WIDTH, FIELD_Y,
                FIELD_X + col * CELL_WIDTH, FIELD_Y + FIELD_HEIGHT
            );
        }
        for (let row = 0; row <= GRID_ROWS; row++) {
            gridGfx.lineBetween(
                FIELD_X, FIELD_Y + row * CELL_HEIGHT,
                FIELD_X + FIELD_WIDTH, FIELD_Y + row * CELL_HEIGHT
            );
        }

        // Center line (dividing line between territories)
        gridGfx.lineStyle(2, 0x445566, 0.6);
        gridGfx.lineBetween(
            FIELD_X, FIELD_Y + 5 * CELL_HEIGHT,
            FIELD_X + FIELD_WIDTH, FIELD_Y + 5 * CELL_HEIGHT
        );
    }

    drawExistingUnits() {
        this.unitSprites = {};

        // Draw player's surviving units
        for (const unit of this.playerUnits) {
            this.drawUnitOnGrid(unit);
            const row = unit.gridRow;
            const col = unit.gridCol;
            if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
                this.gridCells[row][col].occupied = true;
                this.gridCells[row][col].unitId = unit.id;
            }
        }

        // Draw enemy's surviving units (shown faded)
        for (const unit of this.enemyUnits) {
            this.drawUnitOnGrid(unit, true);
            const row = unit.gridRow;
            const col = unit.gridCol;
            if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
                this.gridCells[row][col].occupied = true;
                this.gridCells[row][col].unitId = unit.id;
            }
        }
    }

    drawUnitOnGrid(unit, faded = false) {
        const x = FIELD_X + unit.gridCol * CELL_WIDTH + CELL_WIDTH / 2;
        const y = FIELD_Y + unit.gridRow * CELL_HEIGHT + CELL_HEIGHT / 2;
        const spriteName = `unit_${unit.type}_${unit.owner}`;

        const sprite = this.add.image(x, y, spriteName);
        if (faded) sprite.setAlpha(0.5);

        // Count label
        if (unit.currentCount > 1) {
            const countText = this.add.text(x + 10, y + 10, `${unit.currentCount}`, {
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 2, y: 1 },
            }).setOrigin(0.5);
            this.unitSprites[unit.id] = { sprite, countText };
        } else {
            this.unitSprites[unit.id] = { sprite };
        }

        // HP bar
        const hpBarWidth = CELL_WIDTH * 0.7;
        const hpPct = unit.hp / unit.maxHp;
        const hpBg = this.add.rectangle(x, y - 18, hpBarWidth, 4, 0x333333);
        const hpFill = this.add.rectangle(
            x - hpBarWidth / 2 + (hpBarWidth * hpPct) / 2, y - 18,
            hpBarWidth * hpPct, 4,
            hpPct > 0.5 ? COLORS.HP_GREEN : COLORS.HP_RED
        );
        this.unitSprites[unit.id].hpBg = hpBg;
        this.unitSprites[unit.id].hpFill = hpFill;

        // Tech indicator dots
        if (unit.appliedTechs && unit.appliedTechs.length > 0) {
            for (let i = 0; i < unit.appliedTechs.length; i++) {
                const dot = this.add.circle(x - 8 + i * 10, y + 18, 3, 0xffcc00);
                if (!this.unitSprites[unit.id].techDots) {
                    this.unitSprites[unit.id].techDots = [];
                }
                this.unitSprites[unit.id].techDots.push(dot);
            }
        }

        // Make player units interactive for right-click tech menu
        if (unit.owner === 'player') {
            sprite.setInteractive({ useHandCursor: true });
            sprite.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    this.showTechMenu(unit);
                }
            });
        }

        return sprite;
    }

    removeUnitSprite(unitId) {
        const spriteData = this.unitSprites[unitId];
        if (spriteData) {
            if (spriteData.sprite) spriteData.sprite.destroy();
            if (spriteData.countText) spriteData.countText.destroy();
            if (spriteData.hpBg) spriteData.hpBg.destroy();
            if (spriteData.hpFill) spriteData.hpFill.destroy();
            if (spriteData.techDots) spriteData.techDots.forEach(d => d.destroy());
            delete this.unitSprites[unitId];
        }
    }

    createTopBar() {
        // Top bar background
        this.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 60, COLORS.UI_BG, 0.9);

        // Round info
        this.add.text(GAME_WIDTH / 2, 16, `ROUND ${this.round}`, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 40, 'PLANNING PHASE', {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#88aacc',
        }).setOrigin(0.5);

        // Player HP (left side)
        this.add.text(20, 12, 'YOUR BASE', {
            fontSize: '11px', fontFamily: 'monospace', color: '#88aacc',
        });
        this.playerHPBar = this.createHPBar(20, 30, 180, this.playerHP, STARTING_HP, COLORS.PLAYER);

        // Enemy HP (right side)
        this.add.text(GAME_WIDTH - 200, 12, 'ENEMY BASE', {
            fontSize: '11px', fontFamily: 'monospace', color: '#cc8888',
        });
        this.enemyHPBar = this.createHPBar(GAME_WIDTH - 200, 30, 180, this.enemyHP, STARTING_HP, COLORS.ENEMY);

        // Supply display
        this.supplyText = this.add.text(GAME_WIDTH / 2, 55, `Supply: ${this.playerSupply}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffcc00',
        }).setOrigin(0.5).setVisible(false);
    }

    createHPBar(x, y, width, current, max, color) {
        const bg = this.add.rectangle(x + width / 2, y + 5, width, 12, 0x333333);
        const pct = current / max;
        const fill = this.add.rectangle(
            x + (width * pct) / 2, y + 5,
            width * pct, 12, color
        );
        const text = this.add.text(x + width / 2, y + 5, `${current}/${max}`, {
            fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
        }).setOrigin(0.5);
        return { bg, fill, text };
    }

    createShopPanel() {
        // Shop panel on the bottom
        const panelY = FIELD_Y + FIELD_HEIGHT + 2;
        const panelHeight = GAME_HEIGHT - panelY;

        this.add.rectangle(GAME_WIDTH / 2, panelY + panelHeight / 2, GAME_WIDTH, panelHeight, COLORS.UI_BG, 0.95);
        this.add.line(0, 0, 0, panelY, GAME_WIDTH, panelY, COLORS.UI_BORDER).setOrigin(0);

        // Supply indicator
        this.supplyDisplay = this.add.text(15, panelY + 8, `Supply: ${this.playerSupply}`, {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffcc00',
            fontStyle: 'bold',
        });

        // Deployments remaining
        this.deploymentsText = this.add.text(220, panelY + 8, `Deploys: ${this.maxDeploys - this.deploymentsThisRound}/${this.maxDeploys}`, {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#88aacc',
        });

        // Unit shop buttons
        const unitKeys = getUnitList();
        const btnWidth = 82;
        const btnHeight = 60;
        const startX = 15;
        const btnY = panelY + 38;
        this.shopButtons = [];

        unitKeys.forEach((key, i) => {
            const def = UNIT_DEFS[key];
            const x = startX + (i % 14) * (btnWidth + 4);
            const y = btnY + Math.floor(i / 14) * (btnHeight + 4);

            const container = this.add.container(x, y);

            const bg = this.add.rectangle(btnWidth / 2, btnHeight / 2, btnWidth, btnHeight, 0x1a2a3a)
                .setInteractive({ useHandCursor: true });

            // Tier color indicator
            const tierBar = this.add.rectangle(btnWidth / 2, 2, btnWidth - 4, 3, TIER_COLORS[def.tier] || 0x888888);

            // Unit icon
            const icon = this.add.image(16, btnHeight / 2, `unit_${key}_player`).setScale(0.9);

            // Name
            const name = this.add.text(34, 10, def.name, {
                fontSize: '10px', fontFamily: 'monospace', color: '#ccddee', fontStyle: 'bold',
            });

            // Cost
            const cost = this.add.text(34, 24, `$${def.cost}`, {
                fontSize: '11px', fontFamily: 'monospace', color: '#ffcc00',
            });

            // Count
            const count = this.add.text(34, 38, `x${def.count}`, {
                fontSize: '9px', fontFamily: 'monospace', color: '#889999',
            });

            // Size indicator
            const sizeLabel = this.add.text(btnWidth - 4, btnHeight - 4, def.size[0].toUpperCase(), {
                fontSize: '9px', fontFamily: 'monospace', color: '#556677',
            }).setOrigin(1, 1);

            container.add([bg, tierBar, icon, name, cost, count, sizeLabel]);

            // Interactivity
            bg.on('pointerover', () => {
                bg.setFillStyle(0x2a3a4a);
                this.showTooltip(def, x, y - 80);
            });
            bg.on('pointerout', () => {
                if (this.selectedUnitType !== key) {
                    bg.setFillStyle(0x1a2a3a);
                }
                this.hideTooltip();
            });
            bg.on('pointerdown', () => {
                this.selectUnit(key);
            });

            this.shopButtons.push({ key, bg, container });
        });
    }

    selectUnit(typeKey) {
        // Deselect previous
        this.shopButtons.forEach(btn => {
            btn.bg.setFillStyle(btn.key === typeKey ? 0x2a4a3a : 0x1a2a3a);
        });

        if (this.selectedUnitType === typeKey) {
            this.selectedUnitType = null;
            this.clearPlacementHighlights();
            return;
        }

        const def = UNIT_DEFS[typeKey];
        if (def.cost > this.playerSupply) {
            this.showMessage('Not enough supply!', '#ff4444');
            return;
        }
        if (this.deploymentsThisRound >= this.maxDeploys) {
            this.showMessage('Max deployments reached!', '#ff4444');
            return;
        }

        this.selectedUnitType = typeKey;
        this.showPlacementHighlights();
    }

    showPlacementHighlights() {
        this.clearPlacementHighlights();
        this.placementHighlights = [];

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const isPlayerZone = row >= PLAYER_ZONE_START_ROW;
                const isFlank = this.round >= 2 && !isPlayerZone &&
                    (FLANK_COLS_LEFT.includes(col) || FLANK_COLS_RIGHT.includes(col));
                const canPlace = (isPlayerZone || isFlank) && !this.gridCells[row][col].occupied;

                if (canPlace) {
                    const x = FIELD_X + col * CELL_WIDTH + CELL_WIDTH / 2;
                    const y = FIELD_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
                    const highlight = this.add.image(x, y, 'valid_cell').setAlpha(0.5);
                    this.placementHighlights.push(highlight);
                }
            }
        }
    }

    clearPlacementHighlights() {
        if (this.placementHighlights) {
            this.placementHighlights.forEach(h => h.destroy());
            this.placementHighlights = [];
        }
    }

    setupInput() {
        // Disable context menu
        this.input.mouse.disableContextMenu();

        // Grid click for placement
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) return; // handled per-unit

            // Check if clicking on the grid
            const gridCol = Math.floor((pointer.x - FIELD_X) / CELL_WIDTH);
            const gridRow = Math.floor((pointer.y - FIELD_Y) / CELL_HEIGHT);

            if (gridCol < 0 || gridCol >= GRID_COLS || gridRow < 0 || gridRow >= GRID_ROWS) return;

            // Close tech menu if open
            if (this.techMenuContainer) {
                this.techMenuContainer.destroy();
                this.techMenuContainer = null;
            }

            if (this.selectedUnitType) {
                this.tryPlaceUnit(gridCol, gridRow);
            }
        });

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => {
            this.startBattle();
        });
        this.input.keyboard.on('keydown-ESC', () => {
            this.selectedUnitType = null;
            this.clearPlacementHighlights();
            this.shopButtons.forEach(btn => btn.bg.setFillStyle(0x1a2a3a));
            if (this.techMenuContainer) {
                this.techMenuContainer.destroy();
                this.techMenuContainer = null;
            }
        });

        // Sell unit with Delete key
        this.input.keyboard.on('keydown-DELETE', () => {
            // Sell hovered unit
        });
    }

    tryPlaceUnit(col, row) {
        const isPlayerZone = row >= PLAYER_ZONE_START_ROW;
        const isFlank = this.round >= 2 && !isPlayerZone &&
            (FLANK_COLS_LEFT.includes(col) || FLANK_COLS_RIGHT.includes(col));

        if (!isPlayerZone && !isFlank) {
            this.showMessage('Can only deploy in your zone!', '#ff4444');
            return;
        }

        if (this.gridCells[row][col].occupied) {
            this.showMessage('Cell occupied!', '#ff4444');
            return;
        }

        const def = UNIT_DEFS[this.selectedUnitType];
        if (def.cost > this.playerSupply) {
            this.showMessage('Not enough supply!', '#ff4444');
            return;
        }

        if (this.deploymentsThisRound >= this.maxDeploys) {
            this.showMessage('Max deployments reached!', '#ff4444');
            return;
        }

        // Place unit
        const unit = createUnitInstance(this.selectedUnitType, 'player', col, row);
        unit.id = this.unitIdCounter++;

        this.playerUnits.push(unit);
        this.playerSupply -= def.cost;
        this.deploymentsThisRound++;

        // Update grid
        this.gridCells[row][col].occupied = true;
        this.gridCells[row][col].unitId = unit.id;

        // Draw unit
        this.drawUnitOnGrid(unit);

        // Update UI
        this.updateShopUI();

        // Flash placement effect
        const x = FIELD_X + col * CELL_WIDTH + CELL_WIDTH / 2;
        const y = FIELD_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
        const flash = this.add.circle(x, y, 20, COLORS.PLAYER, 0.5);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 400,
            onComplete: () => flash.destroy(),
        });

        // Keep selected if can still afford and deploy
        if (def.cost > this.playerSupply || this.deploymentsThisRound >= this.maxDeploys) {
            this.selectedUnitType = null;
            this.clearPlacementHighlights();
            this.shopButtons.forEach(btn => btn.bg.setFillStyle(0x1a2a3a));
        } else {
            this.showPlacementHighlights();
        }
    }

    updateShopUI() {
        this.supplyDisplay.setText(`Supply: ${this.playerSupply}`);
        this.deploymentsText.setText(`Deploys: ${this.maxDeploys - this.deploymentsThisRound}/${this.maxDeploys}`);

        // Gray out unaffordable units
        this.shopButtons.forEach(btn => {
            const def = UNIT_DEFS[btn.key];
            const canAfford = def.cost <= this.playerSupply;
            const canDeploy = this.deploymentsThisRound < this.maxDeploys;
            btn.container.setAlpha(canAfford && canDeploy ? 1 : 0.4);
        });
    }

    showTechMenu(unit) {
        // Close existing menu
        if (this.techMenuContainer) {
            this.techMenuContainer.destroy();
        }

        const x = FIELD_X + unit.gridCol * CELL_WIDTH + CELL_WIDTH;
        const y = FIELD_Y + unit.gridRow * CELL_HEIGHT;

        const container = this.add.container(x, Math.min(y, FIELD_Y + FIELD_HEIGHT - 160));
        this.techMenuContainer = container;

        // Background
        const menuWidth = 220;
        const menuHeight = 30 + unit.def.techs.length * 55 + 40;
        const bg = this.add.rectangle(menuWidth / 2, menuHeight / 2, menuWidth, menuHeight, 0x1a1a2e, 0.95);
        bg.setStrokeStyle(1, COLORS.UI_BORDER);
        container.add(bg);

        // Title
        const title = this.add.text(menuWidth / 2, 12, `${unit.def.name} Upgrades`, {
            fontSize: '13px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(title);

        // Tech options
        unit.def.techs.forEach((tech, i) => {
            const ty = 35 + i * 55;
            const isApplied = unit.appliedTechs.includes(i);
            const canAfford = tech.cost <= this.playerSupply;

            const techBg = this.add.rectangle(menuWidth / 2, ty + 20, menuWidth - 16, 48, isApplied ? 0x223322 : 0x222233)
                .setInteractive({ useHandCursor: !isApplied && canAfford });
            container.add(techBg);

            const techName = this.add.text(12, ty + 6, tech.name, {
                fontSize: '12px', fontFamily: 'monospace',
                color: isApplied ? '#44aa44' : (canAfford ? '#ccddee' : '#666666'),
                fontStyle: 'bold',
            });
            container.add(techName);

            const techDesc = this.add.text(12, ty + 22, tech.description, {
                fontSize: '10px', fontFamily: 'monospace',
                color: isApplied ? '#338833' : '#889999',
            });
            container.add(techDesc);

            const costText = this.add.text(menuWidth - 12, ty + 6, isApplied ? 'DONE' : `$${tech.cost}`, {
                fontSize: '11px', fontFamily: 'monospace',
                color: isApplied ? '#44aa44' : (canAfford ? '#ffcc00' : '#664444'),
            }).setOrigin(1, 0);
            container.add(costText);

            if (!isApplied && canAfford) {
                techBg.on('pointerover', () => techBg.setFillStyle(0x333344));
                techBg.on('pointerout', () => techBg.setFillStyle(0x222233));
                techBg.on('pointerdown', () => {
                    this.playerSupply -= tech.cost;
                    applyTech(unit, i);
                    this.updateShopUI();
                    // Refresh menu
                    this.showTechMenu(unit);
                    // Redraw unit
                    this.removeUnitSprite(unit.id);
                    this.drawUnitOnGrid(unit);
                });
            }
        });

        // Sell button
        const sellY = 35 + unit.def.techs.length * 55 + 5;
        const sellBg = this.add.rectangle(menuWidth / 2, sellY + 12, menuWidth - 16, 28, 0x442222)
            .setInteractive({ useHandCursor: true });
        container.add(sellBg);

        const sellRefund = Math.floor(unit.def.cost * 0.7);
        const sellText = this.add.text(menuWidth / 2, sellY + 12, `Sell (+$${sellRefund})`, {
            fontSize: '12px', fontFamily: 'monospace', color: '#ff6644',
        }).setOrigin(0.5);
        container.add(sellText);

        sellBg.on('pointerover', () => sellBg.setFillStyle(0x553333));
        sellBg.on('pointerout', () => sellBg.setFillStyle(0x442222));
        sellBg.on('pointerdown', () => {
            this.sellUnit(unit, sellRefund);
            container.destroy();
            this.techMenuContainer = null;
        });
    }

    sellUnit(unit, refund) {
        // Remove from player units
        this.playerUnits = this.playerUnits.filter(u => u.id !== unit.id);

        // Free grid cell
        if (unit.gridRow >= 0 && unit.gridRow < GRID_ROWS && unit.gridCol >= 0 && unit.gridCol < GRID_COLS) {
            this.gridCells[unit.gridRow][unit.gridCol].occupied = false;
            this.gridCells[unit.gridRow][unit.gridCol].unitId = null;
        }

        // Remove sprite
        this.removeUnitSprite(unit.id);

        // Refund
        this.playerSupply += refund;
        this.updateShopUI();

        this.showMessage(`Sold ${unit.def.name} for $${refund}`, '#ffcc00');
    }

    createBottomBar() {
        // Battle button
        const battleBtn = this.add.rectangle(GAME_WIDTH - 110, FIELD_Y + FIELD_HEIGHT + 35, 180, 48, COLORS.BUTTON)
            .setInteractive({ useHandCursor: true });

        this.add.text(GAME_WIDTH - 110, FIELD_Y + FIELD_HEIGHT + 28, 'BATTLE!', {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH - 110, FIELD_Y + FIELD_HEIGHT + 46, '[SPACE]', {
            fontSize: '11px', fontFamily: 'monospace', color: '#88cc88',
        }).setOrigin(0.5);

        battleBtn.on('pointerover', () => battleBtn.setFillStyle(COLORS.BUTTON_HOVER));
        battleBtn.on('pointerout', () => battleBtn.setFillStyle(COLORS.BUTTON));
        battleBtn.on('pointerdown', () => this.startBattle());
    }

    createTimer() {
        this.timerText = this.add.text(GAME_WIDTH / 2 + 110, 30, '', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#88aacc',
        }).setOrigin(0, 0.5);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.planningTimeLeft -= 1000;
                if (this.planningTimeLeft <= 0) {
                    this.startBattle();
                } else {
                    const secs = Math.ceil(this.planningTimeLeft / 1000);
                    this.timerText.setText(`${secs}s`);
                    if (secs <= 10) {
                        this.timerText.setColor('#ff6644');
                    }
                }
            },
            loop: true,
        });

        const secs = Math.ceil(this.planningTimeLeft / 1000);
        this.timerText.setText(`${secs}s`);
    }

    createTooltip() {
        this.tooltipContainer = this.add.container(0, 0).setVisible(false).setDepth(100);

        this.tooltipBg = this.add.rectangle(0, 0, 240, 100, 0x1a1a2e, 0.95);
        this.tooltipBg.setStrokeStyle(1, COLORS.UI_BORDER);
        this.tooltipContainer.add(this.tooltipBg);

        this.tooltipText = this.add.text(-110, -40, '', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ccddee',
            wordWrap: { width: 220 },
            lineSpacing: 3,
        });
        this.tooltipContainer.add(this.tooltipText);
    }

    showTooltip(def, x, y) {
        const lines = [
            `${def.name} (${def.size})`,
            `Cost: $${def.cost}  |  Units: ${def.count}`,
            `HP: ${def.hp}  |  ATK: ${def.attack}`,
            `Range: ${def.range}px  |  Speed: ${def.speed}`,
            `Interval: ${def.attackInterval}s  |  Splash: ${def.splashRadius || '-'}`,
            `Target: ${def.targetType}  |  Move: ${def.moveType}`,
            `${def.description}`,
        ];
        this.tooltipText.setText(lines.join('\n'));

        const bounds = this.tooltipText.getBounds();
        this.tooltipBg.setSize(bounds.width + 20, bounds.height + 20);
        this.tooltipBg.setPosition(bounds.width / 2 - 110, bounds.height / 2 - 40);

        // Keep on screen
        let tx = Math.max(130, Math.min(x, GAME_WIDTH - 150));
        let ty = Math.max(60, Math.min(y, FIELD_Y + FIELD_HEIGHT - 80));

        this.tooltipContainer.setPosition(tx, ty);
        this.tooltipContainer.setVisible(true);
    }

    hideTooltip() {
        this.tooltipContainer.setVisible(false);
    }

    showMessage(text, color = '#ffffff') {
        const msg = this.add.text(GAME_WIDTH / 2, FIELD_Y + FIELD_HEIGHT / 2, text, {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: color,
            fontStyle: 'bold',
            backgroundColor: '#000000cc',
            padding: { x: 16, y: 8 },
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: msg.y - 40,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => msg.destroy(),
        });
    }

    startBattle() {
        // AI makes its deployment decisions
        const aiDecisions = this.ai.makeDeploymentDecisions(
            this.enemySupply, this.round, this.enemyUnits, this.playerUnits
        );

        // Apply AI deployments
        for (const dep of aiDecisions.deployments) {
            // Find an empty cell for AI
            let placed = false;
            let row = dep.gridRow;
            let col = dep.gridCol;

            // Try the intended cell, then search nearby
            for (let attempt = 0; attempt < 20 && !placed; attempt++) {
                const tryRow = row + Math.floor(attempt / 4) - 1;
                const tryCol = col + (attempt % 4) - 2;

                if (tryRow < 0 || tryRow > ENEMY_ZONE_END_ROW) continue;
                if (tryCol < 0 || tryCol >= GRID_COLS) continue;
                if (this.gridCells[tryRow][tryCol].occupied) continue;

                const unit = createUnitInstance(dep.unitType, 'enemy', tryCol, tryRow);
                unit.id = this.unitIdCounter++;
                this.enemyUnits.push(unit);

                this.gridCells[tryRow][tryCol].occupied = true;
                this.gridCells[tryRow][tryCol].unitId = unit.id;
                this.enemySupply -= UNIT_DEFS[dep.unitType].cost;
                placed = true;
            }
        }

        // Apply AI tech upgrades
        for (const techDec of aiDecisions.techs) {
            const unit = this.enemyUnits.find(u => u.id === techDec.unitId);
            if (unit) {
                const tech = unit.def.techs[techDec.techIndex];
                if (tech && this.enemySupply >= tech.cost) {
                    applyTech(unit, techDec.techIndex);
                    this.enemySupply -= tech.cost;
                }
            }
        }

        // Check if at least 1 unit on each side
        if (this.playerUnits.length === 0) {
            this.showMessage('Deploy at least one unit!', '#ff4444');
            return;
        }

        // Transition to battle scene
        this.scene.start('BattleScene', {
            round: this.round,
            playerHP: this.playerHP,
            enemyHP: this.enemyHP,
            playerUnits: this.playerUnits,
            enemyUnits: this.enemyUnits,
            playerSupply: this.playerSupply,
            enemySupply: this.enemySupply,
            difficulty: this.difficulty,
            unitIdCounter: this.unitIdCounter,
            totalPlayerSupply: this.totalPlayerSupply,
            totalEnemySupply: this.totalEnemySupply,
            globalBuffs: this.globalBuffs,
        });
    }
}
