Demonstrating real-time visitor presence in SvelteKit, this project integrates Yjs for local-first data synchronization and Cloudflare Durable Objects for persistent, distributed storage. Each connected browser tab updates its presence via a Yjs shared map—changes propagate seamlessly across clients using WebSockets, with Cloudflare Durable Objects handling state rebroadcast and persistence. The setup features a minimalist SvelteKit UI and separate worker deployments for Yjs and the app, enabling quick local development and easy deployment to Cloudflare's edge. Full instructions, worker configs, and source code are included for rapid experimentation.

**Key findings/tools:**
- **Yjs** enables granular presence state sharing with automatic conflict resolution.  
- **Cloudflare Durable Objects** provide efficient, persistent relaying and storage.  
- Minimal end-to-end example: [Demo App](https://yjs-sveltekit-demo.services-a01.workers.dev), [Yjs project](https://github.com/yjs/yjs).
