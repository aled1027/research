/**
 * Cloudflare Worker entry point.
 * Routes requests to Durable Objects and handles API endpoints.
 */

export interface Env {
  MATCH_ROOM: DurableObjectNamespace;
  MATCHES: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: Create a new match
      if (url.pathname === '/api/match/create' && request.method === 'POST') {
        const body = (await request.json()) as Record<string, unknown>;
        const matchId = crypto.randomUUID();
        const durableId = env.MATCH_ROOM.idFromName(matchId);
        const stub = env.MATCH_ROOM.get(durableId);

        const response = await stub.fetch(
          new Request('https://internal/create', {
            method: 'POST',
            body: JSON.stringify({ config: body.config || {} }),
            headers: { 'Content-Type': 'application/json' },
          })
        );

        const result = await response.json();

        // Store match metadata
        await env.MATCHES.put(
          matchId,
          JSON.stringify({ matchId, createdAt: Date.now(), config: body.config }),
          { expirationTtl: 3600 }
        );

        return new Response(
          JSON.stringify({ matchId, ...result as object }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Route: Get match state
      if (url.pathname.startsWith('/api/match/') && url.pathname.endsWith('/state')) {
        const matchId = url.pathname.split('/')[3];
        const durableId = env.MATCH_ROOM.idFromName(matchId);
        const stub = env.MATCH_ROOM.get(durableId);

        const response = await stub.fetch(new Request('https://internal/state'));
        const state = await response.json();

        return new Response(JSON.stringify(state), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Route: WebSocket connection
      if (url.pathname.startsWith('/api/match/') && url.pathname.endsWith('/ws')) {
        const matchId = url.pathname.split('/')[3];
        const durableId = env.MATCH_ROOM.idFromName(matchId);
        const stub = env.MATCH_ROOM.get(durableId);

        const wsUrl = new URL('https://internal/ws');
        wsUrl.search = url.search; // Forward query params (playerId, teamId, etc.)

        return stub.fetch(
          new Request(wsUrl.toString(), {
            headers: request.headers,
          })
        );
      }

      // Route: List active matches
      if (url.pathname === '/api/matches' && request.method === 'GET') {
        const list = await env.MATCHES.list();
        const matches = await Promise.all(
          list.keys.map(async (key) => {
            const data = await env.MATCHES.get(key.name);
            return data ? JSON.parse(data) : null;
          })
        );

        return new Response(
          JSON.stringify({ matches: matches.filter(Boolean) }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Route: Health check
      if (url.pathname === '/api/health') {
        return new Response(
          JSON.stringify({ status: 'ok', timestamp: Date.now() }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  },
};
