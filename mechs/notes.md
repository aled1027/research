# Mechs Arena - Development Notes

## Research Phase

- Investigated existing mech games: MechWarrior, Into the Breach, Mechabellum, Mech Arena, Mech Crusaders
- Key mechanics across the genre: movement, aiming, multiple weapon types, heat management, wave-based combat, different enemy types with distinct AI behaviors
- Decided on a top-down arena shooter style - most suitable for a browser mini-game

## Design Decisions

### Game Engine: Phaser 3
- Mature, well-documented browser game engine
- Built-in arcade physics (perfect for a top-down shooter)
- Canvas/WebGL rendering with automatic fallback
- Easy to bundle with Vite for Cloudflare deployment

### Gameplay Style
- Top-down twin-stick style (WASD + mouse aim)
- Wave-based survival with escalating difficulty
- 4 weapon types with heat management system
- Dash mechanic for evasion (with invincibility frames)
- 4 enemy types with distinct AI: Grunt (chase/strafe), Tank (slow/heavy), Sniper (keep distance), Boss (phase-based)

### Deployment: Cloudflare Pages
- Static site deployment via Vite build
- `wrangler.toml` configured for Pages
- Build output goes to `dist/` directory

## Implementation Notes

### Architecture
- Scene-based structure: Boot → Menu → Game → HUD → GameOver
- All textures generated procedurally at boot (no external assets needed)
- Entity system: Player and Enemy classes manage their own sprites and behavior
- HUD runs as a parallel scene overlay

### Weapon System
1. **Cannon** - Standard balanced weapon, low heat, medium damage
2. **Spread** - 5 bullets in an arc, good for groups
3. **Railgun** - High damage, piercing, screen shake, high heat
4. **Missiles** - Homing projectiles that track nearest enemy

### Heat Mechanic
- Each weapon generates heat when fired
- Heat decays over time
- At 90% heat: OVERHEAT - cannot fire until fully cooled
- Adds tactical decision-making about weapon usage

### Enemy AI
- **Grunt**: Chases player, strafes at close range
- **Tank**: Slow but steady advance, high HP
- **Sniper**: Maintains distance, retreats if player gets close, high damage shots
- **Boss**: Appears every 5 waves, phase-based AI alternating chase and circle strafe, fires spread shots

### Wave System
- Progressive difficulty: more enemies each wave
- Enemy composition changes with wave number (snipers from wave 2, tanks from wave 3)
- Boss every 5 waves
- Health and shield pickups between waves
- Random pickup drops from killed enemies (20% chance)

## Things Learned
- Phaser 3 particle system uses `add.particles()` with texture key and config
- Scene communication works well via events system (`scene.events.emit/on`)
- Procedural texture generation avoids need for asset pipeline
- Arcade physics `overlap` vs `collider` - overlap doesn't separate bodies, collider does
- Manual collision checking gives more control for piercing bullets
