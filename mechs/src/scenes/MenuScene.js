import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Animated background grid
    this.drawGrid();

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 180, 'MECHS', {
      fontFamily: 'Courier New, monospace',
      fontSize: '80px',
      fontStyle: 'bold',
      color: '#00ccff',
      stroke: '#004466',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 250, 'A R E N A', {
      fontFamily: 'Courier New, monospace',
      fontSize: '28px',
      color: '#0088aa',
      letterSpacing: 12,
    }).setOrigin(0.5);

    // Pulsing title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start button
    const startBtn = this.createButton(GAME_WIDTH / 2, 400, 'START MISSION', () => {
      this.scene.start('GameScene');
    });

    // Controls info
    const controlsY = 520;
    const style = {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#668899',
      align: 'center',
    };

    this.add.text(GAME_WIDTH / 2, controlsY, 'CONTROLS', {
      ...style, fontSize: '18px', color: '#00ccff',
    }).setOrigin(0.5);

    const controls = [
      'WASD / Arrow Keys — Move',
      'Mouse — Aim',
      'Left Click — Fire',
      'SPACE — Dash',
      '1-4 — Switch Weapons',
    ];

    controls.forEach((text, i) => {
      this.add.text(GAME_WIDTH / 2, controlsY + 30 + i * 22, text, style).setOrigin(0.5);
    });

    // Version
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v1.0', {
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      color: '#334455',
    }).setOrigin(1, 1);
  }

  drawGrid() {
    const gfx = this.add.graphics();
    gfx.lineStyle(1, COLORS.FLOOR_LINE, 0.3);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      gfx.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      gfx.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  createButton(x, y, text, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x00ccff, 0.15);
    bg.fillRoundedRect(-120, -25, 240, 50, 8);
    bg.lineStyle(2, 0x00ccff, 0.8);
    bg.strokeRoundedRect(-120, -25, 240, 50, 8);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Courier New, monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#00ccff',
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(240, 50);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x00ccff, 0.3);
      bg.fillRoundedRect(-120, -25, 240, 50, 8);
      bg.lineStyle(2, 0x00ffff, 1);
      bg.strokeRoundedRect(-120, -25, 240, 50, 8);
      label.setColor('#00ffff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x00ccff, 0.15);
      bg.fillRoundedRect(-120, -25, 240, 50, 8);
      bg.lineStyle(2, 0x00ccff, 0.8);
      bg.strokeRoundedRect(-120, -25, 240, 50, 8);
      label.setColor('#00ccff');
    });

    btn.on('pointerdown', callback);

    return btn;
  }
}
