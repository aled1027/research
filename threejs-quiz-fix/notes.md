# Three.js Quiz Canvas Display Fix

## Problem
After answering a question at https://aled1027.github.io/research/threejs-layer-quiz/index.html, the canvas isn't correctly demonstrating the question.

## Investigation

Analyzed `/home/user/research/threejs-layer-quiz/index.html`

### Root Cause #1 (Initial Issue)
The canvas container (`#canvas-container`) starts hidden with `display: none` (line 253). When `initThreeJS()` is called (line 994), it tries to get the canvas dimensions:

```javascript
const canvas = document.getElementById('canvas-container');
const width = canvas.clientWidth;  // Returns 0 because canvas is hidden
const height = canvas.clientHeight; // Returns 0 because canvas is hidden
```

The renderer is then created with 0x0 dimensions:
```javascript
renderer.setSize(width, height);
```

When the canvas is shown after answering (line 990: `canvas.classList.add('show')`), the renderer still has 0x0 dimensions, resulting in nothing being displayed.

### Root Cause #2 (Second Question Onwards)
When moving to the next question, `renderQuestion()` replaces the entire `quiz-content` innerHTML (line 840). This creates a NEW `<div id="canvas-container"></div>` element. However:

1. The renderer's canvas element is still attached to the OLD container that was removed from the DOM
2. The renderer object still exists (so `initThreeJS()` is NOT called again)
3. The new canvas container is empty - it never gets the renderer's canvas appended to it
4. Result: Nothing renders after the second question

## Solution
1. Resize the renderer after showing the canvas (for first question)
2. Re-append the renderer's canvas to the new container element if it exists but isn't already attached

## Changes Made

### Attempt 1 (Partial Fix)
- Added resize logic in `checkAnswer()` function
- Added window resize handler
- This fixed the first question but not subsequent questions

### Attempt 2 (Complete Fix)
Modified `checkAnswer()` to re-append the renderer's canvas element when moving to new questions:

```javascript
// Initialize Three.js if not already done
if (!renderer) {
    initThreeJS();
} else {
    // Renderer exists but we have a new canvas container
    // Re-append the renderer's canvas to the new container
    if (!canvas.contains(renderer.domElement)) {
        canvas.appendChild(renderer.domElement);
    }
}
```

This ensures:
1. First question: Initialize Three.js and create renderer
2. Subsequent questions: Reuse existing renderer but append its canvas to the new container element
3. All questions: Resize renderer to match visible canvas dimensions
