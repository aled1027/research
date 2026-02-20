# Mechabellum Lite - Development Notes

## Research Phase

### Game Mechanics Learned
- Mechabellum is an auto-battler where you deploy mech units on a grid, then they fight automatically
- Core mechanic is rock-paper-scissors countering: swarms beat giants, AoE beats swarms, giants beat AoE
- Economy: 200 supply per round, increasing by 200 each round. Unspent carries over.
- 16 unit types in 4 tiers (mob, squad, single-entity, giant)
- Planning phase (deploy/upgrade) -> Battle phase (auto-combat) -> repeat
- Flanking available from round 2+: can place units in enemy side columns
- Tech upgrades per unit (2 per unit)
- Reinforcement cards between rounds
- Win condition: reduce opponent base HP to 0

### Key Sources
- Wikipedia article for overview
- MechaMonarch unit guides for detailed stats
- Steam community discussions for economy details
- GameRant and TheGamer for strategy tips

## Implementation Decisions

### Framework
- Phaser 3.60 via CDN - mature, well-documented game framework
- No build step needed - pure browser-based with script tags
- Procedurally generated sprites (no external assets needed)

### Architecture
- 5 scenes: Boot, Menu, CardSelect, Game (planning), Battle
- Separate files for constants, unit definitions, card definitions, AI
- State passed between scenes via Phaser's scene data system

### Unit Balance
- Balanced stats around cost tiers: 100-500 supply
- Small units (Crawler, Fang) are cheap with many units per squad
- Giant units (Fortress, Overlord) are expensive single entities
- Each unit has 2 tech upgrades available
- 14 distinct units implemented (cut 2 from the original 16 to keep scope manageable: War Factory and Hacker were omitted as they have complex special mechanics)

### AI System
- Strategy-based: AI picks a strategy (swarm, heavy, balanced, air, sniper) at game start
- Counter-picking: AI analyzes player's unit composition and adjusts purchases
- Tech upgrades: AI randomly upgrades expensive units first
- Difficulty affects counter-picking aggressiveness

### What Worked
- Phaser's scene system made state management clean
- Procedural sprite generation eliminates asset dependencies
- The auto-battler format translates well to a lite implementation
- Card system adds variety between rounds

### Challenges
- Unit separation in battle (units stacking on same position) - solved with simple push-apart logic
- Balancing 14 unit types is complex - relied on the original game's relative balancing
- Managing state across scene transitions required careful data passing
- Making the AI competitive but not unfair
