# Implementation Plan: Tabular Recipe Notation Web Component

## Overview

Build a web component that converts JSON recipe data into HTML tables using "tabular recipe notation" - a visual format that shows recipe steps flowing left-to-right and ingredients flowing top-to-bottom.

## Architecture

```
src/
  trn.js           # Core JSON-to-HTML conversion function
  trn-editor.js    # Web component with textarea + preview UI
tests/
  trn.test.js      # Test suite for JSON-to-HTML conversion
index.html         # Demo page
```

## Phase 1: Core Conversion Function

### Task 1.1: Create the JSON-to-HTML converter

Create `src/trn.js` with a function that:
- Takes a recipe JSON object as input
- Returns an HTML string representing the table
- Handles all cell attributes:
  - `content` - cell text content
  - `colspan` - column span
  - `rowspan` - row span
  - `align` - text alignment
  - `class` - CSS class (e.g., "vertical", "righthide")

### Task 1.2: Handle special characters

- Encode special HTML characters (e.g., `°` → `&#176;`)
- Preserve other text content as-is

## Phase 2: Test Suite

### Task 2.1: Set up test infrastructure

- Use a simple test runner (e.g., Node.js built-in test runner)
- Structure: input JSON + expected HTML output

### Task 2.2: Create initial test case

Start with a single test case:
- **Banana bread recipe** - the exact JSON and HTML from plan.md
- Input: the full recipe JSON object
- Expected output: the exact HTML string from plan.md

Additional test cases can be added later as needed.

## Phase 3: Web Component

### Task 3.1: Create the editor web component

Create `src/trn-editor.js` as a custom element `<trn-editor>`:
- Shadow DOM for encapsulated styling
- Layout: split view or stacked view

### Task 3.2: Component structure

```
<trn-editor>
  #shadow-root
    <div class="container">
      <div class="input-panel">
        <label>Recipe JSON</label>
        <textarea></textarea>
      </div>
      <div class="output-panel">
        <label>Preview</label>
        <div class="preview"></div>
      </div>
    </div>
    <style>...</style>
</trn-editor>
```

### Task 3.3: Component features

- Live preview: update HTML on textarea input (debounced)
- Error handling: show JSON parse errors gracefully
- Default sample: load banana bread recipe as example

### Task 3.4: Styling

CSS for the table:
- `.vertical` class: rotate text 90 degrees
- `.righthide` class: hide right border (for visual continuity)
- Basic table borders and padding
- Responsive layout

## Phase 4: Demo Page

### Task 4.1: Create index.html

- Include the web component
- Provide usage instructions
- Show the component in action

## Implementation Details

### JSON Schema

```typescript
interface RecipeTable {
  table: {
    rows: Row[];
  };
}

interface Row {
  cells: Cell[];
}

interface Cell {
  content: string;
  colspan?: number;
  rowspan?: number;
  align?: "left" | "center" | "right";
  class?: string;
}
```

### Conversion Algorithm

```
function jsonToHtml(recipe):
  html = "<table>"
  for each row in recipe.table.rows:
    html += "<tr>"
    for each cell in row.cells:
      html += "<td"
      if cell.colspan: html += ` colspan=${cell.colspan}`
      if cell.rowspan: html += ` rowspan=${cell.rowspan}`
      if cell.align: html += ` align=${cell.align}`
      if cell.class: html += ` class="${cell.class}"`
      html += ">"
      html += encodeHtml(cell.content)
      html += "</td>"
    html += "</tr>"
  html += "</table>"
  return html
```

## File Checklist

- [ ] `src/trn.js` - Core conversion function
- [ ] `src/trn-editor.js` - Web component
- [ ] `tests/trn.test.js` - Test suite
- [ ] `index.html` - Demo page
- [ ] `package.json` - Project config (if using npm for tests)

## Execution Order

1. Create `src/trn.js` with the conversion function
2. Create `tests/trn.test.js` with test cases (TDD approach)
3. Verify all tests pass
4. Create `src/trn-editor.js` web component
5. Create `index.html` demo page
6. Manual testing and refinement
