Tabular Recipe Notation (TRN) is a system for visually structuring recipes in a table format, where ingredients and actions are organized for clarity and sequential flow. The project delivers a lightweight web component (`<trn-table>`) that renders TRN tables from editable JSON, mapping closely to HTML table semantics while supporting complex dependencies through properties like `rowspan`. The demo page allows users to edit input JSON and see immediate updates, improving recipe communication and workflow understanding. Styling and layout emphasize horizontal readability and action dependencies.

Key links:
- [Component source (`trn-table.js`)](./trn-table.js)
- [Demo page](./index.html)

**Key Features:**
- Receives JSON; renders structured, interactive recipe tables
- Supports row/column spans for dependency visualizations
- Editable demo with live table preview
- Test suite ensures correct cell population per recipe sample
