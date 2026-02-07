import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { networkClient } from '../utils/network-client';
import { gameState } from '../utils/game-state';

/**
 * Lobby scene for setting up a match before starting.
 */
export class LobbyScene extends Phaser.Scene {
  private mode: string = 'coop';
  private statusText!: Phaser.GameObjects.Text;
  private playersText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LobbyScene' });
  }

  init(data: { mode: string }): void {
    this.mode = data.mode || 'coop';
  }

  create(): void {
    const modeLabel = this.mode === 'coop' ? 'CO-OP (2v2)' : '1v1 vs BOT';

    this.add.text(GAME_WIDTH / 2, 80, `LOBBY - ${modeLabel}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#00ff88',
    }).setOrigin(0.5);

    // Status
    this.statusText = this.add.text(GAME_WIDTH / 2, 160, 'Setting up match...', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#8888aa',
    }).setOrigin(0.5);

    // Player list
    this.playersText = this.add.text(GAME_WIDTH / 2, 280, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ccddee',
      align: 'center',
    }).setOrigin(0.5);

    // Start button (for local mode, start immediately)
    this.createButton(GAME_WIDTH / 2, 500, 'START MATCH', () => {
      this.startMatch();
    });

    // Back button
    this.createButton(GAME_WIDTH / 2, 580, 'BACK', () => {
      networkClient.disconnect();
      this.scene.start('MenuScene');
    });

    // For local testing, skip network setup
    this.statusText.setText('Ready to start! (Local mode)');
    this.updatePlayersList();
  }

  private startMatch(): void {
    this.scene.start('GameScene', {
      mode: this.mode === 'coop' ? 'local_coop' : 'local_1v1',
      matchId: `match_${Date.now()}`,
    });
  }

  private updatePlayersList(): void {
    const lines = [
      '── Team 1 (You) ──',
      `  Player 1: You`,
    ];

    if (this.mode === 'coop') {
      lines.push(`  Player 2: (Waiting...)`);
    }

    lines.push('', '── Team 2 (Bots) ──');
    lines.push(`  Bot 1: AI (Medium)`);

    if (this.mode === 'coop') {
      lines.push(`  Bot 2: AI (Medium)`);
    }

    this.playersText.setText(lines.join('\n'));
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
