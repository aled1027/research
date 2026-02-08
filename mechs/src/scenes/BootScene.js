import Phaser from 'phaser';
import { COLORS } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  generateTextures() {
    // Player mech
    this.createMechTexture('player-mech', COLORS.PLAYER, COLORS.PLAYER_DARK, 20);

    // Enemy textures
    this.createMechTexture('enemy-grunt', 0xff4444, 0xaa2222, 16);
    this.createMechTexture('enemy-tank', 0xff8800, 0xaa5500, 24);
    this.createMechTexture('enemy-sniper', 0xcc00ff, 0x8800aa, 14);
    this.createMechTexture('enemy-boss', 0xff0000, 0xaa0000, 36);

    // Bullets
    this.createBulletTexture('bullet-player', COLORS.BULLET_PLAYER, 4);
    this.createBulletTexture('bullet-enemy', COLORS.BULLET_ENEMY, 4);
    this.createBulletTexture('bullet-railgun', 0xff00ff, 6);
    this.createBulletTexture('bullet-missile', COLORS.MISSILE, 5);

    // Pickups
    this.createPickupTexture('pickup-health', COLORS.PICKUP_HEALTH);
    this.createPickupTexture('pickup-shield', COLORS.PICKUP_SHIELD);
    this.createPickupTexture('pickup-weapon', COLORS.PICKUP_WEAPON);

    // Explosion particle
    const expGfx = this.make.graphics({ add: false });
    expGfx.fillStyle(0xffffff, 1);
    expGfx.fillCircle(4, 4, 4);
    expGfx.generateTexture('particle', 8, 8);
    expGfx.destroy();

    // Dash trail particle
    const trailGfx = this.make.graphics({ add: false });
    trailGfx.fillStyle(COLORS.PLAYER, 0.5);
    trailGfx.fillCircle(3, 3, 3);
    trailGfx.generateTexture('trail-particle', 6, 6);
    trailGfx.destroy();
  }

  createMechTexture(key, color, darkColor, size) {
    const gfx = this.make.graphics({ add: false });
    const s = size;

    // Body (hexagonal mech shape)
    gfx.fillStyle(darkColor, 1);
    gfx.fillRect(s * 0.2, s * 0.1, s * 0.6, s * 0.8);

    gfx.fillStyle(color, 1);
    gfx.fillRect(s * 0.3, s * 0.15, s * 0.4, s * 0.7);

    // Shoulders / weapon mounts
    gfx.fillStyle(darkColor, 1);
    gfx.fillRect(0, s * 0.25, s * 0.25, s * 0.3);
    gfx.fillRect(s * 0.75, s * 0.25, s * 0.25, s * 0.3);

    // Cockpit / visor
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillRect(s * 0.35, s * 0.2, s * 0.3, s * 0.12);

    // Gun barrel (forward)
    gfx.fillStyle(color, 1);
    gfx.fillRect(s * 0.45, 0, s * 0.1, s * 0.2);

    gfx.generateTexture(key, s, s);
    gfx.destroy();
  }

  createBulletTexture(key, color, size) {
    const gfx = this.make.graphics({ add: false });
    gfx.fillStyle(color, 1);
    gfx.fillCircle(size, size, size);
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(size, size, size * 0.4);
    gfx.generateTexture(key, size * 2, size * 2);
    gfx.destroy();
  }

  createPickupTexture(key, color) {
    const gfx = this.make.graphics({ add: false });
    const s = 12;
    gfx.fillStyle(color, 0.3);
    gfx.fillCircle(s, s, s);
    gfx.fillStyle(color, 0.8);
    gfx.fillCircle(s, s, s * 0.6);
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillCircle(s, s, s * 0.25);
    gfx.generateTexture(key, s * 2, s * 2);
    gfx.destroy();
  }
}
