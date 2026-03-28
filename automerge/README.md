# Automerge + ProseMirror text demo

This folder contains a small static demo showing that this task **does** make sense with Automerge, including styled rich text.

The page now uses:

- **ProseMirror** for editing and styling text
- **Automerge** for storing the document and tracking changes
- a local in-memory **DocHandle-like wrapper** so `@automerge/prosemirror` can work in a plain static demo without needing `automerge-repo`

## What the demo supports

- typing and editing text
- styling text with:
  - bold
  - italic
  - code
  - heading 1
  - heading 2
- undo / redo
- local persistence with `localStorage`
- a visible “Changes according to Automerge” panel built from Automerge history and patch data

## Files

- `index.html` — page structure and minimal CSS
- `app.js` — ProseMirror setup, Automerge integration, toolbar behavior, persistence, and history rendering
- `notes.md` — implementation notes from the investigation

## How it works

The Automerge document is still very small:

```js
{ text: "" }
```

But instead of a plain `<textarea>`, the demo initializes a ProseMirror editor through `@automerge/prosemirror`.

### Main flow

1. the page loads an Automerge document from `localStorage` or creates a new one
2. a small local handle implements the minimal API expected by `@automerge/prosemirror`:
   - `doc()`
   - `change(fn)`
   - `on("change", callback)`
   - `off("change", callback)`
3. ProseMirror transactions are converted into Automerge rich-text changes
4. Automerge patch callbacks are used to notify the editor and UI
5. the history panel is rebuilt from:
   - `Automerge.getHistory()`
   - `Automerge.getHeads()`
   - `Automerge.diff()`

The page therefore shows formatting changes like bold/unbold as Automerge operations, not as a separate handwritten log.

## Run it

Serve the repository over HTTP:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/automerge/
```

## Verified

I verified the updated demo in headless Chrome by:

- loading the page over a local HTTP server
- confirming the editor initializes correctly
- programmatically inserting text into the ProseMirror editor
- applying bold formatting
- converting the block to a heading
- confirming that the page updated:
  - rendered styled HTML in the editor
  - Automerge change count
  - Automerge patch history including formatting changes

## Notes

This is intentionally still a minimal demo:

- simple HTML
- minimal CSS
- no framework
- no build step

The next natural extension would be adding a second peer/tab so concurrent rich-text edits can be merged live, which would better show Automerge’s core multiplayer value.
