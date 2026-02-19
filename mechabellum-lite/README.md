# Mechabellum Lite

A browser-based lite version of [Mechabellum](https://en.wikipedia.org/wiki/Mechabellum), the mech auto-battler strategy game. Built with Phaser 3.

## How to Play

1. Open `index.html` in a web browser (or serve via any HTTP server)
2. Select a difficulty level from the main menu
3. **Planning Phase**: Buy and deploy units from the shop panel onto the grid
4. **Battle Phase**: Watch your army fight the AI opponent automatically
5. **Between Rounds**: Choose a reinforcement card or skip for bonus supply
6. Reduce the enemy base HP to 0 to win!

### Controls

| Action | Control |
|--------|---------|
| Select unit to deploy | Click unit in shop panel |
| Place unit on grid | Left-click valid (green) cell |
| Tech upgrades / sell | Right-click deployed unit |
| Start battle | Click BATTLE button or press SPACE |
| Cancel selection | Press ESC |
| Speed up battle | Click 1x/2x/4x or Skip buttons |

## Game Mechanics

### Economy
- Start with 200 supply in round 1
- Supply increases by 200 per round (round 2 = 400, round 3 = 600, etc.)
- Unspent supply carries over to the next round
- You can deploy up to 4 new units per round (cards can increase this)
- Units can be sold for 70% of their cost

### Flanking
From round 2 onwards, you can deploy units in the left/right columns of the enemy's territory, enabling flank attacks.

### Tech Upgrades
Right-click any of your deployed units to access 2 tech upgrade options. These cost supply but can significantly boost a unit's effectiveness.

### Reinforcement Cards
Between rounds, you're offered 3 random cards. Cards can provide:
- Bonus supply
- Free unit deployments
- Global stat buffs (HP, damage, speed, range)
- Extra deployment slots
- Base HP repair

Skip the card selection to receive +50 supply instead.

## Units

### Tier 1 (100-200 supply)
| Unit | Cost | Type | Description |
|------|------|------|-------------|
| Crawler | 100 | Melee Swarm | 24 fast melee units. Overwhelms single targets. Ground only. |
| Fang | 100 | Ranged Infantry | 16 basic ranged units. Versatile. Targets air & ground. |
| Mustang | 200 | Light Tank | 8 fast tanks. Good all-rounder. Targets air & ground. |

### Tier 2 (200-300 supply)
| Unit | Cost | Type | Description |
|------|------|------|-------------|
| Arclight | 200 | Energy Beam | 6 units with splash beam. Good crowd control. Ground only. |
| Steel Ball | 200 | Close-range Laser | 6 high-speed, high-HP units. Shreds mobs. Ground only. |
| Wasp | 200 | Light Aircraft | 8 swift aerial units. Targets air & ground. |
| Sledgehammer | 300 | Heavy Tank | 4 slow, tough tanks with splash. Ground only. |
| Stormcaller | 300 | Artillery | 3 long-range splash damage units. Ground only. |

### Tier 3 (300 supply)
| Unit | Cost | Type | Description |
|------|------|------|-------------|
| Phoenix | 300 | Strike Aircraft | 4 ranged aircraft. High DPS. Targets air & ground. |
| Marksman | 300 | Sniper | 1 unit with extreme range and damage. Targets air & ground. |

### Tier 4 (400-500 supply)
| Unit | Cost | Type | Description |
|------|------|------|-------------|
| Vulcan | 400 | Giant Flamethrower | Melts swarms with AoE fire. Ground only. |
| Melting Point | 400 | Giant Laser | Obliterates high-HP targets. Targets air & ground. |
| Fortress | 500 | Giant Guard Mech | Massive HP, artillery splash. Ground only. |
| Overlord | 500 | Giant Aircraft | Devastating aerial splash damage. Targets air & ground. |

### Counter System (Rock-Paper-Scissors)
- **Swarms** (Crawler, Fang) beat **Single targets** (Marksman, Melting Point)
- **AoE units** (Vulcan, Stormcaller) beat **Swarms**
- **Single targets** beat **AoE units** (outrange/outDPS them)
- **Air units** (Wasp, Phoenix, Overlord) are uncounterable by ground-only units
- **Anti-air** capable units (Fang, Mustang, Phoenix, Marksman, etc.) are essential

## AI Opponent

The AI selects a strategy at game start (swarm, heavy, balanced, air, or sniper) and adapts based on your unit composition:
- Detects if you have swarms and deploys AoE counters
- Detects giant units and deploys snipers/high-DPS counters
- Detects air units and ensures it has anti-air capability

Difficulty levels:
- **Easy**: AI makes suboptimal choices
- **Normal**: Balanced AI opponent
- **Hard**: AI actively counters your composition

## Technical Details

- **Engine**: Phaser 3.60
- **Graphics**: Procedurally generated sprites (no external assets)
- **Architecture**: Scene-based (Boot -> Menu -> Card Select -> Game -> Battle -> repeat)
- **No build step**: Open `index.html` directly or serve via HTTP
- **Resolution**: 1280x800, scales to fit browser window

## File Structure

```
mechabellum-lite/
  index.html              # Entry point
  js/
    constants.js          # Game constants, colors, sizes
    units.js              # 14 unit type definitions and stats
    cards.js              # Reinforcement card system
    ai.js                 # AI opponent logic
    main.js               # Phaser game configuration
    scenes/
      BootScene.js        # Procedural sprite generation
      MenuScene.js        # Main menu with difficulty select
      CardScene.js        # Reinforcement card selection
      GameScene.js        # Planning/deployment phase
      BattleScene.js      # Auto-combat simulation
```
