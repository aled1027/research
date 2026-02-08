# MECHS Arena

A browser-based top-down mech arena combat game built with Phaser 3, deployable to Cloudflare Pages.

## Gameplay

Pilot your mech through waves of increasingly dangerous enemy mechs. Manage your heat, switch between weapons, and survive as long as you can.

### Controls
| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Move |
| Mouse | Aim |
| Left Click | Fire |
| Space | Dash (invincible) |
| 1-4 | Switch weapons |

### Weapons
- **Cannon** (1) - Balanced primary weapon. Low heat, steady damage.
- **Spread** (2) - 5 bullets in an arc. Great for groups of enemies.
- **Railgun** (3) - High damage piercing shot. Heavy heat cost.
- **Missiles** (4) - Homing projectiles that track the nearest enemy.

### Mechanics
- **Heat System**: Firing generates heat. Overheat at 90% disables weapons until fully cooled.
- **Dash**: Quick evasive burst with invincibility frames. Has a cooldown.
- **Shield**: Absorbs damage before health. Picked up from drops.
- **Pickups**: Health and shield pickups drop between waves and from killed enemies.

### Enemies
| Type | Behavior |
|------|----------|
| Grunt (red) | Chases and strafes. Fast, low HP. |
| Tank (orange) | Slow advance. High HP, heavy shots. |
| Sniper (purple) | Keeps distance. High damage, low HP. |
| Boss (large red) | Every 5 waves. Phase-based AI, spread fire. |

## Tech Stack

- **Game Engine**: [Phaser 3](https://phaser.io/) — 2D game framework with arcade physics
- **Build Tool**: [Vite](https://vitejs.dev/) — fast bundler and dev server
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/) — static site hosting

All graphics are procedurally generated at boot time — no external asset files needed.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Cloudflare Pages

### Option 1: Wrangler CLI
```bash
npm install -g wrangler
wrangler login
npm run deploy
```

### Option 2: Cloudflare Dashboard
1. Connect your Git repository in Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`

## Project Structure

```
mechs/
├── index.html              # Entry HTML
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── wrangler.toml           # Cloudflare Pages config
├── src/
│   ├── main.js             # Phaser game config and bootstrap
│   ├── scenes/
│   │   ├── BootScene.js    # Procedural texture generation
│   │   ├── MenuScene.js    # Title screen
│   │   ├── GameScene.js    # Core gameplay loop
│   │   ├── HUDScene.js     # Heads-up display overlay
│   │   └── GameOverScene.js # Score screen
│   ├── entities/
│   │   ├── Player.js       # Player mech with weapons and dash
│   │   └── Enemy.js        # Enemy AI with 4 types
│   └── utils/
│       └── constants.js    # Game balance constants
├── notes.md                # Development notes
└── README.md               # This file
```
