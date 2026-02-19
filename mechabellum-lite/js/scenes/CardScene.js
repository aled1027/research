// Card selection scene - shown between rounds (from round 2+)
class CardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CardScene' });
    }

    init(data) {
        this.gameData = data;
    }

    create() {
        const cx = GAME_WIDTH / 2;

        // Background
        this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

        // Title
        this.add.text(cx, 60, `ROUND ${this.gameData.round} - REINFORCEMENTS`, {
            fontSize: '28px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(cx, 100, 'Choose a reinforcement card or skip for +50 supply', {
            fontSize: '14px', fontFamily: 'monospace', color: '#889999',
        }).setOrigin(0.5);

        // Pick 3 cards
        const cards = pickCards(3, this.gameData.round);

        // Display cards
        const cardWidth = 280;
        const cardHeight = 360;
        const spacing = 30;
        const totalWidth = cards.length * cardWidth + (cards.length - 1) * spacing;
        const startX = cx - totalWidth / 2 + cardWidth / 2;

        cards.forEach((card, i) => {
            const x = startX + i * (cardWidth + spacing);
            const y = GAME_HEIGHT / 2 - 20;

            this.createCardDisplay(card, x, y, cardWidth, cardHeight);
        });

        // Skip button
        const skipBtn = this.add.rectangle(cx, GAME_HEIGHT - 80, 250, 50, 0x2a2a3a)
            .setInteractive({ useHandCursor: true });

        this.add.text(cx, GAME_HEIGHT - 80, 'Skip (+50 Supply)', {
            fontSize: '16px', fontFamily: 'monospace', color: '#ffcc00',
        }).setOrigin(0.5);

        skipBtn.on('pointerover', () => skipBtn.setFillStyle(0x3a3a4a));
        skipBtn.on('pointerout', () => skipBtn.setFillStyle(0x2a2a3a));
        skipBtn.on('pointerdown', () => {
            this.gameData.playerSupply += SKIP_CARD_BONUS;
            this.proceedToGame();
        });

        // Round info at bottom
        this.add.text(cx, GAME_HEIGHT - 30, `Your HP: ${this.gameData.playerHP}  |  Enemy HP: ${this.gameData.enemyHP}  |  Supply: ${this.gameData.playerSupply}`, {
            fontSize: '13px', fontFamily: 'monospace', color: '#667788',
        }).setOrigin(0.5);
    }

    createCardDisplay(card, x, y, width, height) {
        const rarityColor = CARD_RARITY_COLORS[card.rarity];
        const rarityColorHex = parseInt(rarityColor.replace('#', ''), 16);

        // Card background
        const bg = this.add.rectangle(x, y, width, height, 0x1a1a2e, 0.95)
            .setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, rarityColorHex);

        // Rarity banner
        this.add.rectangle(x, y - height / 2 + 15, width - 4, 28, rarityColorHex, 0.3);
        this.add.text(x, y - height / 2 + 15, card.rarity.toUpperCase(), {
            fontSize: '12px', fontFamily: 'monospace', color: rarityColor, fontStyle: 'bold',
        }).setOrigin(0.5);

        // Card icon (large centered symbol)
        let icon = '?';
        if (card.id.includes('supply') || card.id.includes('war')) icon = '$';
        else if (card.id.includes('free_')) icon = '+';
        else if (card.id.includes('buff') || card.id.includes('tech')) icon = '^';
        else if (card.id.includes('deploy') || card.id.includes('mass')) icon = '#';
        else if (card.id.includes('repair')) icon = '+';
        else if (card.id.includes('range') || card.id.includes('target')) icon = '>';

        this.add.text(x, y - 40, icon, {
            fontSize: '64px', fontFamily: 'monospace', color: rarityColor,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Card name
        this.add.text(x, y + 50, card.name, {
            fontSize: '18px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);

        // Description
        this.add.text(x, y + 90, card.description, {
            fontSize: '14px', fontFamily: 'monospace', color: '#aabbcc',
            wordWrap: { width: width - 30 },
            align: 'center',
        }).setOrigin(0.5);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x2a2a4e);
            bg.setStrokeStyle(3, rarityColorHex);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x1a1a2e);
            bg.setStrokeStyle(2, rarityColorHex);
        });
        bg.on('pointerdown', () => {
            this.selectCard(card);
        });
    }

    selectCard(card) {
        // Build a state object the card can modify
        const state = {
            playerSupply: this.gameData.playerSupply,
            playerHP: this.gameData.playerHP,
            maxDeploys: MAX_NEW_DEPLOYMENTS,
            freeUnits: [],
            globalBuffs: this.gameData.globalBuffs || {},
        };

        card.effect(state);

        // Apply state changes back
        this.gameData.playerSupply = state.playerSupply;
        this.gameData.playerHP = state.playerHP;
        this.gameData.maxDeploys = state.maxDeploys;
        this.gameData.freeUnits = state.freeUnits;
        this.gameData.globalBuffs = state.globalBuffs;

        // Flash effect
        const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0.3);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => this.proceedToGame(),
        });
    }

    proceedToGame() {
        this.scene.start('GameScene', this.gameData);
    }
}
