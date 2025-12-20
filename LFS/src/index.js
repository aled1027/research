/**
 * Git LFS Server - Cloudflare Worker with R2 Storage
 *
 * Implements the Git LFS Batch API (v1) for storing large files in R2.
 *
 * Endpoints:
 * - POST /objects/batch - Batch API for requesting upload/download URLs
 * - PUT /objects/:oid - Upload an object
 * - GET /objects/:oid - Download an object
 * - POST /verify/:oid - Verify an uploaded object
 */

const LFS_CONTENT_TYPE = 'application/vnd.git-lfs+json';

/**
 * Verify Basic Auth credentials
 */
function verifyAuth(request, env) {
  // If no credentials are configured, allow all requests (not recommended for production)
  if (!env.LFS_USERNAME || !env.LFS_PASSWORD) {
    return true;
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.slice(6);
  let credentials;
  try {
    credentials = atob(base64Credentials);
  } catch {
    return false;
  }

  const [username, password] = credentials.split(':');
  return username === env.LFS_USERNAME && password === env.LFS_PASSWORD;
}

/**
 * Generate auth header for internal requests
 */
function getAuthHeader(env) {
  if (!env.LFS_USERNAME || !env.LFS_PASSWORD) {
    return {};
  }
  const credentials = btoa(`${env.LFS_USERNAME}:${env.LFS_PASSWORD}`);
  return { 'Authorization': `Basic ${credentials}` };
}

/**
 * Get the base URL for this worker
 */
function getBaseUrl(request, env) {
  if (env.LFS_SERVER_URL) {
    return env.LFS_SERVER_URL;
  }
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Create an LFS error response
 */
function lfsError(message, statusCode = 400, requestId = null) {
  const body = {
    message,
    request_id: requestId || crypto.randomUUID(),
  };
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': LFS_CONTENT_TYPE },
  });
}

/**
 * Handle POST /objects/batch
 * Main LFS Batch API endpoint
 */
async function handleBatch(request, env) {
  // Validate Accept header
  const accept = request.headers.get('Accept');
  if (!accept || !accept.includes('application/vnd.git-lfs')) {
    return lfsError('Accept header must be application/vnd.git-lfs+json', 406);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return lfsError('Invalid JSON body', 400);
  }

  const { operation, objects, transfers = ['basic'], hash_algo = 'sha256' } = body;

  // Validate operation
  if (!operation || !['upload', 'download'].includes(operation)) {
    return lfsError('Invalid operation. Must be "upload" or "download"', 400);
  }

  // Validate objects
  if (!objects || !Array.isArray(objects) || objects.length === 0) {
    return lfsError('Objects array is required', 400);
  }

  // We only support basic transfer
  if (!transfers.includes('basic')) {
    return lfsError('Only basic transfer is supported', 400);
  }

  const baseUrl = getBaseUrl(request, env);
  const authHeaders = getAuthHeader(env);

  // Process each object
  const responseObjects = await Promise.all(
    objects.map(async (obj) => {
      const { oid, size } = obj;

      if (!oid || typeof size !== 'number') {
        return {
          oid,
          size,
          error: {
            code: 400,
            message: 'Invalid object: oid and size are required',
          },
        };
      }

      // Check if object exists in R2
      const existing = await env.LFS_BUCKET.head(oid);

      if (operation === 'download') {
        if (!existing) {
          return {
            oid,
            size,
            error: {
              code: 404,
              message: 'Object not found',
            },
          };
        }

        return {
          oid,
          size,
          authenticated: true,
          actions: {
            download: {
              href: `${baseUrl}/objects/${oid}`,
              header: authHeaders,
              expires_in: 3600,
            },
          },
        };
      }

      // Upload operation
      if (existing) {
        // Object already exists, no action needed
        return {
          oid,
          size,
          authenticated: true,
        };
      }

      return {
        oid,
        size,
        authenticated: true,
        actions: {
          upload: {
            href: `${baseUrl}/objects/${oid}`,
            header: {
              ...authHeaders,
              'Content-Type': 'application/octet-stream',
            },
            expires_in: 3600,
          },
          verify: {
            href: `${baseUrl}/verify/${oid}`,
            header: {
              ...authHeaders,
              'Content-Type': LFS_CONTENT_TYPE,
            },
            expires_in: 3600,
          },
        },
      };
    })
  );

  const response = {
    transfer: 'basic',
    objects: responseObjects,
    hash_algo,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': LFS_CONTENT_TYPE },
  });
}

/**
 * Handle PUT /objects/:oid
 * Upload an object to R2
 */
async function handleUpload(request, env, oid) {
  const contentLength = request.headers.get('Content-Length');

  if (!contentLength) {
    return lfsError('Content-Length header is required', 400);
  }

  try {
    // Stream the body directly to R2
    await env.LFS_BUCKET.put(oid, request.body, {
      httpMetadata: {
        contentType: 'application/octet-stream',
      },
      customMetadata: {
        size: contentLength,
        uploadedAt: new Date().toISOString(),
      },
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return lfsError('Failed to upload object', 500);
  }
}

/**
 * Handle GET /objects/:oid
 * Download an object from R2
 */
async function handleDownload(request, env, oid) {
  try {
    const object = await env.LFS_BUCKET.get(oid);

    if (!object) {
      return lfsError('Object not found', 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Length', object.size.toString());
    headers.set('ETag', object.etag);

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return lfsError('Failed to download object', 500);
  }
}

/**
 * Handle POST /verify/:oid
 * Verify an uploaded object exists and has correct size
 */
async function handleVerify(request, env, oid) {
  let body;
  try {
    body = await request.json();
  } catch {
    return lfsError('Invalid JSON body', 400);
  }

  const { size } = body;

  if (typeof size !== 'number') {
    return lfsError('Size is required', 400);
  }

  try {
    const object = await env.LFS_BUCKET.head(oid);

    if (!object) {
      return lfsError('Object not found', 404);
    }

    if (object.size !== size) {
      return lfsError(`Size mismatch: expected ${size}, got ${object.size}`, 422);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Verify error:', error);
    return lfsError('Failed to verify object', 500);
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
    };

    // Verify authentication
    if (!verifyAuth(request, env)) {
      return new Response(JSON.stringify({
        message: 'Authentication required',
        request_id: crypto.randomUUID(),
      }), {
        status: 401,
        headers: {
          'Content-Type': LFS_CONTENT_TYPE,
          'WWW-Authenticate': 'Basic realm="Git LFS"',
          ...corsHeaders,
        },
      });
    }

    let response;

    try {
      // Route requests
      if (path === '/objects/batch' && method === 'POST') {
        response = await handleBatch(request, env);
      } else if (path.startsWith('/objects/') && method === 'PUT') {
        const oid = path.slice('/objects/'.length);
        response = await handleUpload(request, env, oid);
      } else if (path.startsWith('/objects/') && method === 'GET') {
        const oid = path.slice('/objects/'.length);
        response = await handleDownload(request, env, oid);
      } else if (path.startsWith('/verify/') && method === 'POST') {
        const oid = path.slice('/verify/'.length);
        response = await handleVerify(request, env, oid);
      } else if (path === '/' || path === '') {
        // Health check / info endpoint
        response = new Response(JSON.stringify({
          name: 'Git LFS Server',
          version: '1.0.0',
          transfer_adapters: ['basic'],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        response = lfsError('Not found', 404);
      }
    } catch (error) {
      console.error('Unhandled error:', error);
      response = lfsError('Internal server error', 500);
    }

    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },
};
