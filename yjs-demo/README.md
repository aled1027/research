# Yjs + SvelteKit on Cloudflare

A minimal demo that shows who is visiting a SvelteKit page using Yjs for local-first synchronization and a Cloudflare Durable Object for persistence.

## What this contains
- A tiny SvelteKit UI that lists visitors and heartbeats presence with Yjs (`src/routes/+page.svelte`).
- A Cloudflare Worker with a Durable Object that relays and stores Yjs updates (`worker/yjs.js`).
- Two Wrangler configs: one for the Yjs worker (`wrangler.yjs.toml`) and one for the SvelteKit worker (`wrangler.sveltekit.toml`).

## Running locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Yjs Durable Object worker (serves WebSockets on port 8788 by default):
   ```bash
   npx wrangler dev --config wrangler.yjs.toml --local --port 8788
   ```
3. In another terminal, start the SvelteKit dev server and point it at the local Yjs endpoint:
   ```bash
   PUBLIC_YJS_ENDPOINT=ws://localhost:8788/room/visitors npm run dev -- --host
   ```
4. Open the app (default http://localhost:5173) and watch the visitor list update across tabs.

## Deploying to Cloudflare
1. Deploy the Yjs worker (creates the Durable Object using the included migration):
   ```bash
   npm run build
   npx wrangler deploy --config wrangler.yjs.toml
   ```
2. Update `PUBLIC_YJS_ENDPOINT` in `wrangler.sveltekit.toml` to the deployed Yjs worker URL (for example `wss://yjs-room-server.<your-subdomain>.workers.dev/room/visitors`).
3. Deploy the SvelteKit worker build:
   ```bash
   npm run build
   npx wrangler deploy --config wrangler.sveltekit.toml
   ```

## How it works
- Each browser tab sets a presence entry in a shared Yjs map with a heartbeat timestamp. Stale entries are cleared automatically.
- Updates flow over WebSockets to the Yjs Durable Object, which rebroadcasts changes to all peers and stores a snapshot for later visitors.
- The UI keeps styling minimal—just headings, paragraphs, lists, and a small amount of element-level CSS.
