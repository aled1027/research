import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalKills = data.kills || 0;
    this.finalWave = data.wave || 1;
  }

  create() {
    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    // Game Over title
    const title = this.add.text(GAME_WIDTH / 2, 180, 'MECH DESTROYED', {
      fontFamily: 'Courier New, monospace',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ff4444',
      stroke: '#440000',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 160,
      duration: 800,
      ease: 'Power2',
    });

    // Stats
    const statStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '20px',
      color: '#88aacc',
      align: 'center',
    };

    const stats = [
      `FINAL SCORE:  ${this.finalScore}`,
      `WAVES CLEARED:  ${this.finalWave - 1}`,
      `TOTAL KILLS:  ${this.finalKills}`,
    ];

    stats.forEach((text, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 280 + i * 40, text, statStyle)
        .setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: t,
        alpha: 1,
        delay: 600 + i * 200,
        duration: 500,
      });
    });

    // Ranking
    const rank = this.getRank(this.finalScore);
    const rankText = this.add.text(GAME_WIDTH / 2, 420, `RANK: ${rank}`, {
      fontFamily: 'Courier New, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffcc00',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: rankText,
      alpha: 1,
      delay: 1400,
      duration: 500,
    });

    // Restart button
    this.time.delayedCall(1800, () => {
      const restartBtn = this.createButton(GAME_WIDTH / 2, 520, 'DEPLOY AGAIN', () => {
        this.scene.start('GameScene');
      });

      const menuBtn = this.createButton(GAME_WIDTH / 2, 580, 'MAIN MENU', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  getRank(score) {
    if (score >= 10000) return 'S - LEGENDARY PILOT';
    if (score >= 5000) return 'A - ACE';
    if (score >= 2500) return 'B - VETERAN';
    if (score >= 1000) return 'C - SOLDIER';
    if (score >= 500) return 'D - ROOKIE';
    return 'E - CADET';
  }

  createButton(x, y, text, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x00ccff, 0.15);
    bg.fillRoundedRect(-120, -20, 240, 40, 6);
    bg.lineStyle(2, 0x00ccff, 0.8);
    bg.strokeRoundedRect(-120, -20, 240, 40, 6);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Courier New, monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#00ccff',
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(240, 40);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x00ccff, 0.3);
      bg.fillRoundedRect(-120, -20, 240, 40, 6);
      bg.lineStyle(2, 0x00ffff, 1);
      bg.strokeRoundedRect(-120, -20, 240, 40, 6);
      label.setColor('#00ffff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x00ccff, 0.15);
      bg.fillRoundedRect(-120, -20, 240, 40, 6);
      bg.lineStyle(2, 0x00ccff, 0.8);
      bg.strokeRoundedRect(-120, -20, 240, 40, 6);
      label.setColor('#00ccff');
    });

    btn.on('pointerdown', callback);

    btn.setAlpha(0);
    this.tweens.add({
      targets: btn,
      alpha: 1,
      duration: 400,
    });

    return btn;
  }
}
