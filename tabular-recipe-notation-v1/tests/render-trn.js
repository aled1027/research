import { parseHTML } from "linkedom";

// Create a minimal DOM environment for the web component
const createDOM = () => {
  const { document, HTMLElement, customElements } = parseHTML(`
    <!DOCTYPE html>
    <html><body></body></html>
  `);
  return { document, HTMLElement, customElements };
};

// Render JSON data through TrnTable and return the table HTML (without styles)
export const renderTrnTable = (data) => {
  const { document, HTMLElement, customElements } = createDOM();
  
  // Make globals available for the component
  globalThis.HTMLElement = HTMLElement;
  globalThis.document = document;

  // Define TrnTable in this DOM context
  class TrnTable extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._data = null;
    }

    set data(value) {
      this._data = value;
      this.render();
    }

    get data() {
      return this._data;
    }

    render() {
      if (!this.shadowRoot) return;

      const data = this._data;
      const table = document.createElement("table");
      table.className = "trn-table";

      if (!data || !Array.isArray(data.rows)) {
        this.shadowRoot.innerHTML = `<div class="empty-state">Paste TRN JSON to render a table.</div>`;
        return;
      }

      data.rows.forEach((row) => {
        const tr = document.createElement("tr");
        (row.cells || []).forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = cell.text ?? "";

          if (cell.colspan) td.setAttribute("colspan", cell.colspan);
          if (cell.rowspan) td.setAttribute("rowspan", cell.rowspan);
          if (cell.align) td.style.textAlign = cell.align;
          if (cell.className) td.classList.add(...cell.className.split(" "));

          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      const caption = data.title ? `<caption>${data.title}</caption>` : "";
      this.shadowRoot.innerHTML = caption;
      this.shadowRoot.appendChild(table);
    }
  }

  customElements.define("trn-table", TrnTable);

  const el = document.createElement("trn-table");
  document.body.appendChild(el);
  el.data = data;

  return el.shadowRoot.innerHTML;
};

// Normalize HTML for comparison (remove extra whitespace)
export const normalizeHtml = (html) => {
  return html.replace(/>\s+</g, "><").trim();
};
