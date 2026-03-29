import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy, spawnEnemy } from '../entities/Enemy.js';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS, ARENA_PADDING,
  WEAPONS, PLAYER, ENEMIES,
} from '../utils/constants.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.drawArena();

    // Groups
    this.playerBullets = this.physics.add.group({ runChildUpdate: false });
    this.enemyBullets = this.physics.add.group({ runChildUpdate: false });
    this.pickups = this.physics.add.group({ runChildUpdate: false });

    // Particle emitters
    this.createParticles();

    // Player
    this.player = new Player(this);

    // Enemies
    this.enemies = [];

    // Wave system
    this.wave = 1;
    this.enemiesRemaining = 0;
    this.waveActive = false;
    this.waveDelay = false;

    // Collisions
    this.setupCollisions();

    // Walls
    this.createWalls();

    // Start HUD
    this.scene.launch('HUDScene', { player: this.player });

    // Start first wave
    this.time.delayedCall(1000, () => this.startWave());

    // Cleanup bullet pool periodically
    this.time.addEvent({
      delay: 2000,
      callback: () => this.cleanupBullets(),
      loop: true,
    });
  }

  drawArena() {
    const gfx = this.add.graphics();

    // Floor grid
    gfx.lineStyle(1, COLORS.FLOOR_LINE, 0.4);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      gfx.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      gfx.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Arena border
    gfx.lineStyle(3, 0x00ccff, 0.5);
    gfx.strokeRect(
      ARENA_PADDING, ARENA_PADDING,
      GAME_WIDTH - ARENA_PADDING * 2, GAME_HEIGHT - ARENA_PADDING * 2
    );

    // Corner markers
    const corners = [
      [ARENA_PADDING, ARENA_PADDING],
      [GAME_WIDTH - ARENA_PADDING, ARENA_PADDING],
      [ARENA_PADDING, GAME_HEIGHT - ARENA_PADDING],
      [GAME_WIDTH - ARENA_PADDING, GAME_HEIGHT - ARENA_PADDING],
    ];
    corners.forEach(([cx, cy]) => {
      gfx.fillStyle(0x00ccff, 0.3);
      gfx.fillCircle(cx, cy, 6);
    });
  }

  createWalls() {
    this.walls = this.physics.add.staticGroup();

    // Create some cover obstacles in the arena
    const wallPositions = [
      { x: 250, y: 200, w: 80, h: 16 },
      { x: 750, y: 200, w: 80, h: 16 },
      { x: 250, y: 560, w: 80, h: 16 },
      { x: 750, y: 560, w: 80, h: 16 },
      { x: 512, y: 384, w: 16, h: 80 },
      { x: 150, y: 384, w: 16, h: 60 },
      { x: 874, y: 384, w: 16, h: 60 },
    ];

    wallPositions.forEach(({ x, y, w, h }) => {
      const wall = this.add.rectangle(x, y, w, h, COLORS.WALL);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    });

    // Player bounces off walls
    this.physics.add.collider(this.player.sprite, this.walls);
  }

  createParticles() {
    this.explosionEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: { min: 200, max: 500 },
      tint: [0xff4400, 0xff8800, 0xffcc00, 0xffffff],
      emitting: false,
    });
    this.explosionEmitter.setDepth(20);

    this.trailEmitter = this.add.particles(0, 0, 'trail-particle', {
      speed: { min: 20, max: 60 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      tint: COLORS.PLAYER,
      emitting: false,
    });
    this.trailEmitter.setDepth(1);
  }

  setupCollisions() {
    // Player bullets hit enemies
    this.physics.add.overlap(
      this.playerBullets,
      [], // We'll check enemies manually since they're not in a group
      null, null, this
    );

    // Enemy bullets hit player
    this.physics.add.overlap(
      this.enemyBullets,
      this.player.sprite,
      this.onEnemyBulletHitPlayer,
      null,
      this
    );

    // Player collects pickups
    this.physics.add.overlap(
      this.player.sprite,
      this.pickups,
      this.onPlayerCollectPickup,
      null,
      this
    );

    // Bullets hit walls
    this.physics.add.collider(this.playerBullets, this.walls, (bullet) => {
      this.createSmallExplosion(bullet.x, bullet.y);
      bullet.destroy();
    });
    this.physics.add.collider(this.enemyBullets, this.walls, (bullet) => {
      this.createSmallExplosion(bullet.x, bullet.y);
      bullet.destroy();
    });
  }

  // Wave system
  startWave() {
    this.waveActive = true;
    this.player.wave = this.wave;

    const waveConfig = this.getWaveConfig(this.wave);
    this.enemiesRemaining = waveConfig.total;

    this.events.emit('wave-start', this.wave);

    // Show wave text
    const waveText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50,
      `WAVE ${this.wave}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#00ccff',
        stroke: '#003344',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: waveText,
      alpha: 0,
      y: waveText.y - 40,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => waveText.destroy(),
    });

    // Spawn enemies in batches
    let spawned = 0;
    const spawnInterval = this.time.addEvent({
      delay: 800,
      callback: () => {
        if (spawned >= waveConfig.total) {
          spawnInterval.remove();
          return;
        }

        const type = this.pickEnemyType(waveConfig, spawned);
        const enemy = spawnEnemy(this, type);
        this.enemies.push(enemy);

        // Add collision with player bullets
        this.physics.add.collider(enemy.sprite, this.walls);
        this.physics.add.collider(enemy.sprite, this.player.sprite, () => {
          // Contact damage
          this.player.takeDamage(5);
        });

        spawned++;
      },
      loop: true,
    });
  }

  getWaveConfig(wave) {
    const base = 3;
    const total = base + Math.floor(wave * 1.5);
    const hasBoss = wave % 5 === 0;

    return {
      total: hasBoss ? total + 1 : total,
      grunts: Math.ceil(total * 0.5),
      tanks: wave >= 3 ? Math.floor(total * 0.2) : 0,
      snipers: wave >= 2 ? Math.floor(total * 0.3) : 0,
      bosses: hasBoss ? 1 : 0,
    };
  }

  pickEnemyType(config, index) {
    if (config.bosses > 0 && index === config.total - 1) return 'BOSS';
    if (index < config.grunts) return 'GRUNT';
    if (index < config.grunts + config.tanks) return 'TANK';
    if (index < config.grunts + config.tanks + config.snipers) return 'SNIPER';
    return 'GRUNT';
  }

  endWave() {
    this.waveActive = false;
    this.wave++;

    // Drop pickups
    this.spawnPickup(
      Phaser.Math.Between(100, GAME_WIDTH - 100),
      Phaser.Math.Between(100, GAME_HEIGHT - 100),
      'health'
    );

    if (Math.random() > 0.5) {
      this.spawnPickup(
        Phaser.Math.Between(100, GAME_WIDTH - 100),
        Phaser.Math.Between(100, GAME_HEIGHT - 100),
        'shield'
      );
    }

    // Next wave after delay
    this.waveDelay = true;
    this.time.delayedCall(3000, () => {
      this.waveDelay = false;
      if (this.player.alive) {
        this.startWave();
      }
    });
  }

  // Bullet spawning
  spawnPlayerBullet(x, y, angle, weapon) {
    const textureKey = weapon === WEAPONS.RAILGUN ? 'bullet-railgun'
      : weapon === WEAPONS.MISSILE ? 'bullet-missile'
      : 'bullet-player';

    const bullet = this.physics.add.sprite(x, y, textureKey);
    bullet.setDepth(8);
    bullet.setRotation(angle);

    const speed = weapon.speed;
    bullet.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );

    bullet.setData('damage', weapon.damage);
    bullet.setData('piercing', weapon.piercing || false);
    bullet.setData('homing', weapon.homing || false);

    this.playerBullets.add(bullet);

    // Auto-destroy after 3 seconds
    this.time.delayedCall(3000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  spawnEnemyBullet(x, y, angle, damage, speed = 300) {
    const bullet = this.physics.add.sprite(x, y, 'bullet-enemy');
    bullet.setDepth(8);
    bullet.setRotation(angle);
    bullet.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    bullet.setData('damage', damage);

    this.enemyBullets.add(bullet);

    this.time.delayedCall(4000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  // Pickups
  spawnPickup(x, y, type) {
    const textureKey = `pickup-${type}`;
    const pickup = this.physics.add.sprite(x, y, textureKey);
    pickup.setDepth(3);
    pickup.setData('type', type);

    // Bobbing animation
    this.tweens.add({
      targets: pickup,
      y: y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.pickups.add(pickup);

    // Despawn after 15 seconds
    this.time.delayedCall(15000, () => {
      if (pickup && pickup.active) {
        this.tweens.add({
          targets: pickup,
          alpha: 0,
          duration: 500,
          onComplete: () => pickup.destroy(),
        });
      }
    });
  }

  // Collision callbacks
  onEnemyBulletHitPlayer(playerSprite, bullet) {
    const damage = bullet.getData('damage') || 10;
    this.player.takeDamage(damage);
    this.createSmallExplosion(bullet.x, bullet.y);
    bullet.destroy();
  }

  onPlayerCollectPickup(playerSprite, pickup) {
    const type = pickup.getData('type');
    switch (type) {
      case 'health':
        this.player.heal(30);
        break;
      case 'shield':
        this.player.addShield(25);
        break;
      case 'weapon':
        // Random weapon unlock
        break;
    }
    this.events.emit('pickup-collected', type);

    // Flash effect
    this.cameras.main.flash(100, 0, 255, 100, true);
    pickup.destroy();
  }

  createSmallExplosion(x, y) {
    if (this.explosionEmitter) {
      this.explosionEmitter.setPosition(x, y);
      this.explosionEmitter.explode(4);
    }
  }

  // Manual bullet-enemy collision check
  checkBulletEnemyCollisions() {
    const bullets = this.playerBullets.getChildren();
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (!bullet || !bullet.active) continue;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy.alive || !enemy.sprite || !enemy.sprite.active) continue;

        const dx = bullet.x - enemy.sprite.x;
        const dy = bullet.y - enemy.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = enemy.config.size * 0.6;

        if (dist < hitRadius) {
          const damage = bullet.getData('damage') || 10;
          const piercing = bullet.getData('piercing') || false;
          const killed = enemy.takeDamage(damage);

          this.createSmallExplosion(bullet.x, bullet.y);

          if (killed) {
            this.player.score += enemy.config.score;
            this.player.kills++;
            this.enemiesRemaining--;
            this.events.emit('enemy-killed', enemy.type);

            // Chance to drop pickup
            if (Math.random() < 0.2) {
              const pickupType = Math.random() < 0.7 ? 'health' : 'shield';
              this.spawnPickup(enemy.sprite.x, enemy.sprite.y, pickupType);
            }
          }

          if (!piercing) {
            bullet.destroy();
          }
          break;
        }
      }
    }
  }

  // Homing missile logic
  updateHomingBullets() {
    const bullets = this.playerBullets.getChildren();
    bullets.forEach(bullet => {
      if (!bullet || !bullet.active || !bullet.getData('homing')) return;

      // Find closest enemy
      let closestDist = Infinity;
      let closestEnemy = null;
      this.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dx = enemy.sprite.x - bullet.x;
        const dy = enemy.sprite.y - bullet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      });

      if (closestEnemy && closestDist < 400) {
        const targetAngle = Phaser.Math.Angle.Between(
          bullet.x, bullet.y,
          closestEnemy.sprite.x, closestEnemy.sprite.y
        );
        const currentAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
        const turnRate = 0.05;
        let angleDiff = targetAngle - currentAngle;

        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);
        const speed = Math.sqrt(
          bullet.body.velocity.x ** 2 + bullet.body.velocity.y ** 2
        );
        bullet.setVelocity(
          Math.cos(newAngle) * speed,
          Math.sin(newAngle) * speed
        );
        bullet.setRotation(newAngle);
      }
    });
  }

  cleanupBullets() {
    // Remove out-of-bounds bullets
    const margin = 50;
    [this.playerBullets, this.enemyBullets].forEach(group => {
      group.getChildren().forEach(bullet => {
        if (!bullet || !bullet.active) return;
        if (bullet.x < -margin || bullet.x > GAME_WIDTH + margin ||
            bullet.y < -margin || bullet.y > GAME_HEIGHT + margin) {
          bullet.destroy();
        }
      });
    });
  }

  update(time, delta) {
    if (!this.player.alive) return;

    this.player.update(time, delta);

    // Update enemies
    this.enemies = this.enemies.filter(e => e.alive);
    this.enemies.forEach(enemy => {
      enemy.update(time, delta, this.player.sprite);
    });

    // Check collisions
    this.checkBulletEnemyCollisions();

    // Update homing bullets
    this.updateHomingBullets();

    // Check wave completion
    if (this.waveActive && this.enemies.length === 0 && this.enemiesRemaining <= 0) {
      this.endWave();
    }

    // Update HUD
    this.events.emit('update-hud', {
      health: this.player.health,
      shield: this.player.shield,
      heat: this.player.heat,
      overheated: this.player.overheated,
      score: this.player.score,
      wave: this.wave,
      weapon: this.player.weapon,
      dashReady: time - this.player.lastDashTime > PLAYER.DASH_COOLDOWN,
    });
  }
}
