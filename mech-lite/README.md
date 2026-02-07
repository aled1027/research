# Mechabellum Lite

A cooperative auto-battler for the browser, inspired by Mechabellum. Built with Phaser 3 (client) and Cloudflare Workers (server).

## Overview

Mechabellum Lite is a 2-player cooperative game (2 humans vs 2 AI opponents) with an auto-battler core loop:

1. **Shop** — Spend currency to buy/unlock units and upgrades
2. **Plan** — Place units on your deployment zone
3. **Commit** — Lock in your formation
4. **Auto-Battle** — Watch deterministic combat play out
5. **Results** — See who won the round, then repeat

Matches target ~10 minutes across 6-8 rounds with aggressive economy scaling.

## Project Structure

```
mech-lite/
├── shared/src/           # Shared types and configuration
│   ├── types.ts          # All game types (units, combat, networking)
│   └── config.ts         # Unit stats, balance constants, match defaults
│
├── server/src/           # Server-side game logic
│   ├── simulation/
│   │   ├── combat-engine.ts   # Deterministic combat simulation
│   │   └── match-manager.ts   # Match lifecycle management
│   ├── ai/
│   │   └── bot-ai.ts          # Bot opponent AI (3 difficulty levels)
│   ├── durable-objects/
│   │   └── match-room.ts      # Cloudflare Durable Object for match state
│   ├── handlers/
│   │   └── worker.ts          # Cloudflare Worker entry point / API routes
│   └── utils/
│       └── determinism.ts     # Fixed-point math, checksums
│
├── client/src/           # Phaser 3 client
│   ├── scenes/
│   │   ├── BootScene.ts       # Asset generation (procedural textures)
│   │   ├── MenuScene.ts       # Main menu
│   │   ├── LobbyScene.ts      # Match setup
│   │   ├── GameScene.ts       # Shop + planning phase
│   │   ├── CombatScene.ts     # Battle playback with animations
│   │   ├── ResultsScene.ts    # End-of-match results
│   │   └── HUDScene.ts        # Overlay (tooltips, notifications)
│   ├── systems/
│   │   └── combat-log.ts      # Human-readable combat log
│   ├── entities/
│   │   └── unit-entity.ts     # Unit visual representation
│   ├── ui/
│   │   └── shop-panel.ts      # Shop data logic
│   ├── utils/
│   │   ├── network-client.ts  # WebSocket client with reconnect
│   │   └── game-state.ts      # Client-side state manager
│   ├── config/
│   │   └── game-config.ts     # Phaser configuration
│   └── main.ts               # Entry point
│
└── tests/                # Test suites (vitest)
    ├── combat-engine.test.ts
    ├── match-manager.test.ts
    └── bot-ai.test.ts
```

## Unit Roster

| Unit | Tier | Cost | Role | Key Stat |
|------|------|------|------|----------|
| Crawler | 1 | 50 | Swarm melee | Fast, cheap, low HP |
| Mustang | 1 | 100 | Light ranged DPS | Versatile, decent range |
| Arclight | 2 | 200 | Chain control | Chains damage between grouped enemies |
| Marksman | 2 | 250 | Single-target sniper | Targets highest HP, long range |
| Sledgehammer | 2 | 250 | AoE artillery | Splash damage against clusters |
| Vulcan | 3 | 400 | Anti-swarm anchor | Very high attack speed |
| Rhino | 3 | 450 | Siege frontliner | Heavy armor and HP |

## Combat System

- **Fixed-timestep** simulation at 20 ticks/second
- **Deterministic**: Same inputs always produce the same output (verified by checksum)
- **Targeting types**: nearest, highest_hp, lowest_hp, prefer_large, prefer_small
- **Damage resolution**: `max(1, damage * multiplier - armor)`
- **Special attacks**: AoE splash (Sledgehammer), chain lightning (Arclight)
- **No randomness** during combat — all RNG resolved before combat starts

## AI Opponents

Bot AI uses composition-based logic (not stat cheating):

- **Easy**: Swarm-heavy, simple formations
- **Medium**: Mixed arms, phase-aware unlocks and upgrades
- **Hard**: Counter-focused builds, optimized compositions

AI decisions are deterministic via seeded PRNG for replay verification.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Client | Phaser 3, TypeScript, Vite |
| Server | Cloudflare Workers, Durable Objects |
| Networking | WebSockets (real-time sync) |
| Testing | Vitest |
| Rendering | 2D procedural sprites (no external assets) |

## Running Locally

```bash
# Install dependencies
cd mech-lite && npm install

# Run tests
npx vitest run

# Start client dev server (local mode, no server needed)
cd client && npm run dev
```

The client supports a **Local Test** mode that runs the full game loop without a server by using the `MatchManager` directly in the browser.

## Game Modes

- **Co-op (2v2)**: Two human players share a team board with left/right deployment zones. Both must ready up to commit.
- **1v1 vs Bot**: Single player against a bot opponent.

## Development Phases Implemented

- **Phase 0 (Foundation)**: Phaser scene setup, Cloudflare scaffold, networking layer, shared types
- **Phase 1 (Core Loop)**: Planning UI, unit placement, deterministic combat simulation
- **Phase 2 (Co-op & AI)**: Two-player sync, bot opponents, difficulty scaling
- **Phase 3 (Polish)**: Visual clarity, playback controls, reconnect handling, debug tools

## Test Coverage

27 tests across 3 suites:

- **Combat Engine** (8 tests): Determinism, AoE, chain attacks, targeting priorities, upgrades, checksums
- **Match Manager** (12 tests): Lifecycle, economy, shop, placement, combat triggers, scoring, co-op zones
- **Bot AI** (7 tests): Planning, budget constraints, unlock timing, determinism, difficulty scaling
