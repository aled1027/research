# Notes

- Initialized `yjs-demo` folder for building a SvelteKit + Yjs Cloudflare demo.
- Added package, config, and SvelteKit skeleton with Cloudflare adapter and Vite setup.
- Implemented a simple visitors page that syncs presence via Yjs over WebSockets.
- Built a Cloudflare Durable Object worker to persist and relay Yjs updates plus wrangler configs for both the UI and Yjs server.
- Tried installing npm dependencies to run the app locally but npm registry access returned 403 errors.
- Updated the Durable Object websocket handler to accept sockets before sending data and ignore non-binary messages.
- With network access restored, installed npm dependencies successfully.
- `npm run build` failed because `vitePreprocess` is no longer exported from `@sveltejs/kit/vite` and because `.svelte-kit/` typings were missing.
- Switched to importing `vitePreprocess` from `@sveltejs/vite-plugin-svelte` and added a `postinstall` hook to run `svelte-kit sync` so builds work on fresh installs.
- Upgraded to Svelte 5 and the matching `@sveltejs/vite-plugin-svelte@4` (with an override) to fix missing runtime exports and quiet build warnings; builds now complete successfully.
- Fixed Durable Objects deployment error: changed migration from `new_classes` to `new_sqlite_classes` in `wrangler.yjs.toml` to support Cloudflare's free plan requirement.
- Fixed SvelteKit deployment error: updated `wrangler.sveltekit.toml` to point to `.svelte-kit/cloudflare/_worker.js` instead of `build/_worker.js` since `@sveltejs/adapter-cloudflare` outputs the worker file to `.svelte-kit/cloudflare/` directory.
