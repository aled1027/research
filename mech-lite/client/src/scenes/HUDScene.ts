import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';

/**
 * HUD overlay scene — runs on top of GameScene.
 * Shows persistent UI elements like tooltips and notifications.
 */
export class HUDScene extends Phaser.Scene {
  private notifications: Phaser.GameObjects.Text[] = [];
  private tooltipText!: Phaser.GameObjects.Text;
  private tooltipBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    // Tooltip (hidden by default)
    this.tooltipBg = this.add.graphics().setDepth(100).setVisible(false);
    this.tooltipText = this.add.text(0, 0, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ccddee',
      wordWrap: { width: 200 },
    }).setDepth(101).setVisible(false);

    // Listen for tooltip events from other scenes
    this.game.events.on('show_tooltip', (data: { x: number; y: number; text: string }) => {
      this.showTooltip(data.x, data.y, data.text);
    });

    this.game.events.on('hide_tooltip', () => {
      this.hideTooltip();
    });

    this.game.events.on('notification', (text: string) => {
      this.showNotification(text);
    });
  }

  showTooltip(x: number, y: number, text: string): void {
    this.tooltipText.setText(text);
    this.tooltipText.setPosition(x + 15, y + 10);
    this.tooltipText.setVisible(true);

    const bounds = this.tooltipText.getBounds();
    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(0x1a1a2e, 0.95);
    this.tooltipBg.fillRoundedRect(
      bounds.x - 8, bounds.y - 5,
      bounds.width + 16, bounds.height + 10,
      4
    );
    this.tooltipBg.lineStyle(1, 0x444466, 1);
    this.tooltipBg.strokeRoundedRect(
      bounds.x - 8, bounds.y - 5,
      bounds.width + 16, bounds.height + 10,
      4
    );
    this.tooltipBg.setVisible(true);
  }

  hideTooltip(): void {
    this.tooltipText.setVisible(false);
    this.tooltipBg.setVisible(false);
  }

  showNotification(text: string): void {
    const notif = this.add.text(GAME_WIDTH / 2, 60, text, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#334455',
      padding: { x: 12, y: 6 },
    })
      .setOrigin(0.5)
      .setDepth(200)
      .setAlpha(0);

    this.tweens.add({
      targets: notif,
      alpha: 1,
      duration: 200,
    });

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: notif,
        alpha: 0,
        y: notif.y - 30,
        duration: 500,
        onComplete: () => notif.destroy(),
      });
    });

    this.notifications.push(notif);
  }
}
