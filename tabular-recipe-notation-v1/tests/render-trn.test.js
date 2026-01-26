import { renderTrnTable, normalizeHtml } from "./render-trn.js";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertEqual = (actual, expected, message) => {
  const a = normalizeHtml(actual);
  const e = normalizeHtml(expected);
  if (a !== e) {
    console.error("Expected:", e);
    console.error("Actual:", a);
    throw new Error(message || "Assertion failed");
  }
};

const tests = {
  "renders empty state for null data": () => {
    const html = renderTrnTable(null);
    assert(html.includes("empty-state"), "Should render empty state");
    assert(html.includes("Paste TRN JSON"), "Should show placeholder text");
  },

  "renders empty state for missing rows": () => {
    const html = renderTrnTable({ title: "Test" });
    assert(html.includes("empty-state"), "Should render empty state");
  },

  "renders simple single cell": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{ text: "Hello" }] }],
    });
    assertEqual(
      html,
      `<table class="trn-table"><tr><td>Hello</td></tr></table>`,
      "Single cell should render correctly"
    );
  },

  "renders title as caption": () => {
    const html = renderTrnTable({
      title: "My Recipe",
      rows: [{ cells: [{ text: "Step 1" }] }],
    });
    assert(html.includes("<caption>My Recipe</caption>"), "Should include caption");
    assert(html.includes("Step 1"), "Should include cell text");
  },

  "renders colspan attribute": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{ text: "Wide cell", colspan: 3 }] }],
    });
    assert(html.includes('colspan="3"'), "Should have colspan attribute");
  },

  "renders rowspan attribute": () => {
    const html = renderTrnTable({
      rows: [
        { cells: [{ text: "Tall cell", rowspan: 2 }, { text: "A" }] },
        { cells: [{ text: "B" }] },
      ],
    });
    assert(html.includes('rowspan="2"'), "Should have rowspan attribute");
  },

  "renders text-align style": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{ text: "Centered", align: "center" }] }],
    });
    assert(html.includes("text-align:center") || html.includes("text-align: center"), 
      "Should have text-align style");
  },

  "renders className on cells": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{ text: "Special", className: "instruction" }] }],
    });
    assert(html.includes('class="instruction"'), "Should have class attribute");
  },

  "renders multiple classes": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{ text: "Multi", className: "vertical righthide" }] }],
    });
    // linkedom may order classes differently, just check both are present
    assert(html.includes("vertical"), "Should have vertical class");
    assert(html.includes("righthide"), "Should have righthide class");
  },

  "renders multiple rows and cells": () => {
    const html = renderTrnTable({
      rows: [
        { cells: [{ text: "A" }, { text: "B" }] },
        { cells: [{ text: "C" }, { text: "D" }] },
      ],
    });
    const trCount = (html.match(/<tr>/g) || []).length;
    const tdCount = (html.match(/<td>/g) || []).length;
    assert(trCount === 2, `Should have 2 rows, got ${trCount}`);
    assert(tdCount === 4, `Should have 4 cells, got ${tdCount}`);
  },

  "handles empty text gracefully": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{ text: "" }] }],
    });
    assertEqual(
      html,
      `<table class="trn-table"><tr><td></td></tr></table>`,
      "Empty text should render empty td"
    );
  },

  "handles undefined text as empty": () => {
    const html = renderTrnTable({
      rows: [{ cells: [{}] }],
    });
    assert(html.includes("<td></td>"), "Undefined text should render empty");
  },

  "renders instruction row from sample pattern": () => {
    const html = renderTrnTable({
      rows: [{
        cells: [{
          text: "Preheat oven to 350°F",
          colspan: 7,
          align: "center",
          className: "instruction",
        }],
      }],
    });
    assert(html.includes('colspan="7"'), "Should have colspan");
    assert(html.includes("instruction"), "Should have instruction class");
    assert(html.includes("Preheat oven"), "Should have text");
  },

  "renders Banana Nut Bread sample correctly": () => {
    const html = renderTrnTable({
      rows: [
        { cells: [{ text: "Butter and flour a loaf pan", colspan: 7, align: "center" }] },
        { cells: [{ text: "Preheat oven to 350°F (170°C)", colspan: 7, align: "center" }] },
        {
          cells: [
            { text: "2 large (250 g) ripe bananas" },
            { text: "mash" },
            { text: "mash until smooth", rowspan: 4, className: "vertical" },
            { text: "fold", rowspan: 10, className: "vertical" },
            { text: "bake 350°F (170°C) 55 min.", rowspan: 10, className: "vertical" },
            { text: "cool 10 min. in pan", rowspan: 10, className: "vertical" },
            { text: "cool on wire rack", rowspan: 10, className: "vertical" },
          ],
        },
        { cells: [{ text: "6 Tbs. (90 mL) butter" }, { text: "melt" }] },
        { cells: [{ text: "1 tsp. (5 mL) vanilla extract" }, { text: "", className: "righthide" }] },
        { cells: [{ text: "2 large eggs" }, { text: "lightly beat" }] },
        {
          cells: [
            { text: "1-1/3 cups (167 g) all-purpose flour" },
            { text: "whisk", rowspan: 5, className: "vertical" },
            { text: "", rowspan: 6, className: "righthide" },
          ],
        },
        { cells: [{ text: "2/3 cup (130 g) sugar" }] },
        { cells: [{ text: "1/2 tsp. (2.3 g) baking soda" }] },
        { cells: [{ text: "1/4 tsp. (1.2 g) baking powder" }] },
        { cells: [{ text: "1/2 tsp. (3 g) salt" }] },
        { cells: [{ text: "1/2 cup (70 g) chopped walnuts" }, { text: "", className: "righthide" }] },
      ],
    });

    const expected = `<table class="trn-table"><tr><td style="text-align:center" colspan="7">Butter and flour a loaf pan</td></tr><tr><td style="text-align:center" colspan="7">Preheat oven to 350°F (170°C)</td></tr><tr><td>2 large (250 g) ripe bananas</td><td>mash</td><td class="vertical" rowspan="4">mash until smooth</td><td class="vertical" rowspan="10">fold</td><td class="vertical" rowspan="10">bake 350°F (170°C) 55 min.</td><td class="vertical" rowspan="10">cool 10 min. in pan</td><td class="vertical" rowspan="10">cool on wire rack</td></tr><tr><td>6 Tbs. (90 mL) butter</td><td>melt</td></tr><tr><td>1 tsp. (5 mL) vanilla extract</td><td class="righthide"></td></tr><tr><td>2 large eggs</td><td>lightly beat</td></tr><tr><td>1-1/3 cups (167 g) all-purpose flour</td><td class="vertical" rowspan="5">whisk</td><td class="righthide" rowspan="6"></td></tr><tr><td>2/3 cup (130 g) sugar</td></tr><tr><td>1/2 tsp. (2.3 g) baking soda</td></tr><tr><td>1/4 tsp. (1.2 g) baking powder</td></tr><tr><td>1/2 tsp. (3 g) salt</td></tr><tr><td>1/2 cup (70 g) chopped walnuts</td><td class="righthide"></td></tr></table>`;

    assertEqual(html, expected, "Banana Nut Bread HTML should match expected output");
  },
};

// Run all tests
let passed = 0;
let failed = 0;

for (const [name, testFn] of Object.entries(tests)) {
  try {
    testFn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
