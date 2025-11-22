# Three.js Quiz Canvas Display Fix

## Problem
The Three.js layering quiz canvas was not displaying correctly after answering questions. The visualization would remain blank even though the canvas container was shown.

## Root Causes

### Issue #1: First Question - Zero Dimensions
The canvas container started with `display: none` in CSS. When the Three.js renderer was initialized, it retrieved the canvas dimensions while hidden, resulting in `clientWidth` and `clientHeight` both being 0. The renderer was then created with 0x0 dimensions, which persisted even after the canvas was shown.

### Issue #2: Second+ Questions - Detached Canvas
When moving to the next question, `renderQuestion()` replaces the entire quiz content HTML, creating a NEW `<div id="canvas-container"></div>`. However:
- The renderer object persists (so `initThreeJS()` isn't called again)
- The renderer's canvas element is still attached to the OLD container that was removed from the DOM
- The new canvas container is empty, so nothing renders

## Solution
Three changes were made to `/home/user/research/threejs-layer-quiz/index.html`:

### 1. Re-append Renderer Canvas to New Container
In the `checkAnswer()` function, if the renderer already exists, re-append its canvas to the new container:

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

Location: Lines 1006-1014 in the `checkAnswer()` function

### 2. Resize Renderer After Canvas Becomes Visible
In the `checkAnswer()` function, after showing the canvas, resize the renderer with the actual canvas dimensions:

```javascript
canvas.classList.add('show');

// Resize renderer to match canvas dimensions (canvas is now visible)
const width = canvas.clientWidth;
const height = canvas.clientHeight;
if (width > 0 && height > 0) {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
```

Location: Lines 1016-1025 in the `checkAnswer()` function

### 3. Handle Window Resizing
Added a resize event listener in `initThreeJS()` to handle window resizing:

```javascript
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

Location: After line 761 in the `initThreeJS()` function

## Result
- ✅ Canvas now displays the Three.js visualization correctly after answering questions
- ✅ Renderer dimensions match the visible canvas size
- ✅ Canvas adapts properly to window resizing
- ✅ Camera aspect ratio is correctly updated

## Files Modified
- `/home/user/research/threejs-layer-quiz/index.html` - Added renderer resize logic in two locations
