# Tabular Recipe Notation (TRN) Demo

## Goal
Create a lightweight web component that renders Tabular Recipe Notation (TRN) tables from JSON and provide a demo page with editable input.

## TRN Philosophy Summary
TRN presents a recipe as a left-to-right flow of ingredients and actions. Rows list ingredients or intermediate mixtures, while columns show the actions applied to those items. Vertical, row-spanning cells communicate dependencies: a single action (like folding or baking) can apply to multiple rows, visually indicating the sequential flow of the recipe.

## JSON Shape Used
The demo accepts a JSON object with:

- `title`: Optional table caption.
- `rows`: Array of table rows.
  - Each row has a `cells` array.
  - A cell supports `text`, `colspan`, `rowspan`, `align`, and `className` (for styling).

This keeps the structure close to HTML table semantics while allowing the TRN dependency layout (via rowspans).

## Implementation Notes
- `trn-table.js` defines a `<trn-table>` custom element that renders the table in its shadow DOM.
- `index.html` includes a textarea that edits the JSON and updates the component live.
- Styling includes a `.vertical` class that uses `writing-mode: vertical-rl` to mimic TRN action columns, and `.righthide` to soften right borders where appropriate.

## How To Run
Open `index.html` in a browser, edit the JSON, and see the TRN table update.
