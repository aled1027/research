# Git LFS Cloudflare Worker - Development Notes

## Goal
Create a Cloudflare Worker that acts as a Git LFS server, storing files in an R2 bucket called "lfs".

## Research

### Git LFS Protocol
Git LFS uses a Batch API for transferring large files. The key endpoints are:

1. **POST /objects/batch** - The main endpoint that clients call to get upload/download URLs
   - Request contains list of objects (oid, size) and operation (upload/download)
   - Response contains URLs for each object with upload/download actions

2. **PUT** - Upload objects to the provided URL
3. **GET** - Download objects from the provided URL

Sources:
- [Git LFS Batch API Specification](https://github.com/git-lfs/git-lfs/blob/main/docs/api/batch.md)
- [Git LFS Basic Transfers](https://github.com/git-lfs/git-lfs/blob/main/docs/api/basic-transfers.md)

### Key Headers
- `Accept: application/vnd.git-lfs+json`
- `Content-Type: application/vnd.git-lfs+json`

### Batch API Request Format
```json
{
  "operation": "download|upload",
  "transfers": ["basic"],
  "ref": { "name": "refs/heads/main" },
  "objects": [{ "oid": "sha256hash", "size": 12345 }],
  "hash_algo": "sha256"
}
```

### Batch API Response Format
```json
{
  "transfer": "basic",
  "objects": [{
    "oid": "sha256hash",
    "size": 12345,
    "authenticated": true,
    "actions": {
      "download": {
        "href": "https://...",
        "header": {},
        "expires_in": 3600
      }
    }
  }],
  "hash_algo": "sha256"
}
```

### Authentication
Git LFS typically uses HTTP Basic Auth. The worker validates credentials via `LFS_USERNAME` and `LFS_PASSWORD` secrets.

## Implementation

### Files Created
- `package.json` - npm package with wrangler dependency
- `wrangler.toml` - Cloudflare Worker configuration with R2 bucket binding
- `src/index.js` - Main worker implementation
- `.gitignore` - Ignore node_modules and wrangler files

### Endpoints Implemented
1. `POST /objects/batch` - Git LFS Batch API
2. `PUT /objects/:oid` - Upload object to R2
3. `GET /objects/:oid` - Download object from R2
4. `POST /verify/:oid` - Verify uploaded object
5. `GET /` - Health check endpoint

### Features
- Full Git LFS Batch API v1 support
- Direct streaming to/from R2 (no buffering)
- Optional Basic Auth (configurable via secrets)
- CORS support for web-based git clients
- Object verification after upload

## Progress

- [x] Created project folder
- [x] Researched Git LFS Batch API specification
- [x] Initialize wrangler project (package.json, wrangler.toml)
- [x] Implement LFS endpoints (batch, upload, download, verify)
- [x] Configure R2 bucket binding
- [x] Add Basic Auth support
- [x] Create documentation
