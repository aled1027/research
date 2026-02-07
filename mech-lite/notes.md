# Mechabellum Lite — Development Notes

## Implementation Approach

Built the full game system following the PRD's 4-phase plan, starting with shared types/config, then server simulation, then client rendering.

### Architecture Decisions

- **Local-first**: The client can run the full game loop locally using the server's `MatchManager` directly (no network needed for testing). This speeds up iteration dramatically.
- **Shared types**: All type definitions live in `shared/src/types.ts` so both client and server use identical interfaces.
- **Deterministic combat**: The `CombatEngine` uses fixed-timestep simulation (20 ticks/sec), sorted unit processing by `instanceId`, and no randomness during combat. Same inputs always produce the same output (verified by checksum tests).
- **Procedural textures**: No external assets needed — all unit sprites and UI elements are generated in `BootScene` using Phaser's Graphics API. Each unit type has a distinct shape and color.

### Phase 0 — Foundation

- Set up monorepo with `client/`, `server/`, `shared/` workspaces
- Phaser 3 client with Vite bundler
- Cloudflare Worker + Durable Object scaffold (`MatchRoom`)
- WebSocket networking layer with reconnect support
- Full type system for units, combat, matches, and networking

### Phase 1 — Core Loop

- **Planning UI**: Grid-based board with deployment zones, drag-to-place from shop
- **Shop**: Buy units, unlock higher tiers, purchase global upgrades
- **Combat Engine**: Fixed-step simulation with proper targeting (nearest, highest_hp, etc.), armor/damage resolution, AoE splash, chain attacks
- **Playback**: CombatScene replays events with tweened movement, projectiles, damage numbers, and explosions

### Phase 2 — Co-op & AI

- **BotAI**: 3 difficulty levels (easy/medium/hard) with phase-aware composition templates
- **Co-op support**: Shared team board with left/right deployment zones
- **MatchManager**: Handles full match lifecycle — lobby → shopping → planning → commit → combat → results → next round or finish
- **Automatic bot generation**: Server adds bot opponents when match starts

### Phase 3 — Polish

- **Visual clarity**: Team-colored rings, distinct unit shapes by tier, deployment zone highlights
- **Playback controls**: Pause, speed (1x/2x/4x), skip
- **HUD overlay**: Tooltips, notifications system
- **Reconnect handling**: NetworkClient with exponential backoff (up to 5 attempts)
- **Debug tools**: Determinism checksum display, combat log system

## Things That Worked Well

1. Running the full simulation locally without a server made the development loop very fast
2. The procedural texture generation approach eliminated any asset pipeline complexity
3. Having shared types caught many interface mismatches early
4. The seeded PRNG in BotAI ensures bots are deterministic for replay verification

## Known Limitations / Future Work

- No actual Cloudflare deployment yet (Durable Objects scaffolded but untested in CF environment)
- Combat playback unit initialization could be improved (currently guesses from event data)
- No save/load of match state
- No sound effects or music
- No unit selection highlighting during combat
- Board scrolling not implemented (fixed viewport at 1280x720)
- The GameScene doesn't persist the MatchManager across rounds cleanly (scene restart creates new one)

## Test Results

27 tests passing across 3 test suites:
- `combat-engine.test.ts`: 8 tests (determinism, AoE, chain attacks, targeting, upgrades)
- `match-manager.test.ts`: 12 tests (lifecycle, economy, placement, combat trigger, scoring)
- `bot-ai.test.ts`: 7 tests (planning, budget, unlocks, determinism, difficulty scaling)
