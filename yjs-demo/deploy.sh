#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Step 1: Build the project
echo "📦 Building project..."
npm run build

# Step 2: Deploy the Yjs worker
echo "🌐 Deploying Yjs worker..."
YJS_DEPLOY_OUTPUT=$(npx wrangler deploy --config wrangler.yjs.toml 2>&1)

# Extract the deployed URL from the output
# Wrangler typically outputs something like:
# "✨ Deployment complete! Take a sneak peek at https://yjs-room-server.xxx.workers.dev"
YJS_URL=$(echo "$YJS_DEPLOY_OUTPUT" | grep -oP 'https://[^\s]+\.workers\.dev' | head -n 1)

if [ -z "$YJS_URL" ]; then
    # Fallback: try to construct URL from worker name and account info
    echo "⚠️  Could not extract URL from deploy output, trying alternative method..."
    ACCOUNT_SUBDOMAIN=$(npx wrangler whoami 2>&1 | grep -oP 'services-\w+' | head -n 1 || echo "")
    if [ -n "$ACCOUNT_SUBDOMAIN" ]; then
        YJS_URL="https://yjs-room-server.${ACCOUNT_SUBDOMAIN}.workers.dev"
    else
        echo "❌ Could not determine Yjs worker URL. Please set PUBLIC_YJS_ENDPOINT manually."
        exit 1
    fi
fi

# Convert http to wss and add the room path
YJS_ENDPOINT=$(echo "$YJS_URL" | sed 's|https://|wss://|')/room/visitors

echo "✅ Yjs worker deployed at: $YJS_ENDPOINT"

# Step 3: Update PUBLIC_YJS_ENDPOINT in wrangler.sveltekit.toml
echo "📝 Updating PUBLIC_YJS_ENDPOINT in wrangler.sveltekit.toml..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|PUBLIC_YJS_ENDPOINT = \".*\"|PUBLIC_YJS_ENDPOINT = \"$YJS_ENDPOINT\"|" wrangler.sveltekit.toml
else
    # Linux
    sed -i "s|PUBLIC_YJS_ENDPOINT = \".*\"|PUBLIC_YJS_ENDPOINT = \"$YJS_ENDPOINT\"|" wrangler.sveltekit.toml
fi

# Step 4: Build again with updated environment variable
echo "📦 Rebuilding with updated YJS endpoint..."
npm run build

# Step 5: Deploy the SvelteKit worker
echo "🌐 Deploying SvelteKit worker..."
npx wrangler deploy --config wrangler.sveltekit.toml

echo "✅ Deployment complete!"
echo "📋 Yjs endpoint: $YJS_ENDPOINT"

