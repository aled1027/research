import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';

/**
 * Main menu scene. Entry point for creating or joining matches.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Title
    this.add.text(GAME_WIDTH / 2, 120, 'MECHABELLUM LITE', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 180, 'A Cooperative Auto-Battler', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#8888aa',
    }).setOrigin(0.5);

    // Co-op vs Bots button
    this.createButton(GAME_WIDTH / 2, 320, 'CO-OP vs BOTS (2v2)', () => {
      this.scene.start('LobbyScene', { mode: 'coop' });
    });

    // 1v1 vs Bot button
    this.createButton(GAME_WIDTH / 2, 400, '1v1 vs BOT', () => {
      this.scene.start('LobbyScene', { mode: '1v1' });
    });

    // Local test mode (no server needed)
    this.createButton(GAME_WIDTH / 2, 480, 'LOCAL TEST', () => {
      this.scene.start('GameScene', { mode: 'local', matchId: 'local_test' });
    });

    // Version info
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'v0.1.0 - Phase 1 Prototype', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#555577',
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const btn = this.add.image(x, y, 'btn_normal').setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, text, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ccddee',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setTexture('btn_hover');
      label.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      btn.setTexture('btn_normal');
      label.setColor('#ccddee');
    });

    btn.on('pointerdown', callback);
  }
}
