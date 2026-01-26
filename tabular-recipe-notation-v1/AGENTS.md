# AGENTS.md

## Commands
- **Test**: `npm test` - validates all sample recipes have complete table grids
- **Run**: Open `index.html` in a browser (no build step required)

## Architecture
- `trn-table.js` - Web Component (`<trn-table>`) rendering TRN tables in Shadow DOM
- `samples.js` - Sample recipe data exported as `{ samples }` object
- `tests/validate-trn.js` - Test runner validating no empty cells in table grids
- `index.html` - Demo page with live JSON editor

## Code Style
- ES Modules (`"type": "module"` in package.json)
- Use `export` for shared code, `import` for dependencies
- Web Components pattern: extend `HTMLElement`, use Shadow DOM
- Assertions via simple `assert(condition, message)` helper in tests
- CSS embedded in component's `styles()` method
- JSON data shape: `{ title?, rows: [{ cells: [{ text, colspan?, rowspan?, align?, className? }] }] }`
