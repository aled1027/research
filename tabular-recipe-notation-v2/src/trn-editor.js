/**
 * Tabular Recipe Notation Editor Web Component
 * Provides a textarea for JSON input and live HTML table preview
 */

// Import jsonToHtml for browser use (will be in global scope via script tag)
// For module usage, this would be: import { jsonToHtml } from './trn.js';

const defaultRecipe = {
  "table": {
    "rows": [
      {
        "cells": [
          { "content": "Butter and flour a loaf pan", "colspan": 7, "align": "center" }
        ]
      },
      {
        "cells": [
          { "content": "Preheat oven to 350°F (170°C)", "colspan": 7, "align": "center" }
        ]
      },
      {
        "cells": [
          { "content": "2 large (250 g) ripe bananas" },
          { "content": "mash" },
          { "content": "mash until smooth", "rowspan": 4, "class": "vertical" },
          { "content": "fold", "rowspan": 10, "class": "vertical" },
          { "content": "bake 350°F (170°C) 55 min.", "rowspan": 10, "class": "vertical" },
          { "content": "cool 10 min. in pan", "rowspan": 10, "class": "vertical" },
          { "content": "cool on wire rack", "rowspan": 10, "class": "vertical" }
        ]
      },
      {
        "cells": [
          { "content": "6 Tbs. (90 mL) butter" },
          { "content": "melt" }
        ]
      },
      {
        "cells": [
          { "content": "1 tsp. (5 mL) vanilla extract" },
          { "content": "", "class": "righthide" }
        ]
      },
      {
        "cells": [
          { "content": "2 large eggs" },
          { "content": "lightly beat" }
        ]
      },
      {
        "cells": [
          { "content": "1-1/3 cups (167 g) all-purpose flour" },
          { "content": "whisk", "rowspan": 5, "class": "vertical" },
          { "content": "", "rowspan": 6, "class": "righthide" }
        ]
      },
      {
        "cells": [
          { "content": "2/3 cup (130 g) sugar" }
        ]
      },
      {
        "cells": [
          { "content": "1/2 tsp. (2.3 g) baking soda" }
        ]
      },
      {
        "cells": [
          { "content": "1/4 tsp. (1.2 g) baking powder" }
        ]
      },
      {
        "cells": [
          { "content": "1/2 tsp. (3 g) salt" }
        ]
      },
      {
        "cells": [
          { "content": "1/2 cup (70 g) chopped walnuts" },
          { "content": "", "class": "righthide" }
        ]
      }
    ]
  }
};

class TrnEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._debounceTimer = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.updatePreview();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }

        textarea {
          flex: 1;
          min-height: 300px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }

        textarea:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
        }

        .preview {
          flex: 1;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: auto;
          background: #fafafa;
        }

        .error {
          color: #cc0000;
          background: #ffeeee;
          padding: 8px;
          border-radius: 4px;
          font-size: 14px;
        }

        /* Table styles - based on original TRN specification */
        table {
          border: 2px solid #40A040;
          font: 9pt/120% Trebuchet MS, Arial, sans-serif;
          border-spacing: 0px;
          empty-cells: show;
          border-collapse: collapse;
          background-color: #FFFFFF;
        }

        th {
          border: 1px solid #40A040;
          border-bottom: 2px solid #40A040;
        }

        td {
          border: 1px solid #40A040;
          border-left: 0;
          border-top: 0;
          padding: 2px 4px;
          vertical-align: middle;
        }

        .vertical {
          text-align: center;
          vertical-align: middle;
        }

        .righthide {
          border-right: 0;
          border-bottom: 1px solid #40A040;
        }
      </style>

      <div class="container">
        <div class="panel input-panel">
          <label for="json-input">Recipe JSON</label>
          <textarea id="json-input">${JSON.stringify(defaultRecipe, null, 2)}</textarea>
        </div>
        <div class="panel output-panel">
          <label>Preview</label>
          <div class="preview" id="preview"></div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const textarea = this.shadowRoot.getElementById('json-input');
    textarea.addEventListener('input', () => {
      // Debounce updates for performance
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this.updatePreview(), 150);
    });
  }

  updatePreview() {
    const textarea = this.shadowRoot.getElementById('json-input');
    const preview = this.shadowRoot.getElementById('preview');

    try {
      const recipe = JSON.parse(textarea.value);
      const html = jsonToHtml(recipe);
      preview.innerHTML = html;
    } catch (e) {
      preview.innerHTML = `<div class="error">JSON Parse Error: ${e.message}</div>`;
    }
  }
}

customElements.define('trn-editor', TrnEditor);
