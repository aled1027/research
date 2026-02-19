// Boot scene - generates all sprite textures procedurally
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Generate unit sprites programmatically
        this.generateUnitSprites();
        this.generateUISprites();
        this.generateProjectileSprites();
        this.generateEffectSprites();

        this.scene.start('MenuScene');
    }

    generateUnitSprites() {
        const unitKeys = Object.keys(UNIT_DEFS);

        for (const key of unitKeys) {
            const def = UNIT_DEFS[key];

            // Generate sprites for both player and enemy
            for (const side of ['player', 'enemy']) {
                const baseColor = side === 'player' ? COLORS.PLAYER : COLORS.ENEMY;
                const unitColor = def.color;
                const spriteName = `unit_${key}_${side}`;

                let spriteSize = 20;
                if (def.size === SIZE.MEDIUM) spriteSize = 26;
                if (def.size === SIZE.LARGE) spriteSize = 32;
                if (def.size === SIZE.GIANT) spriteSize = 40;

                const gfx = this.add.graphics();

                // Draw based on shape
                switch (def.shape) {
                    case 'triangle':
                        this.drawTriangle(gfx, spriteSize, unitColor, baseColor, side === 'enemy');
                        break;
                    case 'square':
                        this.drawSquare(gfx, spriteSize, unitColor, baseColor);
                        break;
                    case 'diamond':
                        this.drawDiamond(gfx, spriteSize, unitColor, baseColor);
                        break;
                    case 'circle':
                        this.drawCircle(gfx, spriteSize, unitColor, baseColor);
                        break;
                    case 'hexagon':
                        this.drawHexagon(gfx, spriteSize, unitColor, baseColor);
                        break;
                }

                // Air unit indicator - wings/lines
                if (def.moveType === MOVE_TYPE.AIR) {
                    gfx.lineStyle(2, 0xffffff, 0.5);
                    gfx.lineBetween(spriteSize/2 - spriteSize*0.8, spriteSize/2, spriteSize/2 - spriteSize*0.3, spriteSize/2 - spriteSize*0.3);
                    gfx.lineBetween(spriteSize/2 + spriteSize*0.8, spriteSize/2, spriteSize/2 + spriteSize*0.3, spriteSize/2 - spriteSize*0.3);
                }

                gfx.generateTexture(spriteName, spriteSize, spriteSize);
                gfx.destroy();
            }
        }
    }

    drawTriangle(gfx, size, color, borderColor, flipped) {
        const half = size / 2;
        gfx.fillStyle(color, 1);
        gfx.lineStyle(2, borderColor, 1);
        if (flipped) {
            gfx.fillTriangle(half, size - 2, 2, 2, size - 2, 2);
            gfx.strokeTriangle(half, size - 2, 2, 2, size - 2, 2);
        } else {
            gfx.fillTriangle(half, 2, 2, size - 2, size - 2, size - 2);
            gfx.strokeTriangle(half, 2, 2, size - 2, size - 2, size - 2);
        }
    }

    drawSquare(gfx, size, color, borderColor) {
        gfx.fillStyle(color, 1);
        gfx.fillRect(3, 3, size - 6, size - 6);
        gfx.lineStyle(2, borderColor, 1);
        gfx.strokeRect(3, 3, size - 6, size - 6);
    }

    drawDiamond(gfx, size, color, borderColor) {
        const half = size / 2;
        const points = [
            { x: half, y: 2 },
            { x: size - 2, y: half },
            { x: half, y: size - 2 },
            { x: 2, y: half }
        ];
        gfx.fillStyle(color, 1);
        gfx.fillPoints(points, true);
        gfx.lineStyle(2, borderColor, 1);
        gfx.strokePoints(points, true);
    }

    drawCircle(gfx, size, color, borderColor) {
        const half = size / 2;
        gfx.fillStyle(color, 1);
        gfx.fillCircle(half, half, half - 2);
        gfx.lineStyle(2, borderColor, 1);
        gfx.strokeCircle(half, half, half - 2);
    }

    drawHexagon(gfx, size, color, borderColor) {
        const half = size / 2;
        const r = half - 2;
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            points.push({
                x: half + r * Math.cos(angle),
                y: half + r * Math.sin(angle)
            });
        }
        gfx.fillStyle(color, 1);
        gfx.fillPoints(points, true);
        gfx.lineStyle(2, borderColor, 1);
        gfx.strokePoints(points, true);
    }

    generateUISprites() {
        // Button background
        let gfx = this.add.graphics();
        gfx.fillStyle(COLORS.BUTTON, 1);
        gfx.fillRoundedRect(0, 0, 200, 50, 8);
        gfx.generateTexture('button', 200, 50);
        gfx.destroy();

        // Panel background
        gfx = this.add.graphics();
        gfx.fillStyle(COLORS.UI_BG, 0.9);
        gfx.fillRoundedRect(0, 0, 300, 400, 4);
        gfx.lineStyle(1, COLORS.UI_BORDER, 1);
        gfx.strokeRoundedRect(0, 0, 300, 400, 4);
        gfx.generateTexture('panel_bg', 300, 400);
        gfx.destroy();

        // Small panel
        gfx = this.add.graphics();
        gfx.fillStyle(COLORS.UI_BG, 0.9);
        gfx.fillRoundedRect(0, 0, 160, 60, 4);
        gfx.lineStyle(1, COLORS.UI_BORDER, 1);
        gfx.strokeRoundedRect(0, 0, 160, 60, 4);
        gfx.generateTexture('small_panel', 160, 60);
        gfx.destroy();

        // Selection highlight
        gfx = this.add.graphics();
        gfx.lineStyle(2, COLORS.UI_HIGHLIGHT, 1);
        gfx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        gfx.generateTexture('cell_highlight', CELL_WIDTH, CELL_HEIGHT);
        gfx.destroy();

        // Valid placement indicator
        gfx = this.add.graphics();
        gfx.fillStyle(0x44ff44, 0.2);
        gfx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        gfx.lineStyle(1, 0x44ff44, 0.5);
        gfx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        gfx.generateTexture('valid_cell', CELL_WIDTH, CELL_HEIGHT);
        gfx.destroy();

        // Invalid placement indicator
        gfx = this.add.graphics();
        gfx.fillStyle(0xff4444, 0.2);
        gfx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        gfx.lineStyle(1, 0xff4444, 0.5);
        gfx.strokeRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        gfx.generateTexture('invalid_cell', CELL_WIDTH, CELL_HEIGHT);
        gfx.destroy();
    }

    generateProjectileSprites() {
        // Bullet
        let gfx = this.add.graphics();
        gfx.fillStyle(0xffff88, 1);
        gfx.fillCircle(3, 3, 3);
        gfx.generateTexture('projectile_bullet', 6, 6);
        gfx.destroy();

        // Missile
        gfx = this.add.graphics();
        gfx.fillStyle(0xff8844, 1);
        gfx.fillRect(0, 1, 8, 3);
        gfx.fillStyle(0xffcc44, 1);
        gfx.fillRect(6, 0, 2, 5);
        gfx.generateTexture('projectile_missile', 8, 5);
        gfx.destroy();

        // Laser
        gfx = this.add.graphics();
        gfx.fillStyle(0xff4444, 1);
        gfx.fillRect(0, 1, 12, 2);
        gfx.fillStyle(0xff8888, 0.5);
        gfx.fillRect(0, 0, 12, 4);
        gfx.generateTexture('projectile_laser', 12, 4);
        gfx.destroy();
    }

    generateEffectSprites() {
        // Explosion
        for (let i = 1; i <= 4; i++) {
            const gfx = this.add.graphics();
            const r = i * 8;
            gfx.fillStyle(0xff8800, 1 - i * 0.2);
            gfx.fillCircle(r, r, r);
            gfx.fillStyle(0xffcc00, 0.8 - i * 0.15);
            gfx.fillCircle(r, r, r * 0.6);
            gfx.generateTexture(`explosion_${i}`, r * 2, r * 2);
            gfx.destroy();
        }

        // Damage number background
        const gfx = this.add.graphics();
        gfx.fillStyle(0x000000, 0.5);
        gfx.fillRoundedRect(0, 0, 40, 20, 4);
        gfx.generateTexture('dmg_bg', 40, 20);
        gfx.destroy();
    }
}
