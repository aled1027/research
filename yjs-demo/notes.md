# Notes

- Initialized `yjs-demo` folder for building a SvelteKit + Yjs Cloudflare demo.
- Added package, config, and SvelteKit skeleton with Cloudflare adapter and Vite setup.
- Implemented a simple visitors page that syncs presence via Yjs over WebSockets.
- Built a Cloudflare Durable Object worker to persist and relay Yjs updates plus wrangler configs for both the UI and Yjs server.
