# Investigating Yjs SvelteKit 500 Errors

## Problem
When visiting https://yjs-sveltekit-demo.services-a01.workers.dev, all static assets under `/_app/immutable/` are returning 500 Internal Server Error.

## Current Configuration
- Using `@sveltejs/adapter-cloudflare` version 4.4.1
- Wrangler config points to `.svelte-kit/cloudflare/_worker.js`
- SvelteKit version 2.5.9
- Deployed to Cloudflare Workers (not Pages)
- Wrangler version 4.55.0

## Investigation Steps
1. ✅ Checked adapter configuration - adapter generates assets in `.svelte-kit/cloudflare/_app/`
2. ✅ Verified `_routes.json` excludes `/_app/*` from worker (should be static assets)
3. ✅ Found issue: `wrangler.sveltekit.toml` missing `assets` configuration
4. ✅ Build output structure is correct - assets are generated properly

## Root Cause
The `@sveltejs/adapter-cloudflare` generates static assets in `.svelte-kit/cloudflare/_app/` and configures `_routes.json` to exclude `/_app/*` from the worker. However, for Cloudflare Workers, static assets need to be explicitly configured in `wrangler.toml` using the `assets` configuration.

## Solution

### Root Cause
The `@sveltejs/adapter-cloudflare` generates static assets in `.svelte-kit/cloudflare/_app/` and configures `_routes.json` to exclude `/_app/*` from the worker. However, for Cloudflare Workers, static assets need to be explicitly configured in `wrangler.toml` using the `assets` configuration with both `directory` and `binding` parameters.

### Fix Applied
Updated `wrangler.sveltekit.toml` with:
1. `assets = { directory = ".svelte-kit/cloudflare", binding = "STATIC_ASSETS" }` - Configures static asset serving
2. `compatibility_flags = ["nodejs_compat"]` - Enables Node.js compatibility for built-in modules

### Verification
Running `wrangler deploy --dry-run` now shows:
- `env.STATIC_ASSETS` as an Assets binding (confirms assets are configured)
- No errors in the configuration

The static assets should now be served correctly when deployed.

