# Automerge text demo

This folder contains a small static demo showing that this task **does** make sense with Automerge.

Even though Automerge is most valuable for collaborative/offline-first editing across multiple peers, it also works well for a single-page demo where you:

- edit text locally
- store each edit as an Automerge change
- reconstruct and display the edit history from Automerge itself

## Files

- `index.html` — simple page structure and minimal CSS
- `app.js` — textarea handling, Automerge document updates, history rendering, and localStorage persistence
- `notes.md` — implementation notes from the investigation

## How it works

The demo keeps a single Automerge document with this shape:

```js
{ text: "" }
```

On every `input` event:

1. the textarea value is read
2. `Automerge.change()` creates a new change
3. `Automerge.updateText(doc, ["text"], nextValue)` updates the collaborative string
4. the document is saved to `localStorage`
5. the UI rebuilds the change history from:
   - `Automerge.getHistory()`
   - `Automerge.getHeads()`
   - `Automerge.diff()`

The “Changes according to Automerge” section is derived from Automerge patch data, not a separate handwritten log.

## Run it

Because the page loads Automerge from a CDN script, serve the folder over HTTP.

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/automerge/
```

## Verified

I verified the demo in headless Chrome by:

- loading the page over a local HTTP server
- typing into the textarea programmatically
- confirming that the page updated:
  - character count
  - Automerge change count
  - rendered Automerge patch history

## Notes

This is intentionally a minimal demo:

- simple HTML
- minimal CSS
- no framework
- no build step

If you wanted to extend it further, the next natural step would be adding a second peer or tab and merging concurrent edits to better show Automerge’s main strength.
