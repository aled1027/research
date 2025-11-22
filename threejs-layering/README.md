# Three.js Layering & Materials Teaching Tool

An interactive educational tool for intermediate Three.js developers to understand depth testing, transparency, render order, blending modes, and material types.

## Overview

This demo visualizes how Three.js handles rendering order, transparency, and depth testing through three overlapping colored planes. By adjusting various rendering parameters in real-time, you can see exactly how different settings interact and affect the final rendered output.

## Key Concepts Explained

### 1. Depth Testing (`depthTest`)

The depth test determines whether a fragment (pixel) should be rendered based on its distance from the camera compared to what's already in the depth buffer.

- **`depthTest: true`** (default): Only render fragments that are closer than existing fragments
- **`depthTest: false`**: Render the fragment regardless of depth, potentially appearing "on top" of closer objects

**When to use:**
- `true`: Most objects, especially opaque ones
- `false`: UI elements, always-visible overlays, special effects like halos

### 2. Depth Writing (`depthWrite`)

Controls whether rendering a fragment updates the depth buffer value at that pixel.

- **`depthWrite: true`** (default): Write depth value, blocking objects behind it
- **`depthWrite: false`**: Don't update depth buffer, allowing objects behind to potentially render

**Critical for transparency:**
Transparent objects should typically use `depthWrite: false` to avoid blocking other transparent objects behind them, which would prevent proper blending.

**Common pattern:**
```javascript
// Opaque objects
material.depthTest = true;
material.depthWrite = true;

// Transparent objects
material.transparent = true;
material.depthTest = true;
material.depthWrite = false;
```

### 3. Render Order

The `renderOrder` property on `Object3D` controls the drawing sequence. Objects are rendered in ascending order (lower values first, higher values last).

- **Default:** `0`
- **Range:** Can be any integer (negative or positive)
- **Use case:** Manually control which transparent objects render in which order

**Important:** For transparent objects to blend correctly, they generally need to be rendered back-to-front. Render order helps achieve this when spatial sorting isn't sufficient.

### 4. Transparency & Opacity

- **`transparent`**: Boolean flag that must be `true` to enable alpha blending
- **`opacity`**: Float from 0.0 (fully transparent) to 1.0 (fully opaque)
- **`alphaTest`**: Threshold value; fragments with alpha below this are discarded (useful for texture cutouts)

### 5. Blending Modes

Blending modes determine how the source color (the fragment being rendered) combines with the destination color (what's already in the framebuffer).

#### Normal Blending (Default)
Standard alpha blending: `result = src * alpha + dst * (1 - alpha)`

**Use:** Standard transparent objects (glass, water, UI)

#### Additive Blending
Colors add together: `result = src + dst`

**Use:** Glow effects, light beams, particles, fire
**Note:** Makes colors brighter; overlapping areas become very bright

#### Subtractive Blending
Destination color is subtracted from source: `result = dst - src`

**Use:** Rare; special darkening effects

#### Multiply Blending
Colors multiply: `result = src * dst`

**Use:** Shadows, darkening effects, color filters
**Note:** Always darkens (multiplying by values < 1)

### 6. Material Types

#### MeshBasicMaterial
- **Pros:** Fastest, simple, predictable
- **Cons:** No lighting response
- **Use:** UI elements, unlit objects, debugging

#### MeshStandardMaterial
- **Pros:** Physically accurate, responds to lights, realistic
- **Cons:** More expensive than Basic
- **Use:** Most 3D objects in lit scenes
- **Properties:** `metalness`, `roughness` for PBR workflow

#### ShaderMaterial
- **Pros:** Complete control, custom effects
- **Cons:** Must write GLSL, manual uniform updates, most complex
- **Use:** Special effects, custom rendering techniques
- **Note:** Requires understanding of shader programming

## Using the Demo

### Controls Panel

The right sidebar contains controls for three overlapping planes (red, green, blue). Each plane has:

1. **Material Type**: Switch between Basic, Standard, and custom Shader materials
2. **Opacity**: Control transparency level (0.0 - 1.0)
3. **Render Order**: Control drawing order (-5 to +5, higher renders last)
4. **Blending Mode**: Choose how colors combine
5. **Transparent**: Enable/disable alpha blending
6. **Depth Test**: Enable/disable depth testing
7. **Depth Write**: Enable/disable depth buffer writing

### Preset Scenarios

Click these buttons to load pre-configured scenarios that demonstrate important concepts:

#### Default
Standard setup with semi-transparent planes. All use `depthTest=true`, `depthWrite=false`, which is correct for transparency but may show ordering issues.

#### Correct Transparency
Demonstrates proper transparent rendering with renderOrder set to ensure back-to-front ordering:
- Blue (back): renderOrder = 0
- Green (middle): renderOrder = 1
- Red (front): renderOrder = 2

#### Wrong Order
Shows what happens when `depthWrite=true` on transparent objects. You'll see artifacts where the front plane incorrectly blocks planes behind it from blending properly.

#### Glow Effect
Uses AdditiveBlending with ShaderMaterial and no depth testing to create overlapping glow effects. Colors add together where planes overlap.

#### No Depth Test
All planes ignore depth testing (`depthTest=false`), so they render in an arbitrary order regardless of their Z position. Demonstrates how depth testing is crucial for 3D scenes.

#### All Opaque
Fully opaque StandardMaterial objects with proper depth testing. This is the "normal" case for solid objects - shows how lighting affects StandardMaterial.

## Common Issues & Solutions

### Problem: Transparent objects look wrong, with "holes" or incorrect ordering

**Cause:** `depthWrite=true` on transparent objects

**Solution:** Set `depthWrite=false` on all transparent materials

### Problem: Transparent objects render in wrong order

**Cause:** Three.js automatically sorts transparent objects, but complex scenes may need help

**Solution:**
1. Use `renderOrder` to manually control drawing order
2. Ensure back-to-front rendering (distant objects rendered first)
3. Consider splitting complex transparent objects

### Problem: Blending mode doesn't affect opacity

**Cause:** Some blending modes (Multiply, Subtract) don't respect the opacity parameter the same way

**Solution:**
- Use NormalBlending or AdditiveBlending for opacity-based effects
- Or manually adjust color values for other blending modes

### Problem: ShaderMaterial doesn't respond to opacity changes

**Cause:** Custom shaders need manual uniform updates

**Solution:** Update `uniforms.opacity.value` when changing opacity

## Learning Exercises

Try these experiments to deepen understanding:

1. **Exercise 1: Z-Fighting**
   - Set all planes to the same Z position (e.g., 0)
   - Turn on `depthTest` and `depthWrite` for all
   - Observe flickering/artifacts (Z-fighting)
   - Fix by adjusting positions or render order

2. **Exercise 2: Transparent Sorting**
   - Load "Correct Transparency" preset
   - Rotate the camera (click and drag)
   - Notice how the ordering remains correct
   - Now try reversing the renderOrder values - see the problem?

3. **Exercise 3: Blending Modes**
   - Set all planes to AdditiveBlending
   - Adjust opacity - see how overlaps get very bright
   - Try MultiplyBlending - notice darkening effect
   - Mix different blending modes on different planes

4. **Exercise 4: Material Differences**
   - Load "All Opaque" preset
   - Switch between Basic, Standard, and Shader materials
   - Rotate view to see how Standard reacts to lighting
   - Basic stays the same from all angles

5. **Exercise 5: Depth Override**
   - Set red plane (front) to `depthTest=false`
   - Even though it's in front, it always renders on top
   - Useful for understanding UI overlays

## Technical Implementation

### Scene Structure
- Three PlaneGeometry meshes positioned at z = 1, 0, -1
- OrbitControls for camera manipulation
- Ambient + directional lighting for StandardMaterial demonstration
- Materials pre-created and cached to avoid recreation overhead

### Custom Shader
The ShaderMaterial uses a simple vertex shader for UV mapping and a fragment shader that creates a radial gradient alpha effect:

```glsl
// Fragment shader creates alpha gradient from center
float alpha = opacity * (1.0 - length(vUv - 0.5) * 0.5);
gl_FragColor = vec4(color, alpha);
```

This demonstrates how ShaderMaterial gives complete control over rendering but requires GLSL knowledge.

## Performance Considerations

1. **Material Choice:**
   - Basic: Fastest (no lighting calculations)
   - Standard: Moderate (PBR lighting)
   - Shader: Varies (depends on shader complexity)

2. **Transparency:**
   - Transparent objects are more expensive (require sorting and blending)
   - Minimize transparent object count when possible
   - Use `alphaTest` instead of transparency for binary cutouts (faster)

3. **Render Order:**
   - Setting renderOrder has minimal performance impact
   - Sorting transparent objects has some overhead
   - Consider using layers for complex scenes

## References & Resources

This tool was built using research from:

- [Stack Overflow: depthWrite vs depthTest for transparent materials](https://stackoverflow.com/questions/37647853/three-js-depthwrite-vs-depthtest-for-transparent-canvas-texture-map-on-three-p)
- [DEV Community: All parameters about depth test](https://dev.to/handsometan/threejs-all-parameters-about-depth-test-2b6e)
- [Three.js forum discussions on transparency](https://discourse.threejs.org/t/transparency-glitching-and-depthwrite-and-depthtest-dont-seem-to-help/36384)
- [Understanding Material Types in Three.js](https://moldstud.com/articles/p-understanding-material-types-in-threejs-a-beginners-guide-to-the-basics)
- [Medium: Comparing the most common materials](https://medium.com/geekculture/threejs-tutorial-comparing-the-most-common-materials-424eef8942a4)
- [Stack Overflow: Blending modes and opacity](https://stackoverflow.com/questions/54724339/how-to-have-opacity-affect-materials-using-blending-modes-other-than-just-addit)

## How to Run

Simply open `index.html` in a modern web browser. No build process or server required - the demo uses CDN-hosted Three.js modules.

Recommended browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Conclusion

Understanding depth testing, transparency, and render order is crucial for creating complex 3D scenes in Three.js. The most important takeaways:

1. **Transparent objects need `depthWrite=false`** to blend correctly
2. **Render order matters** for transparent objects (back-to-front)
3. **Different blending modes** create different effects (additive for glow, normal for standard transparency)
4. **Material choice** affects both appearance and performance
5. **Depth testing** is what makes 3D scenes look 3D

Experiment with the controls, try the presets, and build an intuition for how these settings interact. This knowledge is fundamental to advanced Three.js development.
