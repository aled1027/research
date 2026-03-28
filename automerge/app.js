const STORAGE_KEY = "automerge-text-demo-v1";

const editor = document.querySelector("#editor");
const stats = document.querySelector("#stats");
const historyContainer = document.querySelector("#history");
const resetButton = document.querySelector("#reset");

let doc = loadDoc();
render();

editor.addEventListener("input", (event) => {
  const nextText = event.target.value;
  const currentText = doc.text ?? "";

  if (nextText === currentText) {
    return;
  }

  doc = Automerge.change(doc, { message: "Edited text" }, (draft) => {
    Automerge.updateText(draft, ["text"], nextText);
  });

  persistDoc();
  render();
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  doc = createDoc("");
  render();
  editor.focus();
});

function createDoc(initialText) {
  return Automerge.from({ text: initialText });
}

function loadDoc() {
  const encoded = localStorage.getItem(STORAGE_KEY);

  if (!encoded) {
    return createDoc("");
  }

  try {
    return Automerge.load(base64ToBytes(encoded));
  } catch (error) {
    console.warn("Could not restore the saved Automerge document.", error);
    localStorage.removeItem(STORAGE_KEY);
    return createDoc("");
  }
}

function persistDoc() {
  const bytes = Automerge.save(doc);
  localStorage.setItem(STORAGE_KEY, bytesToBase64(bytes));
}

function render() {
  const text = doc.text ?? "";

  if (editor.value !== text) {
    editor.value = text;
  }

  const entries = buildEntries(doc);
  const heads = Automerge.getHeads(doc);

  stats.innerHTML = "";
  [
    `${text.length} character${text.length === 1 ? "" : "s"}`,
    `${entries.length} Automerge change${entries.length === 1 ? "" : "s"}`,
    `${heads.length} head${heads.length === 1 ? "" : "s"}`,
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
    empty.textContent = "No edits yet. Start typing to create Automerge changes.";
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
      beforeText: previous.text ?? "",
      afterText: current.text ?? "",
      patches,
    });
  }

  return entries.reverse();
}

function describePatch(patch, beforeText) {
  const index = patch.path[patch.path.length - 1];

  if (patch.action === "splice") {
    return `Insert ${JSON.stringify(patch.value)} at position ${index}`;
  }

  if (patch.action === "del") {
    const length = patch.length ?? 1;
    const deletedText = beforeText.slice(index, index + length);
    const deletedLabel = deletedText ? JSON.stringify(deletedText) : `${length} character${length === 1 ? "" : "s"}`;
    return `Delete ${deletedLabel} at position ${index}`;
  }

  if (patch.action === "put") {
    return `Set ${patch.path.join(".")} to ${JSON.stringify(patch.value)}`;
  }

  if (patch.action === "insert") {
    return `Insert ${JSON.stringify(patch.values)} at position ${index}`;
  }

  if (patch.action === "mark" || patch.action === "unmark") {
    return `${patch.action} text formatting`;
  }

  if (patch.action === "conflict") {
    return `Conflict recorded at ${patch.path.join(".")}`;
  }

  if (patch.action === "inc") {
    return `Increment value by ${patch.value}`;
  }

  return `${patch.action} ${JSON.stringify(patch)}`;
}

function formatTime(unixSeconds) {
  if (!unixSeconds) {
    return "no timestamp";
  }

  return new Date(unixSeconds * 1000).toLocaleTimeString();
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
