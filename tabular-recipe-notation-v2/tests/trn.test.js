const { test } = require('node:test');
const assert = require('node:assert');
const { jsonToHtml, encodeHtml } = require('../src/trn.js');

// Banana bread recipe - the reference test case
const bananaBreadRecipe = {
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

const expectedBananaBreadHtml = '<table><tr><td colspan=7 align=center>Butter and flour a loaf pan</td></tr><tr><td colspan=7 align=center>Preheat oven to 350&#176;F (170&#176;C)</td></tr><tr><td>2 large (250 g) ripe bananas</td><td>mash</td><td rowspan=4 class="vertical">mash until smooth</td><td rowspan=10 class="vertical">fold</td><td rowspan=10 class="vertical">bake 350&#176;F (170&#176;C) 55 min.</td><td rowspan=10 class="vertical">cool 10 min. in pan</td><td rowspan=10 class="vertical">cool on wire rack</td></tr><tr><td>6 Tbs. (90 mL) butter</td><td>melt</td></tr><tr><td>1 tsp. (5 mL) vanilla extract</td><td class="righthide"></td></tr><tr><td>2 large eggs</td><td>lightly beat</td></tr><tr><td>1-1/3 cups (167 g) all-purpose flour</td><td rowspan=5 class="vertical">whisk</td><td rowspan=6 class="righthide"></td></tr><tr><td>2/3 cup (130 g) sugar</td></tr><tr><td>1/2 tsp. (2.3 g) baking soda</td></tr><tr><td>1/4 tsp. (1.2 g) baking powder</td></tr><tr><td>1/2 tsp. (3 g) salt</td></tr><tr><td>1/2 cup (70 g) chopped walnuts</td><td class="righthide"></td></tr></table>';

test('encodeHtml encodes degree symbol', () => {
  assert.strictEqual(encodeHtml('350°F'), '350&#176;F');
});

test('encodeHtml handles empty string', () => {
  assert.strictEqual(encodeHtml(''), '');
});

test('encodeHtml handles null/undefined', () => {
  assert.strictEqual(encodeHtml(null), '');
  assert.strictEqual(encodeHtml(undefined), '');
});

test('jsonToHtml handles empty/invalid input', () => {
  assert.strictEqual(jsonToHtml(null), '<table></table>');
  assert.strictEqual(jsonToHtml({}), '<table></table>');
  assert.strictEqual(jsonToHtml({ table: {} }), '<table></table>');
});

test('jsonToHtml converts simple table', () => {
  const simple = {
    table: {
      rows: [
        { cells: [{ content: 'Hello' }] }
      ]
    }
  };
  assert.strictEqual(jsonToHtml(simple), '<table><tr><td>Hello</td></tr></table>');
});

test('jsonToHtml handles colspan attribute', () => {
  const withColspan = {
    table: {
      rows: [
        { cells: [{ content: 'Wide cell', colspan: 3 }] }
      ]
    }
  };
  assert.strictEqual(jsonToHtml(withColspan), '<table><tr><td colspan=3>Wide cell</td></tr></table>');
});

test('jsonToHtml handles rowspan attribute', () => {
  const withRowspan = {
    table: {
      rows: [
        { cells: [{ content: 'Tall cell', rowspan: 2 }] }
      ]
    }
  };
  assert.strictEqual(jsonToHtml(withRowspan), '<table><tr><td rowspan=2>Tall cell</td></tr></table>');
});

test('jsonToHtml handles align attribute', () => {
  const withAlign = {
    table: {
      rows: [
        { cells: [{ content: 'Centered', align: 'center' }] }
      ]
    }
  };
  assert.strictEqual(jsonToHtml(withAlign), '<table><tr><td align=center>Centered</td></tr></table>');
});

test('jsonToHtml handles class attribute', () => {
  const withClass = {
    table: {
      rows: [
        { cells: [{ content: 'Styled', class: 'vertical' }] }
      ]
    }
  };
  assert.strictEqual(jsonToHtml(withClass), '<table><tr><td class="vertical">Styled</td></tr></table>');
});

test('jsonToHtml converts banana bread recipe exactly', () => {
  const result = jsonToHtml(bananaBreadRecipe);
  assert.strictEqual(result, expectedBananaBreadHtml);
});

// Lemon bars recipe test case
const lemonBarsRecipe = {
  "table": {
    "rows": [
      {
        "cells": [
          { "content": "1-3/4 cup (245 g) all purpose flour" },
          { "content": "mix", "rowspan": 4, "class": "vertical" },
          { "content": "process", "rowspan": 5, "class": "vertical" },
          { "content": "line 9x13\" pan", "rowspan": 5, "class": "vertical" },
          { "content": "refrigerate for 30 min.", "rowspan": 5, "class": "vertical" },
          { "content": "350°F for 20 min.", "rowspan": 5, "class": "vertical" },
          { "content": "350°F for 20 min.", "rowspan": 12, "class": "vertical" },
          { "content": "cool and cut", "rowspan": 12, "class": "vertical" }
        ]
      },
      {
        "cells": [
          { "content": "2/3 cup (80 g) confectioner's sugar" }
        ]
      },
      {
        "cells": [
          { "content": "1/4 cup (30 g) cornstarch" }
        ]
      },
      {
        "cells": [
          { "content": "3/4 tsp. (4.5 g) salt" }
        ]
      },
      {
        "cells": [
          { "content": "3/4 cup (170 g) butter" },
          { "content": "", "class": "righthide" }
        ]
      },
      {
        "cells": [
          { "content": "4 large (200 g) eggs" },
          { "content": "whisk", "rowspan": 4, "class": "vertical" },
          { "content": "mix", "rowspan": 7, "class": "vertical" },
          { "content": "", "rowspan": 7, "colspan": 3, "class": "righthide" }
        ]
      },
      {
        "cells": [
          { "content": "1-1/3 cup (270 g) granulated sugar" }
        ]
      },
      {
        "cells": [
          { "content": "3 Tbs. (24 g) all purpose flour" }
        ]
      },
      {
        "cells": [
          { "content": "1/8 tsp. (0.8 g) salt" }
        ]
      },
      {
        "cells": [
          { "content": "2 tsp. (4 g) lemon zest" },
          { "content": "", "rowspan": 3, "class": "righthide" }
        ]
      },
      {
        "cells": [
          { "content": "2/3 cup (160 mL) lemon juice" }
        ]
      },
      {
        "cells": [
          { "content": "1/3 cup (80 mL) whole milk" }
        ]
      }
    ]
  }
};

const expectedLemonBarsHtml = '<table><tr><td>1-3/4 cup (245 g) all purpose flour</td><td rowspan=4 class="vertical">mix</td><td rowspan=5 class="vertical">process</td><td rowspan=5 class="vertical">line 9x13" pan</td><td rowspan=5 class="vertical">refrigerate for 30 min.</td><td rowspan=5 class="vertical">350&#176;F for 20 min.</td><td rowspan=12 class="vertical">350&#176;F for 20 min.</td><td rowspan=12 class="vertical">cool and cut</td></tr><tr><td>2/3 cup (80 g) confectioner\'s sugar</td></tr><tr><td>1/4 cup (30 g) cornstarch</td></tr><tr><td>3/4 tsp. (4.5 g) salt</td></tr><tr><td>3/4 cup (170 g) butter</td><td class="righthide"></td></tr><tr><td>4 large (200 g) eggs</td><td rowspan=4 class="vertical">whisk</td><td rowspan=7 class="vertical">mix</td><td colspan=3 rowspan=7 class="righthide"></td></tr><tr><td>1-1/3 cup (270 g) granulated sugar</td></tr><tr><td>3 Tbs. (24 g) all purpose flour</td></tr><tr><td>1/8 tsp. (0.8 g) salt</td></tr><tr><td>2 tsp. (4 g) lemon zest</td><td rowspan=3 class="righthide"></td></tr><tr><td>2/3 cup (160 mL) lemon juice</td></tr><tr><td>1/3 cup (80 mL) whole milk</td></tr></table>';

test('jsonToHtml converts lemon bars recipe exactly', () => {
  const result = jsonToHtml(lemonBarsRecipe);
  assert.strictEqual(result, expectedLemonBarsHtml);
});
