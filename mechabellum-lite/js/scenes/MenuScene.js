// Main menu scene
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // Background
        this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

        // Title
        this.add.text(cx, 120, 'MECHABELLUM', {
            fontSize: '64px',
            fontFamily: 'monospace',
            color: '#4488ff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(cx, 180, 'L I T E', {
            fontSize: '28px',
            fontFamily: 'monospace',
            color: '#88aacc',
            letterSpacing: 12,
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, 240, 'Auto-Battler Strategy Game', {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#667788',
        }).setOrigin(0.5);

        // Difficulty selection
        this.add.text(cx, 340, 'SELECT DIFFICULTY', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#aabbcc',
        }).setOrigin(0.5);

        const difficulties = [
            { label: 'Easy', value: 'easy', color: '#44aa44', desc: 'AI makes suboptimal choices' },
            { label: 'Normal', value: 'normal', color: '#4488ff', desc: 'Balanced AI opponent' },
            { label: 'Hard', value: 'hard', color: '#ff6644', desc: 'AI actively counters you' },
        ];

        difficulties.forEach((diff, i) => {
            const y = 400 + i * 70;
            const btn = this.add.rectangle(cx, y, 280, 50, 0x1a2a3a)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => btn.setFillStyle(0x2a3a4a))
                .on('pointerout', () => btn.setFillStyle(0x1a2a3a))
                .on('pointerdown', () => {
                    this.scene.start('GameScene', { difficulty: diff.value });
                });

            this.add.text(cx, y - 5, diff.label, {
                fontSize: '22px',
                fontFamily: 'monospace',
                color: diff.color,
                fontStyle: 'bold',
            }).setOrigin(0.5);

            this.add.text(cx, y + 15, diff.desc, {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#667788',
            }).setOrigin(0.5);
        });

        // Controls info
        const controlsY = 650;
        this.add.text(cx, controlsY, [
            'HOW TO PLAY:',
            'Select units from the shop panel, then click the grid to deploy.',
            'Right-click a deployed unit for tech upgrades. Press BATTLE when ready.',
            'Units fight automatically. Destroy the enemy or reduce their HP to 0!',
        ].join('\n'), {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#556677',
            align: 'center',
            lineSpacing: 4,
        }).setOrigin(0.5);

        // Version
        this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v1.0 - Phaser 3', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#334455',
        }).setOrigin(1, 1);
    }
}
