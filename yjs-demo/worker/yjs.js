import * as Y from 'yjs';

export class YjsRoom {
  constructor(state) {
    this.state = state;
    this.doc = new Y.Doc();
    this.connections = new Set();
    this.ready = state.blockConcurrencyWhile(async () => {
      const snapshot = await this.state.storage.get('snapshot');
      if (snapshot) {
        const stored = new Uint8Array(snapshot);
        Y.applyUpdate(this.doc, stored);
      }
    });
  }

  async persist() {
    const encoded = Y.encodeStateAsUpdate(this.doc);
    await this.state.storage.put('snapshot', encoded);
  }

  broadcast(update, except) {
    for (const peer of this.connections) {
      if (peer === except) continue;
      try {
        peer.send(update);
      } catch (error) {
        console.log('broadcast error', error);
      }
    }
  }

  async handleWebSocket(webSocket) {
    await this.ready;
    this.connections.add(webSocket);

    // Cloudflare requires accepting the socket before sending data.
    webSocket.accept();

    const syncUpdate = Y.encodeStateAsUpdate(this.doc);
    webSocket.send(syncUpdate);

    const forwardUpdate = (update, origin) => {
      if (origin !== webSocket) {
        try {
          webSocket.send(update);
        } catch (error) {
          console.log('send error', error);
        }
      }
    };

    this.doc.on('update', forwardUpdate);

    webSocket.addEventListener('message', async (event) => {
      if (!(event.data instanceof ArrayBuffer)) return;

      const data = new Uint8Array(event.data);
      Y.applyUpdate(this.doc, data, webSocket);
      await this.persist();
      this.broadcast(data, webSocket);
    });

    webSocket.addEventListener('close', () => {
      this.connections.delete(webSocket);
      this.doc.off('update', forwardUpdate);
    });
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.handleWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const room = parts.pop() || 'default';
    const id = env.YJS_ROOM.idFromName(room);
    const stub = env.YJS_ROOM.get(id);
    return stub.fetch(request);
  }
};
