<script lang="ts">
  import { onMount } from 'svelte';
  import * as Y from 'yjs';
  import { env } from '$env/dynamic/public';

  type Visitor = { id: string; label: string; seen: number };

  let visitors: Visitor[] = [];
  let status = 'waiting to connect';

  const fallbackEndpoint = 'ws://localhost:8788/room/visitors';
  const endpoint = env.PUBLIC_YJS_ENDPOINT || fallbackEndpoint;

  const createId = () =>
    crypto.randomUUID ? crypto.randomUUID() : `visitor-${Math.random().toString(16).slice(2)}`;

  const readableTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString();

  onMount(() => {
    console.log('[Client] Page visited - initializing Yjs connection');
    const doc = new Y.Doc();
    const presence = doc.getMap<{ label: string; seen: number }>('visitors');
    const id = createId();
    const label = `Guest-${id.slice(-4)}`;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const refreshList = () => {
      const now = Date.now();
      const fresh: Visitor[] = [];
      const previousCount = visitors.length;
      presence.forEach((value, key) => {
        if (!value || typeof value.seen !== 'number') {
          console.log(`[Client] Removing invalid visitor entry: ${key}`);
          presence.delete(key);
          return;
        }

        if (now - value.seen > 15000) {
          console.log(`[Client] Removing stale visitor: ${key} (${value.label}), last seen ${now - value.seen}ms ago`);
          presence.delete(key);
          return;
        }

        fresh.push({ id: key, label: value.label ?? 'Guest', seen: value.seen });
      });
      visitors = fresh.sort((a, b) => b.seen - a.seen);
      
      if (visitors.length !== previousCount) {
        console.log(`[Client] Visitor list updated: ${previousCount} -> ${visitors.length} visitors`, {
          visitors: visitors.map(v => ({ id: v.id, label: v.label, seen: readableTime(v.seen) }))
        });
      }
    };

    const observeUpdates = (update: Uint8Array, origin: unknown) => {
      if (socket && socket.readyState === WebSocket.OPEN && origin !== socket) {
        console.log('[Client] Sending local update to server', { updateSize: update.length });
        socket.send(update);
      }
    };

    const connect = () => {
      if (socket && socket.readyState === WebSocket.OPEN) return;
      console.log('[Client] Connecting to Yjs room', { endpoint });
      status = 'connecting to room';

      const next = new WebSocket(endpoint);
      next.binaryType = 'arraybuffer';

      next.addEventListener('open', () => {
        console.log('[Client] WebSocket connection opened');
        status = 'connected';
        const stateUpdate = Y.encodeStateAsUpdate(doc);
        console.log('[Client] Sending initial state to server', { stateSize: stateUpdate.length });
        next.send(stateUpdate);
      });

      next.addEventListener('message', (event) => {
        const incoming = new Uint8Array(event.data as ArrayBuffer);
        console.log('[Client] Received update from server', { updateSize: incoming.length });
        Y.applyUpdate(doc, incoming, next);
        refreshList();
      });

      next.addEventListener('close', () => {
        console.log('[Client] WebSocket connection closed - will reconnect');
        status = 'reconnecting soon';
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, 1000);
        }
      });

      next.addEventListener('error', (error) => {
        console.error('[Client] WebSocket error', error);
        status = 'connection lost';
        next.close();
      });

      socket = next;
    };

    const heartbeat = setInterval(() => {
      const now = Date.now();
      console.log(`[Client] Sending heartbeat for ${label}`, { id, timestamp: now });
      presence.set(id, { label, seen: now });
      refreshList();
    }, 4000);

    presence.observe((event) => {
      console.log('[Client] Presence map changed', { 
        keysChanged: Array.from(event.keysChanged),
        transaction: event.transaction
      });
      refreshList();
    });
    doc.on('update', observeUpdates);

    console.log(`[Client] User joining as ${label}`, { id });
    presence.set(id, { label, seen: Date.now() });
    refreshList();
    connect();

    return () => {
      console.log(`[Client] Page unvisited - cleaning up ${label}`, { id });
      clearInterval(heartbeat);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      console.log(`[Client] Removing presence entry for ${label}`, { id });
      presence.delete(id);
      refreshList();
      doc.off('update', observeUpdates);
      socket?.close();
      doc.destroy();
      console.log('[Client] Cleanup complete');
    };
  });
</script>

<svelte:head>
  <title>Yjs visitors</title>
  <meta name="description" content="Minimal Yjs + SvelteKit presence demo" />
</svelte:head>

<main>
  <h1>Shared visitors</h1>
  <p>Endpoint: {endpoint}</p>
  <p>Status: {status}</p>
  <p>Everyone on this page appears below. Entries vanish after a few moments without a heartbeat.</p>
  <ul>
    {#if visitors.length === 0}
      <li>No one is here yet.</li>
    {:else}
      {#each visitors as person}
        <li>{person.label} — last seen at {readableTime(person.seen)}</li>
      {/each}
    {/if}
  </ul>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f7f7f7;
    color: #222;
  }

  main {
    max-width: 640px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    line-height: 1.5;
  }

  h1 {
    margin-top: 0;
  }

  ul {
    padding-left: 1.5rem;
  }

  li + li {
    margin-top: 0.35rem;
  }
</style>
