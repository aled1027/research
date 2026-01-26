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

  connectedCallback() {
    if (!this.shadowRoot.innerHTML) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) {
      return;
    }

    const data = this._data;
    const table = document.createElement("table");
    table.className = "trn-table";

    if (!data || !Array.isArray(data.rows)) {
      this.shadowRoot.innerHTML = `
        <style>${this.styles()}</style>
        <div class="empty-state">Paste TRN JSON to render a table.</div>
      `;
      return;
    }

    data.rows.forEach((row) => {
      const tr = document.createElement("tr");
      (row.cells || []).forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell.text ?? "";

        if (cell.colspan) {
          td.colSpan = cell.colspan;
        }
        if (cell.rowspan) {
          td.rowSpan = cell.rowspan;
        }
        if (cell.align) {
          td.style.textAlign = cell.align;
        }
        if (cell.className) {
          td.classList.add(...cell.className.split(" "));
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    const caption = data.title ? `<caption>${data.title}</caption>` : "";

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      ${caption}
    `;
    this.shadowRoot.appendChild(table);
  }

  styles() {
    return `
      :host {
        display: block;
        font-family: "Helvetica Neue", Arial, sans-serif;
        color: #1d1d1f;
      }

      .trn-table {
        border-collapse: collapse;
        width: 100%;
        background: #fff;
      }

      caption {
        caption-side: top;
        font-weight: 600;
        margin-bottom: 8px;
      }

      td {
        border: 1px solid #c7c7c7;
        padding: 8px 10px;
        vertical-align: middle;
        font-size: 0.95rem;
      }

      td.vertical {
        white-space: normal;
        font-weight: 600;
        letter-spacing: 0.2px;
        background: #f5f5f5;
        min-width: 120px;
        text-align: center;
      }

      td.righthide {
        border-right-color: transparent;
        background: #fafafa;
      }

      td.instruction {
        background: #f0f7ff;
        font-weight: 600;
      }

      .empty-state {
        padding: 16px;
        border: 1px dashed #b0b0b0;
        background: #fafafa;
        color: #666;
      }
    `;
  }
}

customElements.define("trn-table", TrnTable);
