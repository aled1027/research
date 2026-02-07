import {
  ClientMessage,
  ClientMessageType,
  ServerMessage,
  MatchState,
} from '../../../shared/src/types';

type MessageHandler = (msg: ServerMessage) => void;

/**
 * WebSocket client for communicating with the match server.
 */
export class NetworkClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private serverUrl: string;
  private matchId: string = '';
  private playerId: string = '';
  private playerName: string = '';
  private teamId: string = '';
  private connected = false;

  constructor(serverUrl: string = 'ws://localhost:8787') {
    this.serverUrl = serverUrl;
  }

  connect(matchId: string, playerId: string, playerName: string, teamId: string): Promise<void> {
    this.matchId = matchId;
    this.playerId = playerId;
    this.playerName = playerName;
    this.teamId = teamId;

    return new Promise((resolve, reject) => {
      const wsUrl = `${this.serverUrl}/api/match/${matchId}/ws?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}&teamId=${teamId}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          this.dispatchMessage(msg);
        } catch (e) {
          console.error('Failed to parse server message:', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  send(type: ClientMessageType, payload: Record<string, unknown> = {}): void {
    if (!this.ws || !this.connected) {
      console.warn('Not connected, cannot send message');
      return;
    }

    const msg: ClientMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(msg));
  }

  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private dispatchMessage(msg: ServerMessage): void {
    // Dispatch to specific type handlers
    const handlers = this.handlers.get(msg.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(msg);
      }
    }

    // Dispatch to wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler(msg);
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;

    setTimeout(() => {
      console.log(`Reconnect attempt ${this.reconnectAttempts}...`);
      this.connect(this.matchId, this.playerId, this.playerName, this.teamId).catch(() => {
        // Will trigger onclose → attemptReconnect again
      });
    }, delay);
  }
}

/** Singleton network client instance */
export const networkClient = new NetworkClient();
