Demonstrating Automerge’s capabilities, this project presents a minimal static web demo for collaborative text editing, focusing on local edit persistence and change history reconstruction. Using Automerge’s CRDT (Conflict-free Replicated Data Type), every input is recorded as a change, stored in localStorage, and displayed via rebuilt history, even in a single-user context. The implementation uses simple HTML, JavaScript, and Automerge loaded from a CDN, highlighting how Automerge's document and patch management works in practice. The demo can be extended to support multiple peers, further illustrating Automerge's main use-case in real-time collaborative applications. More information about Automerge’s CRDT technology can be found at [Automerge GitHub](https://github.com/automerge/automerge).

Key findings:
- Automerge efficiently tracks and reconstructs individual edits from patch data, even offline.
- The demo confirms Automerge’s robust change tracking works for both solo and multi-peer editing scenarios.
- Minimal setup is needed: Automerge handles document updates, history, and state persistence with concise code.
