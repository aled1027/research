# Three.js Quiz Canvas Display Fix

## Problem
The Three.js layering quiz canvas was not displaying correctly after answering questions. The visualization would remain blank even though the canvas container was shown.

## Root Cause
The canvas container started with `display: none` in CSS. When the Three.js renderer was initialized, it retrieved the canvas dimensions while hidden, resulting in `clientWidth` and `clientHeight` both being 0. The renderer was then created with 0x0 dimensions, which persisted even after the canvas was shown.

## Solution
Two changes were made to `/home/user/research/threejs-layer-quiz/index.html`:

### 1. Resize Renderer After Canvas Becomes Visible
In the `checkAnswer()` function, after showing the canvas and initializing Three.js, we now resize the renderer with the actual canvas dimensions:

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

Location: After line 995 in the `checkAnswer()` function

### 2. Handle Window Resizing
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
