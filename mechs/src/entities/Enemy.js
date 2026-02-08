import Phaser from 'phaser';
import { ENEMIES, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export class Enemy {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.type = type;
    const config = ENEMIES[type];
    this.config = config;

    const textureKey = `enemy-${type.toLowerCase()}`;
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDepth(5);
    this.sprite.body.setSize(config.size * 0.8, config.size * 0.8);
    this.sprite.setCollideWorldBounds(true);

    this.health = config.health;
    this.maxHealth = config.health;
    this.lastFireTime = 0;
    this.alive = true;

    // Health bar
    this.healthBar = scene.add.graphics();
    this.healthBar.setDepth(6);

    // AI state
    this.aiState = 'chase';
    this.stateTimer = 0;
    this.strafeDir = Math.random() > 0.5 ? 1 : -1;

    // Reference back from sprite to enemy
    this.sprite.setData('enemy', this);
  }

  update(time, delta, playerSprite) {
    if (!this.alive || !playerSprite || !playerSprite.active) return;

    const dx = playerSprite.x - this.sprite.x;
    const dy = playerSprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Rotate toward player
    this.sprite.setRotation(angle + Math.PI / 2);

    // AI behavior based on type
    this.updateAI(time, delta, dx, dy, dist, angle, playerSprite);

    // Shooting
    this.updateShooting(time, angle, dist);

    // Update health bar
    this.drawHealthBar();
  }

  updateAI(time, delta, dx, dy, dist, angle, playerSprite) {
    const config = this.config;
    const speed = config.speed;

    switch (this.type) {
      case 'GRUNT':
        // Chase player, get close
        if (dist > 150) {
          this.sprite.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        } else {
          // Strafe around player
          this.stateTimer += delta;
          if (this.stateTimer > 2000) {
            this.strafeDir *= -1;
            this.stateTimer = 0;
          }
          const strafeAngle = angle + (Math.PI / 2) * this.strafeDir;
          this.sprite.setVelocity(
            Math.cos(strafeAngle) * speed,
            Math.sin(strafeAngle) * speed
          );
        }
        break;

      case 'TANK':
        // Slow advance, always moving toward player
        this.sprite.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
        break;

      case 'SNIPER':
        // Keep distance, retreat if too close
        if (dist < 300) {
          this.sprite.setVelocity(
            -Math.cos(angle) * speed * 1.5,
            -Math.sin(angle) * speed * 1.5
          );
        } else if (dist > 450) {
          this.sprite.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        } else {
          // Strafe
          const strafeAngle = angle + (Math.PI / 2) * this.strafeDir;
          this.sprite.setVelocity(
            Math.cos(strafeAngle) * speed * 0.5,
            Math.sin(strafeAngle) * speed * 0.5
          );
          this.stateTimer += delta;
          if (this.stateTimer > 3000) {
            this.strafeDir *= -1;
            this.stateTimer = 0;
          }
        }
        break;

      case 'BOSS':
        // Phase-based AI
        this.stateTimer += delta;
        const phase = this.stateTimer % 6000;
        if (phase < 3000) {
          // Chase
          this.sprite.setVelocity(
            Math.cos(angle) * speed * 1.2,
            Math.sin(angle) * speed * 1.2
          );
        } else {
          // Circle strafe
          const circleAngle = angle + Math.PI / 2;
          this.sprite.setVelocity(
            Math.cos(circleAngle) * speed * 1.5,
            Math.sin(circleAngle) * speed * 1.5
          );
        }
        break;
    }
  }

  updateShooting(time, angle, dist) {
    if (time - this.lastFireTime < this.config.fireRate) return;
    if (dist > 600) return; // Don't shoot if too far

    this.lastFireTime = time;

    if (this.type === 'BOSS') {
      // Boss fires a spread
      for (let i = -2; i <= 2; i++) {
        this.scene.spawnEnemyBullet(
          this.sprite.x, this.sprite.y,
          angle + i * 0.2,
          this.config.damage
        );
      }
    } else if (this.type === 'SNIPER') {
      // Sniper fires fast, accurate shot
      this.scene.spawnEnemyBullet(
        this.sprite.x, this.sprite.y,
        angle,
        this.config.damage,
        600
      );
    } else {
      this.scene.spawnEnemyBullet(
        this.sprite.x, this.sprite.y,
        angle,
        this.config.damage
      );
    }
  }

  drawHealthBar() {
    this.healthBar.clear();
    if (this.health >= this.maxHealth) return;

    const barWidth = this.config.size * 1.5;
    const barHeight = 3;
    const x = this.sprite.x - barWidth / 2;
    const y = this.sprite.y - this.config.size - 8;

    // Background
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(x, y, barWidth, barHeight);

    // Health
    const healthPct = this.health / this.maxHealth;
    const color = healthPct > 0.5 ? 0x00ff00 : healthPct > 0.25 ? 0xffaa00 : 0xff0000;
    this.healthBar.fillStyle(color, 0.9);
    this.healthBar.fillRect(x, y, barWidth * healthPct, barHeight);
  }

  takeDamage(amount) {
    this.health -= amount;

    // Flash white
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.sprite && this.sprite.active) {
        this.sprite.clearTint();
      }
    });

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.alive = false;

    // Explosion effect
    if (this.scene.explosionEmitter) {
      this.scene.explosionEmitter.setPosition(this.sprite.x, this.sprite.y);
      const particles = this.type === 'BOSS' ? 25 : 12;
      this.scene.explosionEmitter.explode(particles);
    }

    // Screen shake for boss
    if (this.type === 'BOSS') {
      this.scene.cameras.main.shake(400, 0.015);
    }

    this.healthBar.destroy();
    this.sprite.destroy();
  }

  destroy() {
    if (this.healthBar) this.healthBar.destroy();
    if (this.sprite) this.sprite.destroy();
  }
}

export function spawnEnemy(scene, type) {
  // Spawn from edges
  const side = Phaser.Math.Between(0, 3);
  let x, y;
  const margin = 30;

  switch (side) {
    case 0: x = Phaser.Math.Between(margin, GAME_WIDTH - margin); y = -margin; break;
    case 1: x = GAME_WIDTH + margin; y = Phaser.Math.Between(margin, GAME_HEIGHT - margin); break;
    case 2: x = Phaser.Math.Between(margin, GAME_WIDTH - margin); y = GAME_HEIGHT + margin; break;
    case 3: x = -margin; y = Phaser.Math.Between(margin, GAME_HEIGHT - margin); break;
  }

  return new Enemy(scene, x, y, type);
}
