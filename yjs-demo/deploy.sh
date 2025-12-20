#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

YJS_WORKER_NAME="yjs-room-server"
ACCOUNT_SUBDOMAIN="services-a01"
YJS_ENDPOINT="wss://${YJS_WORKER_NAME}.${ACCOUNT_SUBDOMAIN}.workers.dev/room/visitors"

echo "📦 Building project..."
npm run build

# Step 2: Deploy the Yjs worker
echo "🌐 Deploying Yjs worker (${YJS_WORKER_NAME})..."
npx wrangler deploy --config wrangler.yjs.toml

# Step 3: Deploy the SvelteKit worker
echo "🌐 Deploying SvelteKit worker..."
npx wrangler deploy --config wrangler.sveltekit.toml

echo "✅ Deployment complete!"
echo "📋 Yjs endpoint: $YJS_ENDPOINT"

