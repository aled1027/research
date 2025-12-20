# Git LFS Server on Cloudflare Workers

A Git LFS server implementation using Cloudflare Workers and R2 storage. This allows you to self-host Git LFS with Cloudflare's global edge network.

## Features

- **Full Git LFS Batch API v1 support** - Compatible with standard git-lfs clients
- **R2 Storage** - Files stored in Cloudflare R2 bucket named "lfs"
- **Streaming Transfers** - Direct streaming to/from R2 (no buffering)
- **Optional Authentication** - Basic Auth via configurable secrets
- **CORS Support** - Works with web-based git clients

## Prerequisites

- Cloudflare account with Workers and R2 enabled
- Node.js 18+ installed
- Wrangler CLI (installed as dev dependency)

## Setup

### 1. Install Dependencies

```bash
cd LFS
npm install
```

### 2. Create the R2 Bucket

Create the R2 bucket named "lfs" (if it doesn't exist):

```bash
npm run create-bucket
# or directly:
npx wrangler r2 bucket create lfs
```

### 3. Configure Authentication (Optional but Recommended)

Set up Basic Auth credentials as secrets:

```bash
npx wrangler secret put LFS_USERNAME
# Enter your username when prompted

npx wrangler secret put LFS_PASSWORD
# Enter your password when prompted
```

If you skip this step, the server will allow anonymous access.

### 4. Deploy the Worker

```bash
npm run deploy
# or directly:
npx wrangler deploy
```

After deployment, you'll receive a URL like:
`https://git-lfs-server.<your-subdomain>.workers.dev`

### 5. (Optional) Update Server URL

If you want the worker to use a custom domain or explicit URL, update `wrangler.toml`:

```toml
[vars]
LFS_SERVER_URL = "https://your-custom-domain.com"
```

Then redeploy with `npm run deploy`.

## Configuring Git Repositories

### Method 1: Per-Repository Configuration

In your git repository, configure LFS to use your server:

```bash
git config lfs.url https://git-lfs-server.<your-subdomain>.workers.dev
```

If authentication is enabled:
```bash
git config lfs.url https://username:password@git-lfs-server.<your-subdomain>.workers.dev
```

Or use a credential helper:
```bash
git config credential.helper store
# Then git-lfs will prompt for credentials on first use
```

### Method 2: .lfsconfig File

Create a `.lfsconfig` file in your repository root:

```ini
[lfs]
    url = https://git-lfs-server.<your-subdomain>.workers.dev
```

Commit this file to share the LFS server configuration with collaborators.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/objects/batch` | POST | Git LFS Batch API |
| `/objects/:oid` | PUT | Upload object |
| `/objects/:oid` | GET | Download object |
| `/verify/:oid` | POST | Verify uploaded object |
| `/` | GET | Health check |

## Local Development

Run the worker locally for testing:

```bash
npm run dev
```

This starts a local server (typically at `http://localhost:8787`) with R2 simulation.

## How It Works

1. **Batch Request**: Git LFS client sends a POST to `/objects/batch` with list of objects to upload/download
2. **URL Generation**: Worker returns signed URLs for each object operation
3. **Transfer**: Client performs PUT (upload) or GET (download) directly to the worker
4. **Storage**: Objects are stored in R2 using their SHA-256 OID as the key
5. **Verification**: After upload, client optionally verifies the object was stored correctly

## File Structure

```
LFS/
├── package.json      # npm package with wrangler
├── wrangler.toml     # Cloudflare Worker configuration
├── src/
│   └── index.js      # Main worker implementation
├── .gitignore        # Ignore node_modules
├── notes.md          # Development notes
└── README.md         # This file
```

## Security Considerations

- **Authentication**: Always enable Basic Auth in production
- **HTTPS**: Cloudflare Workers are HTTPS-only by default
- **Secrets**: Credentials are stored as Cloudflare secrets (encrypted)
- **CORS**: Currently allows all origins - restrict in production if needed

## Troubleshooting

### "Authentication required" error
Ensure your git credential helper is configured or include credentials in the URL.

### "Object not found" on download
The object hasn't been uploaded yet or was uploaded to a different bucket.

### Large file timeouts
Cloudflare Workers have CPU time limits. For very large files (100MB+), consider using presigned R2 URLs directly.

## License

MIT
