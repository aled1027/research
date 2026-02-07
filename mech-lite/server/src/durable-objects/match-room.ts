import {
  ClientMessage,
  ServerMessage,
  Player,
  TeamId,
  MatchConfig,
} from '../../../shared/src/types';
import { DEFAULT_MATCH_CONFIG } from '../../../shared/src/config';
import { MatchManager } from '../simulation/match-manager';

interface WebSocketSession {
  ws: WebSocket;
  playerId: string;
  teamId: TeamId;
}

/**
 * Cloudflare Durable Object that hosts a single match room.
 * Manages WebSocket connections, routes messages to MatchManager,
 * and broadcasts state updates.
 */
export class MatchRoom {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocketSession> = new Map();
  private match: MatchManager | null = null;
  private matchConfig: Partial<MatchConfig> = {};

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      return this.handleWebSocket(request);
    }

    if (url.pathname === '/create') {
      return this.handleCreate(request);
    }

    if (url.pathname === '/state') {
      return this.handleGetState();
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleCreate(request: Request): Promise<Response> {
    const body = (await request.json()) as { config?: Partial<MatchConfig> };
    this.matchConfig = body.config || {};
    this.match = new MatchManager(
      this.state.id.toString(),
      this.matchConfig
    );

    return new Response(
      JSON.stringify({ matchId: this.state.id.toString(), status: 'created' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  private handleWebSocket(request: Request): Response {
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    const playerName = url.searchParams.get('playerName') || 'Player';
    const teamId = (url.searchParams.get('teamId') || 'team1') as TeamId;

    if (!playerId) {
      return new Response('Missing playerId', { status: 400 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    (server as any).accept();

    const session: WebSocketSession = {
      ws: server,
      playerId,
      teamId,
    };

    this.sessions.set(playerId, session);

    // Ensure match exists
    if (!this.match) {
      this.match = new MatchManager(
        this.state.id.toString(),
        this.matchConfig
      );
    }

    // Add player to match
    const player: Player = {
      id: playerId,
      name: playerName,
      team: teamId,
      isBot: false,
      ready: false,
      connected: true,
    };

    this.match.addPlayer(player);

    // Send current state
    this.sendToPlayer(playerId, {
      type: 'match_state',
      payload: { state: this.match.getState() },
      timestamp: Date.now(),
    });

    // Flush any messages from addPlayer
    this.broadcastPendingMessages();

    // Handle incoming messages
    server.addEventListener('message', (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as ClientMessage;
        this.handleClientMessage(playerId, msg);
      } catch (e) {
        this.sendToPlayer(playerId, {
          type: 'error',
          payload: { message: 'Invalid message format' },
          timestamp: Date.now(),
        });
      }
    });

    server.addEventListener('close', () => {
      this.sessions.delete(playerId);
      if (this.match) {
        this.match.removePlayer(playerId);
        this.broadcastPendingMessages();
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private handleGetState(): Response {
    if (!this.match) {
      return new Response(
        JSON.stringify({ error: 'No match active' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify(this.match.getState()),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  private handleClientMessage(playerId: string, msg: ClientMessage): void {
    if (!this.match) return;

    // Special handling for start_match
    if (msg.type === 'ready_up' && this.match.getState().phase === 'lobby') {
      this.match.startMatch();
    }

    this.match.handleMessage(playerId, msg);
    this.broadcastPendingMessages();
  }

  private broadcastPendingMessages(): void {
    if (!this.match) return;

    const messages = this.match.drainMessages();
    for (const msg of messages) {
      this.broadcast(msg);
    }
  }

  private broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    for (const session of this.sessions.values()) {
      try {
        session.ws.send(data);
      } catch {
        // Connection may have closed
      }
    }
  }

  private sendToPlayer(playerId: string, msg: ServerMessage): void {
    const session = this.sessions.get(playerId);
    if (session) {
      try {
        session.ws.send(JSON.stringify(msg));
      } catch {
        // Connection may have closed
      }
    }
  }
}
