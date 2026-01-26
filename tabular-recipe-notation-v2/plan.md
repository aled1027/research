Implement a web component that takes in a recipe as JSON and renders HTML that represents the recipe in tabular recipe notation.

Start with a test suite that has (a) input json and (b) tests the exact html match.

Then, using function that convert json to the html, create a web component with a UI. The UI should have a textarea for the JSON and a view of the outputted html table.

The input json:
```
{
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
}
```

the output html

```
<table><tr><td colspan=7 align=center>Butter and flour a loaf pan</td></tr><tr><td colspan=7 align=center>Preheat oven to 350&#176;F (170&#176;C)</td></tr><tr><td>2 large (250 g) ripe bananas</td><td>mash</td><td rowspan=4 class="vertical">mash until smooth</td><td rowspan=10 class="vertical">fold</td><td rowspan=10 class="vertical">bake 350&#176;F (170&#176;C) 55 min.</td><td rowspan=10 class="vertical">cool 10 min. in pan</td><td rowspan=10 class="vertical">cool on wire rack</td></tr><tr><td>6 Tbs. (90 mL) butter</td><td>melt</td></tr><tr><td>1 tsp. (5 mL) vanilla extract</td><td class="righthide"></td></tr><tr><td>2 large eggs</td><td>lightly beat</td></tr><tr><td>1-1/3 cups (167 g) all-purpose flour</td><td rowspan=5 class="vertical">whisk</td><td rowspan=6 class="righthide"></td></tr><tr><td>2/3 cup (130 g) sugar</td></tr><tr><td>1/2 tsp. (2.3 g) baking soda</td></tr><tr><td>1/4 tsp. (1.2 g) baking powder</td></tr><tr><td>1/2 tsp. (3 g) salt</td></tr><tr><td>1/2 cup (70 g) chopped walnuts</td><td class="righthide"></td></tr></table>
```