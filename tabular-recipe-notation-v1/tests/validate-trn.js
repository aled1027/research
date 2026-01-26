import { samples } from "../samples.js";

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const normalizeSpan = (value) => {
  if (value === undefined || value === null) {
    return 1;
  }
  const span = Number(value);
  return Number.isFinite(span) && span > 0 ? span : 1;
};

const buildGrid = (rows) => {
  const grid = [];
  const spans = [];
  let maxCols = 0;

  rows.forEach((row, rowIndex) => {
    const gridRow = [];
    grid[rowIndex] = gridRow;

    const fillSpanCells = () => {
      spans.forEach((span, colIndex) => {
        if (span > 0) {
          gridRow[colIndex] = true;
          spans[colIndex] -= 1;
        }
      });
    };

    fillSpanCells();

    let colIndex = 0;
    (row.cells || []).forEach((cell) => {
      while (gridRow[colIndex]) {
        colIndex += 1;
      }

      const rowspan = normalizeSpan(cell.rowspan);
      const colspan = normalizeSpan(cell.colspan);

      for (let c = 0; c < colspan; c += 1) {
        gridRow[colIndex + c] = true;
        if (rowspan > 1) {
          spans[colIndex + c] = Math.max(spans[colIndex + c] || 0, rowspan - 1);
        }
      }

      colIndex += colspan;
    });
    maxCols = Math.max(maxCols, gridRow.length);
  });

  return { grid, maxCols };
};

const validateSample = (name, sample) => {
  assert(Array.isArray(sample.rows), `${name}: rows must be an array`);
  const { grid, maxCols } = buildGrid(sample.rows);

  grid.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < maxCols; colIndex += 1) {
      assert(row[colIndex], `${name}: row ${rowIndex + 1} column ${colIndex + 1} is empty`);
    }
  });
};

Object.entries(samples).forEach(([name, sample]) => {
  validateSample(name, sample);
});

console.log("TRN samples validated.");
