# Three.js Quiz Canvas Display Fix

## Problem
After answering a question at https://aled1027.github.io/research/threejs-layer-quiz/index.html, the canvas isn't correctly demonstrating the question.

## Investigation

Analyzed `/home/user/research/threejs-layer-quiz/index.html`

### Root Cause
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

## Solution
Resize the renderer after showing the canvas, using the actual dimensions once the canvas is visible.

## Changes Made

### 1. Added resize logic in `checkAnswer()` function (after line 995)
After showing the canvas and initializing Three.js, added code to resize the renderer with the actual canvas dimensions:

```javascript
// Resize renderer to match canvas dimensions (canvas is now visible)
const width = canvas.clientWidth;
const height = canvas.clientHeight;
if (width > 0 && height > 0) {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
```

### 2. Added window resize handler in `initThreeJS()` function (after line 761)
Added an event listener to handle window resizing:

```javascript
// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('canvas-container');
    if (canvas.classList.contains('show')) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width > 0 && height > 0) {
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }
});
```

## Testing
The canvas should now:
1. Display properly after answering a question
2. Show the Three.js visualization with correct dimensions
3. Adapt to window resizing
