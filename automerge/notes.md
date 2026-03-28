# Notes

- Started investigation and implementation for an Automerge text editing demo.
- Need a simple HTML/CSS/JS demo in `automerge/` that lets a user edit text, uses Automerge to manage changes, and shows changes made according to Automerge.

- Fetched Automerge docs from https://automerge.org/llms-full.txt and confirmed `Automerge.updateText()` / `Automerge.splice()` are the relevant APIs for collaborative strings.
- Installing `@automerge/automerge` locally to inspect the API and verify a simple browser demo approach.
- Implemented a static demo with `index.html` + `app.js`: textarea input updates an Automerge document via `updateText()`, history is reconstructed with `getHistory()` and `diff()`, and the doc is persisted in `localStorage`.
- Switched the demo to the Automerge IIFE build from jsDelivr because it loaded more reliably in a plain static HTML page than the ESM CDN variant.
- Verified in headless Chrome over a local HTTP server that typing updates the Automerge doc, updates the stats, and renders Automerge patch history.
