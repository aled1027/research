# Fix for Yjs SvelteKit 500 Errors on Cloudflare Workers

## Problem

When visiting the deployed SvelteKit application at `https://yjs-sveltekit-demo.services-a01.workers.dev`, all static assets under `/_app/immutable/` were returning 500 Internal Server Error. This prevented the application from loading properly.

## Root Cause

The `@sveltejs/adapter-cloudflare` adapter generates static assets in `.svelte-kit/cloudflare/_app/` and creates a `_routes.json` file that excludes `/_app/*` routes from the worker. However, for Cloudflare Workers (as opposed to Cloudflare Pages), static assets need to be explicitly configured in `wrangler.toml` using the `assets` configuration.

The original `wrangler.sveltekit.toml` was missing:
1. The `assets` configuration to tell Wrangler where to find static files
2. The `nodejs_compat` compatibility flag needed for Node.js built-in modules

## Solution

Updated `wrangler.sveltekit.toml` with the following changes:

```toml
compatibility_flags = ["nodejs_compat"]
assets = { directory = ".svelte-kit/cloudflare", binding = "STATIC_ASSETS" }
```

### Changes Explained

1. **`assets` configuration**: 
   - `directory`: Points to the directory containing static assets (`.svelte-kit/cloudflare`)
   - `binding`: Creates a binding name (`STATIC_ASSETS`) that the worker can use to access assets

2. **`compatibility_flags = ["nodejs_compat"]`**: 
   - Enables Node.js compatibility mode for built-in modules like `node:async_hooks` and `node:crypto` that the SvelteKit adapter uses

## Verification

After applying the fix, running `wrangler deploy --dry-run` shows:
- `env.STATIC_ASSETS` listed as an Assets binding (confirms assets are configured correctly)
- No configuration errors

## Files Modified

- `yjs-demo/wrangler.sveltekit.toml` - Added assets configuration and nodejs_compat flag

## Next Steps

1. Rebuild the application: `npm run build`
2. Deploy with the updated configuration: `npx wrangler deploy --config wrangler.sveltekit.toml`
3. Verify that static assets load correctly at the deployed URL

## References

- [Cloudflare Workers Assets Documentation](https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/)
- [SvelteKit Cloudflare Adapter Documentation](https://kit.svelte.dev/docs/adapter-cloudflare)

