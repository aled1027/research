import * as Automerge from "https://esm.sh/@automerge/automerge@^3.1/slim?target=es2022";
import { automergeWasmBase64 } from "https://esm.sh/@automerge/automerge@3.2.5/automerge.wasm.base64?target=es2022";
import { init as initAutomergeProsemirror } from "https://esm.sh/@automerge/prosemirror@0.2.0";
import { EditorState } from "https://esm.sh/prosemirror-state@1.4.4";
import { EditorView } from "https://esm.sh/prosemirror-view@1.41.7";
import { keymap } from "https://esm.sh/prosemirror-keymap@1.2.3";
import { baseKeymap, setBlockType, toggleMark } from "https://esm.sh/prosemirror-commands@1.7.1";
import { history, redo, undo } from "https://esm.sh/prosemirror-history@1.5.0";

const STORAGE_KEY = "automerge-prosemirror-demo-v2";
const TEXT_PATH = ["text"];

const toolbar = document.querySelector("#toolbar");
const editorRoot = document.querySelector("#editor");
const stats = document.querySelector("#stats");
const historyContainer = document.querySelector("#history");
const resetButton = document.querySelector("#reset");

let handle = null;
let view = null;

function bootstrap() {
  resetButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    loadIntoEditor(createDoc());
    view?.focus();
  });

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-command]");

    if (!button || !view) {
      return;
    }

    const command = getCommand(button.dataset.command);

    if (!command) {
      return;
    }

    command(view.state, view.dispatch, view);
    view.focus();
    updateToolbar();
  });

  loadIntoEditor(loadDoc());
}

class LocalAutomergeHandle {
  constructor(doc) {
    this.currentDoc = doc;
    this.listeners = new Set();
  }

  doc() {
    return this.currentDoc;
  }

  change(fn) {
    const beforeDoc = this.currentDoc;
    const beforeHeads = Automerge.getHeads(beforeDoc);
    let patches = [];
    let patchInfo = null;

    const nextDoc = Automerge.change(
      beforeDoc,
      {
        message: "Editor change",
        patchCallback: (nextPatches, nextPatchInfo) => {
          patches = nextPatches;
          patchInfo = nextPatchInfo;
        },
      },
      fn,
    );

    this.currentDoc = nextDoc;

    if (headsEqual(beforeHeads, Automerge.getHeads(nextDoc))) {
      return;
    }

    const payload = {
      handle: this,
      doc: nextDoc,
      patches,
      patchInfo,
    };

    this.listeners.forEach((listener) => listener(payload));
  }

  on(event, callback) {
    if (event === "change") {
      this.listeners.add(callback);
    }
  }

  off(event, callback) {
    if (event === "change") {
      this.listeners.delete(callback);
    }
  }
}

function loadIntoEditor(doc) {
  if (view) {
    view.destroy();
    view = null;
  }

  handle = new LocalAutomergeHandle(doc);
  handle.on("change", onDocumentChange);

  editorRoot.innerHTML = "";

  const { schema, pmDoc, plugin } = initAutomergeProsemirror(handle, TEXT_PATH);
  const plugins = [
    history(),
    keymap({
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
    }),
    keymap(baseKeymap),
    plugin,
  ];

  view = new EditorView(editorRoot, {
    state: EditorState.create({
      schema,
      doc: pmDoc,
      plugins,
    }),
    dispatchTransaction(transaction) {
      const nextState = view.state.apply(transaction);
      view.updateState(nextState);
      updateToolbar();
    },
  });

  window.__automergeDemo = {
    Automerge,
    getDoc: () => handle.doc(),
    getView: () => view,
  };

  render();
  updateToolbar();
}

function onDocumentChange() {
  persistDoc();
  render();
  updateToolbar();
}

function createDoc() {
  return Automerge.from({ text: "" });
}

function loadDoc() {
  const encoded = localStorage.getItem(STORAGE_KEY);

  if (!encoded) {
    return createDoc();
  }

  try {
    return Automerge.load(base64ToBytes(encoded));
  } catch (error) {
    console.warn("Could not restore the saved Automerge document.", error);
    localStorage.removeItem(STORAGE_KEY);
    return createDoc();
  }
}

function persistDoc() {
  if (!handle) {
    return;
  }

  const bytes = Automerge.save(handle.doc());
  localStorage.setItem(STORAGE_KEY, bytesToBase64(bytes));
}

function render() {
  if (!handle) {
    return;
  }

  const currentDoc = handle.doc();
  const plainText = getPlainText(currentDoc);
  const entries = buildEntries(currentDoc);
  const heads = Automerge.getHeads(currentDoc);

  stats.innerHTML = "";
  [
    `${plainText.length} character${plainText.length === 1 ? "" : "s"}`,
    `${entries.length} Automerge change${entries.length === 1 ? "" : "s"}`,
    `${heads.length} head${heads.length === 1 ? "" : "s"}`,
    "styled with ProseMirror",
    "saved in localStorage",
  ].forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "stat";
    chip.textContent = label;
    stats.appendChild(chip);
  });

  historyContainer.innerHTML = "";

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No edits yet. Type or style text above to create Automerge changes.";
    historyContainer.appendChild(empty);
    return;
  }

  const list = document.createElement("ol");

  entries.forEach((entry) => {
    const item = document.createElement("li");
    const card = document.createElement("div");
    card.className = "change";

    const meta = document.createElement("div");
    meta.className = "change-meta";
    meta.textContent = `Change ${entry.index} • ${formatTime(entry.time)} • ${entry.patches.length} patch${entry.patches.length === 1 ? "" : "es"}`;
    card.appendChild(meta);

    const patchList = document.createElement("ul");
    patchList.className = "patch-list";

    entry.patches.forEach((patch) => {
      const patchItem = document.createElement("li");
      patchItem.textContent = describePatch(patch, entry.beforeText);
      patchList.appendChild(patchItem);
    });

    card.appendChild(patchList);

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Raw Automerge patch data";
    details.appendChild(summary);

    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(entry.patches, null, 2);
    details.appendChild(pre);
    card.appendChild(details);

    item.appendChild(card);
    list.appendChild(item);
  });

  historyContainer.appendChild(list);
}

function buildEntries(currentDoc) {
  const history = Automerge.getHistory(currentDoc);
  const entries = [];

  for (let index = 1; index < history.length; index += 1) {
    const previous = history[index - 1].snapshot;
    const current = history[index].snapshot;
    const beforeHeads = Automerge.getHeads(previous);
    const afterHeads = Automerge.getHeads(current);
    const patches = Automerge.diff(currentDoc, beforeHeads, afterHeads);

    entries.push({
      index,
      time: history[index].change.time,
      beforeText: getPlainText(previous),
      afterText: getPlainText(current),
      patches,
    });
  }

  return entries.reverse();
}

function describePatch(patch, beforeText) {
  const index = patch.path[patch.path.length - 1];

  if (patch.action === "splice") {
    return `Insert ${JSON.stringify(patch.value)} at position ${typeof index === "number" ? index : "?"}`;
  }

  if (patch.action === "del") {
    const numericIndex = typeof index === "number" ? index : 0;
    const length = patch.length ?? 1;
    const deletedText = beforeText.slice(numericIndex, numericIndex + length);
    const deletedLabel = deletedText ? JSON.stringify(deletedText) : `${length} character${length === 1 ? "" : "s"}`;
    return `Delete ${deletedLabel} at position ${numericIndex}`;
  }

  if (patch.action === "mark") {
    return patch.marks
      .map((mark) => {
        const value = mark.value === true ? "" : ` (${JSON.stringify(mark.value)})`;
        return `Apply ${mark.name}${value} from ${mark.start} to ${mark.end}`;
      })
      .join("; ");
  }

  if (patch.action === "unmark") {
    return `Remove ${patch.name} from ${patch.start} to ${patch.end}`;
  }

  if (patch.action === "put") {
    return `Set ${formatPath(patch.path)} to ${formatValue(patch.value)}`;
  }

  if (patch.action === "insert") {
    return `Insert ${patch.values.map(formatValue).join(", ")} at ${typeof index === "number" ? index : formatPath(patch.path)}`;
  }

  if (patch.action === "conflict") {
    return `Conflict recorded at ${formatPath(patch.path)}`;
  }

  if (patch.action === "inc") {
    return `Increment value by ${patch.value}`;
  }

  return `${patch.action} ${JSON.stringify(patch)}`;
}

function getCommand(name) {
  if (!view) {
    return null;
  }

  const { schema } = view.state;

  switch (name) {
    case "bold":
      return toggleMark(schema.marks.strong);
    case "italic":
      return toggleMark(schema.marks.em);
    case "code":
      return toggleMark(schema.marks.code);
    case "paragraph":
      return setBlockType(schema.nodes.paragraph);
    case "heading-1":
      return setBlockType(schema.nodes.heading, { level: 1 });
    case "heading-2":
      return setBlockType(schema.nodes.heading, { level: 2 });
    case "undo":
      return undo;
    case "redo":
      return redo;
    default:
      return null;
  }
}

function updateToolbar() {
  const buttons = toolbar.querySelectorAll("button[data-command]");

  buttons.forEach((button) => {
    const command = getCommand(button.dataset.command);
    const isEnabled = Boolean(view && command && command(view.state));
    button.disabled = !isEnabled;

    const isActive = view ? isButtonActive(button.dataset.command) : false;
    button.classList.toggle("active", isActive);
  });
}

function isButtonActive(name) {
  if (!view) {
    return false;
  }

  const { schema } = view.state;

  switch (name) {
    case "bold":
      return isMarkActive(schema.marks.strong);
    case "italic":
      return isMarkActive(schema.marks.em);
    case "code":
      return isMarkActive(schema.marks.code);
    case "paragraph":
      return isBlockActive(schema.nodes.paragraph);
    case "heading-1":
      return isBlockActive(schema.nodes.heading, { level: 1 });
    case "heading-2":
      return isBlockActive(schema.nodes.heading, { level: 2 });
    default:
      return false;
  }
}

function isMarkActive(markType) {
  if (!view || !markType) {
    return false;
  }

  const { state } = view;
  const { from, $from, to, empty } = state.selection;

  if (empty) {
    return Boolean(markType.isInSet(state.storedMarks || $from.marks()));
  }

  return state.doc.rangeHasMark(from, to, markType);
}

function isBlockActive(nodeType, attrs = {}) {
  if (!view || !nodeType) {
    return false;
  }

  const parent = view.state.selection.$from.parent;
  return parent.type === nodeType && attributesMatch(parent.attrs, attrs);
}

function attributesMatch(actual, expected) {
  return Object.entries(expected).every(([key, value]) => actual[key] === value);
}

function getPlainText(doc) {
  if (typeof doc.text === "string") {
    return doc.text;
  }

  try {
    return Automerge.spans(doc, TEXT_PATH)
      .map((span) => (span.type === "text" ? span.value : "\n"))
      .join("");
  } catch (_error) {
    return "";
  }
}

function formatPath(path) {
  return path.map(String).join(".");
}

function formatValue(value) {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatTime(unixSeconds) {
  if (!unixSeconds) {
    return "no timestamp";
  }

  return new Date(unixSeconds * 1000).toLocaleTimeString();
}

function headsEqual(left, right) {
  return left.length === right.length && left.every((head, index) => head === right[index]);
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

await Automerge.initializeBase64Wasm(automergeWasmBase64);
bootstrap();
