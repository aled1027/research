export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

export const ARENA_PADDING = 40;

export const COLORS = {
  PLAYER: 0x00ccff,
  PLAYER_DARK: 0x0088aa,
  ENEMY_GRUNT: 0xff4444,
  ENEMY_TANK: 0xff8800,
  ENEMY_SNIPER: 0xcc00ff,
  ENEMY_BOSS: 0xff0000,
  BULLET_PLAYER: 0x00ffff,
  BULLET_ENEMY: 0xff6644,
  MISSILE: 0xffaa00,
  HEALTH_BAR: 0x00ff00,
  HEALTH_BG: 0x333333,
  SHIELD: 0x4488ff,
  HEAT: 0xff4400,
  PICKUP_HEALTH: 0x00ff88,
  PICKUP_SHIELD: 0x4488ff,
  PICKUP_WEAPON: 0xffcc00,
  WALL: 0x445566,
  FLOOR_TILE: 0x16213e,
  FLOOR_LINE: 0x1a2744,
};

export const PLAYER = {
  SPEED: 200,
  MAX_HEALTH: 100,
  MAX_SHIELD: 50,
  MAX_HEAT: 100,
  HEAT_DECAY: 30, // per second
  OVERHEAT_THRESHOLD: 90,
  OVERHEAT_COOLDOWN: 2000, // ms
  SIZE: 20,
  DASH_SPEED: 500,
  DASH_DURATION: 150,
  DASH_COOLDOWN: 1500,
};

export const WEAPONS = {
  CANNON: {
    name: 'Cannon',
    fireRate: 300,
    damage: 15,
    speed: 500,
    heat: 8,
    bulletSize: 4,
    color: 0x00ffff,
  },
  SPREAD: {
    name: 'Spread',
    fireRate: 500,
    damage: 8,
    speed: 450,
    heat: 15,
    bulletSize: 3,
    color: 0x88ffaa,
    count: 5,
    arc: 0.4,
  },
  RAILGUN: {
    name: 'Railgun',
    fireRate: 1000,
    damage: 50,
    speed: 800,
    heat: 25,
    bulletSize: 6,
    color: 0xff00ff,
    piercing: true,
  },
  MISSILE: {
    name: 'Missiles',
    fireRate: 800,
    damage: 30,
    speed: 300,
    heat: 20,
    bulletSize: 5,
    color: 0xffaa00,
    homing: true,
  },
};

export const ENEMIES = {
  GRUNT: {
    health: 30,
    speed: 80,
    damage: 8,
    fireRate: 1200,
    size: 16,
    score: 100,
    color: 0xff4444,
  },
  TANK: {
    health: 120,
    speed: 40,
    damage: 15,
    fireRate: 2000,
    size: 24,
    score: 250,
    color: 0xff8800,
  },
  SNIPER: {
    health: 20,
    speed: 60,
    damage: 25,
    fireRate: 2500,
    size: 14,
    score: 200,
    color: 0xcc00ff,
  },
  BOSS: {
    health: 500,
    speed: 50,
    damage: 20,
    fireRate: 800,
    size: 36,
    score: 1000,
    color: 0xff0000,
  },
};
