/**
 * Tabular Recipe Notation - JSON to HTML converter
 * Converts recipe JSON into HTML table format
 */

/**
 * Encodes special characters for HTML
 * @param {string} text - The text to encode
 * @returns {string} - HTML-encoded text
 */
function encodeHtml(text) {
  if (!text) return '';
  return text
    .replace(/°/g, '&#176;');
}

/**
 * Converts a recipe JSON object to an HTML table string
 * @param {Object} recipe - The recipe object with table.rows structure
 * @returns {string} - HTML table string
 */
function jsonToHtml(recipe) {
  if (!recipe || !recipe.table || !recipe.table.rows) {
    return '<table></table>';
  }

  let html = '<table>';

  for (const row of recipe.table.rows) {
    html += '<tr>';

    if (row.cells) {
      for (const cell of row.cells) {
        html += '<td';

        if (cell.colspan) {
          html += ` colspan=${cell.colspan}`;
        }
        if (cell.rowspan) {
          html += ` rowspan=${cell.rowspan}`;
        }
        if (cell.align) {
          html += ` align=${cell.align}`;
        }
        if (cell.class) {
          html += ` class="${cell.class}"`;
        }

        html += '>';
        html += encodeHtml(cell.content);
        html += '</td>';
      }
    }

    html += '</tr>';
  }

  html += '</table>';
  return html;
}

// Export for Node.js (tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { jsonToHtml, encodeHtml };
}
