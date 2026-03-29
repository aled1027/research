import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, COLORS } from '../utils/constants.js';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  init(data) {
    this.player = data.player;
  }

  create() {
    const margin = 15;
    const barWidth = 180;
    const barHeight = 14;

    // Background panel (top-left)
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.6);
    panelBg.fillRoundedRect(8, 8, 210, 140, 6);
    panelBg.lineStyle(1, 0x00ccff, 0.4);
    panelBg.strokeRoundedRect(8, 8, 210, 140, 6);

    // Labels
    const labelStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#88aacc',
    };

    this.add.text(margin, 16, 'HULL', labelStyle);
    this.add.text(margin, 44, 'SHIELD', labelStyle);
    this.add.text(margin, 72, 'HEAT', labelStyle);

    // Bar backgrounds and foregrounds
    this.healthBarBg = this.add.rectangle(margin + barWidth / 2 + 2, 32, barWidth, barHeight, 0x222222).setOrigin(0.5);
    this.healthBar = this.add.rectangle(margin + 2, 32, barWidth, barHeight, 0x00ff44).setOrigin(0, 0.5);

    this.shieldBarBg = this.add.rectangle(margin + barWidth / 2 + 2, 60, barWidth, barHeight, 0x222222).setOrigin(0.5);
    this.shieldBar = this.add.rectangle(margin + 2, 60, 0, barHeight, 0x4488ff).setOrigin(0, 0.5);

    this.heatBarBg = this.add.rectangle(margin + barWidth / 2 + 2, 88, barWidth, barHeight, 0x222222).setOrigin(0.5);
    this.heatBar = this.add.rectangle(margin + 2, 88, 0, barHeight, 0xff6600).setOrigin(0, 0.5);

    // Overheat warning
    this.overheatText = this.add.text(margin + barWidth / 2, 88, 'OVERHEAT', {
      fontFamily: 'Courier New, monospace',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ff0000',
    }).setOrigin(0.5).setVisible(false).setDepth(1);

    // Weapon display
    this.weaponText = this.add.text(margin, 108, 'WPN: Cannon', {
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      color: '#00ccff',
    });

    // Dash indicator
    this.dashText = this.add.text(margin, 126, 'DASH: READY', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#00ff88',
    });

    // Score (top-right)
    const scorePanelBg = this.add.graphics();
    scorePanelBg.fillStyle(0x000000, 0.6);
    scorePanelBg.fillRoundedRect(GAME_WIDTH - 178, 8, 170, 70, 6);
    scorePanelBg.lineStyle(1, 0x00ccff, 0.4);
    scorePanelBg.strokeRoundedRect(GAME_WIDTH - 178, 8, 170, 70, 6);

    this.scoreText = this.add.text(GAME_WIDTH - margin, 20, 'SCORE: 0', {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#00ccff',
    }).setOrigin(1, 0);

    this.waveText = this.add.text(GAME_WIDTH - margin, 44, 'WAVE: 1', {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#88aacc',
    }).setOrigin(1, 0);

    this.killsText = this.add.text(GAME_WIDTH - margin, 62, 'KILLS: 0', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#668899',
    }).setOrigin(1, 0);

    // Weapon slots (bottom)
    this.weaponSlots = [];
    const slotWidth = 80;
    const slotStartX = GAME_WIDTH / 2 - (slotWidth * 2);
    const slotY = GAME_HEIGHT - 40;

    const weapons = ['Cannon', 'Spread', 'Railgun', 'Missiles'];
    weapons.forEach((name, i) => {
      const x = slotStartX + i * (slotWidth + 8);
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.5);
      bg.fillRoundedRect(x, slotY - 12, slotWidth, 28, 4);
      bg.lineStyle(1, 0x445566, 0.6);
      bg.strokeRoundedRect(x, slotY - 12, slotWidth, 28, 4);

      const label = this.add.text(x + slotWidth / 2, slotY + 2, `${i + 1}:${name}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        color: '#556677',
      }).setOrigin(0.5);

      this.weaponSlots.push({ bg, label });
    });

    // Listen for HUD updates from GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('update-hud', this.updateHUD, this);
    gameScene.events.on('wave-start', (wave) => {
      this.waveText.setText(`WAVE: ${wave}`);
    });
    gameScene.events.on('weapon-changed', (weapon) => {
      this.weaponText.setText(`WPN: ${weapon.name}`);
    });

    // Cleanup on scene shutdown
    this.events.on('shutdown', () => {
      gameScene.events.off('update-hud', this.updateHUD, this);
    });
  }

  updateHUD(data) {
    const barWidth = 180;

    // Health
    const healthPct = data.health / PLAYER.MAX_HEALTH;
    this.healthBar.width = barWidth * healthPct;
    this.healthBar.fillColor = healthPct > 0.5 ? 0x00ff44 : healthPct > 0.25 ? 0xffaa00 : 0xff2200;

    // Shield
    const shieldPct = data.shield / PLAYER.MAX_SHIELD;
    this.shieldBar.width = barWidth * shieldPct;

    // Heat
    const heatPct = data.heat / PLAYER.MAX_HEAT;
    this.heatBar.width = barWidth * heatPct;
    this.heatBar.fillColor = data.overheated ? 0xff0000 : (heatPct > 0.7 ? 0xff4400 : 0xff6600);

    // Overheat warning
    this.overheatText.setVisible(data.overheated);

    // Score
    this.scoreText.setText(`SCORE: ${data.score}`);
    this.killsText.setText(`KILLS: ${this.player.kills}`);

    // Weapon
    this.weaponText.setText(`WPN: ${data.weapon.name}`);

    // Dash
    this.dashText.setText(data.dashReady ? 'DASH: READY' : 'DASH: CHARGING');
    this.dashText.setColor(data.dashReady ? '#00ff88' : '#664422');

    // Weapon slots highlight
    this.weaponSlots.forEach((slot, i) => {
      const isActive = i === this.player.currentWeaponIndex;
      slot.label.setColor(isActive ? '#00ccff' : '#556677');
      slot.bg.clear();
      slot.bg.fillStyle(isActive ? 0x00ccff : 0x000000, isActive ? 0.2 : 0.5);
      const slotWidth = 80;
      const slotStartX = GAME_WIDTH / 2 - (slotWidth * 2);
      const slotY = GAME_HEIGHT - 40;
      const x = slotStartX + i * (slotWidth + 8);
      slot.bg.fillRoundedRect(x, slotY - 12, slotWidth, 28, 4);
      slot.bg.lineStyle(1, isActive ? 0x00ccff : 0x445566, isActive ? 0.8 : 0.6);
      slot.bg.strokeRoundedRect(x, slotY - 12, slotWidth, 28, 4);
    });
  }
}
