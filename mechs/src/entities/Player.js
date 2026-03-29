import Phaser from 'phaser';
import { PLAYER, WEAPONS, GAME_WIDTH, GAME_HEIGHT, ARENA_PADDING } from '../utils/constants.js';

export class Player {
  constructor(scene) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'player-mech');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.body.setSize(PLAYER.SIZE * 0.8, PLAYER.SIZE * 0.8);

    this.health = PLAYER.MAX_HEALTH;
    this.shield = 0;
    this.heat = 0;
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.overheated = false;
    this.alive = true;

    // Weapons
    this.weapons = [WEAPONS.CANNON, WEAPONS.SPREAD, WEAPONS.RAILGUN, WEAPONS.MISSILE];
    this.currentWeaponIndex = 0;
    this.lastFireTime = 0;

    // Dash
    this.isDashing = false;
    this.dashTime = 0;
    this.lastDashTime = 0;
    this.dashDirection = { x: 0, y: 0 };

    // Input
    this.cursors = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      arrowUp: 'UP', arrowDown: 'DOWN', arrowLeft: 'LEFT', arrowRight: 'RIGHT',
      dash: 'SPACE',
      weapon1: 'ONE', weapon2: 'TWO', weapon3: 'THREE', weapon4: 'FOUR',
    });

    // Weapon switching
    scene.input.keyboard.on('keydown-ONE', () => this.switchWeapon(0));
    scene.input.keyboard.on('keydown-TWO', () => this.switchWeapon(1));
    scene.input.keyboard.on('keydown-THREE', () => this.switchWeapon(2));
    scene.input.keyboard.on('keydown-FOUR', () => this.switchWeapon(3));
  }

  get weapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
      this.scene.events.emit('weapon-changed', this.weapon);
    }
  }

  update(time, delta) {
    if (!this.alive) return;

    this.updateMovement(time, delta);
    this.updateHeat(delta);
    this.updateRotation();
    this.updateShooting(time);
    this.updateDash(time);
  }

  updateMovement(time, delta) {
    if (this.isDashing) return;

    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.cursors.arrowLeft.isDown) vx = -1;
    if (this.cursors.right.isDown || this.cursors.arrowRight.isDown) vx = 1;
    if (this.cursors.up.isDown || this.cursors.arrowUp.isDown) vy = -1;
    if (this.cursors.down.isDown || this.cursors.arrowDown.isDown) vy = 1;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;
    }

    this.sprite.setVelocity(vx * PLAYER.SPEED, vy * PLAYER.SPEED);

    // Store last movement direction for dashing
    if (vx !== 0 || vy !== 0) {
      this.dashDirection = { x: vx, y: vy };
    }
  }

  updateDash(time) {
    if (this.isDashing) {
      if (time - this.dashTime > PLAYER.DASH_DURATION) {
        this.isDashing = false;
        this.sprite.setAlpha(1);
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.dash)) {
      if (time - this.lastDashTime > PLAYER.DASH_COOLDOWN) {
        this.isDashing = true;
        this.dashTime = time;
        this.lastDashTime = time;

        const dir = this.dashDirection;
        if (dir.x !== 0 || dir.y !== 0) {
          this.sprite.setVelocity(
            dir.x * PLAYER.DASH_SPEED,
            dir.y * PLAYER.DASH_SPEED
          );
        }

        this.sprite.setAlpha(0.5);

        // Trail effect
        if (this.scene.trailEmitter) {
          this.scene.trailEmitter.setPosition(this.sprite.x, this.sprite.y);
          this.scene.trailEmitter.explode(8);
        }

        this.scene.events.emit('dash-used', time);
      }
    }
  }

  updateHeat(delta) {
    const dt = delta / 1000;
    if (this.overheated) {
      this.heat = Math.max(0, this.heat - PLAYER.HEAT_DECAY * 1.5 * dt);
      if (this.heat <= 0) {
        this.overheated = false;
      }
    } else {
      this.heat = Math.max(0, this.heat - PLAYER.HEAT_DECAY * dt);
    }
  }

  updateRotation() {
    const pointer = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      pointer.worldX, pointer.worldY
    );
    this.sprite.setRotation(angle + Math.PI / 2);
  }

  updateShooting(time) {
    if (this.overheated) return;

    const pointer = this.scene.input.activePointer;
    if (pointer.isDown && time - this.lastFireTime > this.weapon.fireRate) {
      this.fire(time);
    }
  }

  fire(time) {
    const weapon = this.weapon;
    this.lastFireTime = time;

    // Add heat
    this.heat += weapon.heat;
    if (this.heat >= PLAYER.OVERHEAT_THRESHOLD) {
      this.overheated = true;
      this.scene.events.emit('overheated');
    }

    const pointer = this.scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      pointer.worldX, pointer.worldY
    );

    if (weapon.count) {
      // Spread shot
      const halfArc = weapon.arc / 2;
      for (let i = 0; i < weapon.count; i++) {
        const a = angle - halfArc + (weapon.arc / (weapon.count - 1)) * i;
        this.scene.spawnPlayerBullet(this.sprite.x, this.sprite.y, a, weapon);
      }
    } else {
      this.scene.spawnPlayerBullet(this.sprite.x, this.sprite.y, angle, weapon);
    }

    // Screen shake for heavy weapons
    if (weapon === WEAPONS.RAILGUN) {
      this.scene.cameras.main.shake(100, 0.005);
    }
  }

  takeDamage(amount) {
    if (this.isDashing) return; // Invincible during dash

    // Shield absorbs damage first
    if (this.shield > 0) {
      const shieldDmg = Math.min(this.shield, amount);
      this.shield -= shieldDmg;
      amount -= shieldDmg;
    }

    this.health -= amount;
    this.scene.events.emit('player-damaged');

    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite && this.sprite.active) {
        this.sprite.clearTint();
      }
    });

    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.sprite.setVelocity(0, 0);

    // Explosion
    if (this.scene.explosionEmitter) {
      this.scene.explosionEmitter.setPosition(this.sprite.x, this.sprite.y);
      this.scene.explosionEmitter.explode(30);
    }

    this.scene.cameras.main.shake(300, 0.02);

    this.sprite.setVisible(false);

    this.scene.time.delayedCall(1500, () => {
      this.scene.scene.stop('HUDScene');
      this.scene.scene.start('GameOverScene', {
        score: this.score,
        kills: this.kills,
        wave: this.wave,
      });
    });
  }

  heal(amount) {
    this.health = Math.min(PLAYER.MAX_HEALTH, this.health + amount);
  }

  addShield(amount) {
    this.shield = Math.min(PLAYER.MAX_SHIELD, this.shield + amount);
  }
}
