# Three.js Toon Material Explorer

An interactive educational demonstration exploring Three.js `MeshToonMaterial` properties, designed to help students master cel-shading and cartoon rendering techniques.

## Overview

This demo provides a hands-on learning experience for understanding how toon (cel-shading) materials work in Three.js. Students can experiment with gradient maps, material properties, and lighting to create everything from soft pastels to bold, high-contrast cartoon styles.

## Features

### Interactive Controls

**Shape & Gradient**
- 5 different 3D objects (Torus Knot, Sphere, Torus, Cube, Dodecahedron)
- Gradient map selection (2, 3, 5, 10 steps, or smooth)
- Flat shading toggle for low-poly aesthetic
- Auto-rotate toggle

**Colors & Material**
- Base color picker for primary color selection
- Roughness slider (0.0 = glossy, 1.0 = matte)
- Metalness slider (0.0 = non-metallic, 1.0 = fully metallic)
- Emissive color and intensity for glow effects

**Lighting**
- Ambient light intensity control
- Directional light intensity control
- Light color picker
- Background color customization

### 9 Educational Presets

1. **Classic Toon** - Traditional 3-step cel-shading, perfect starting point
2. **Pastel Dream** - Soft, desaturated colors with gentle gradients
3. **Vibrant Bold** - High saturation with sharp 2-step transitions
4. **Metallic Toon** - Demonstrates high metalness on toon materials
5. **Rough Matte** - Shows fully rough, non-reflective surfaces
6. **Emissive Glow** - Self-illuminating effect for sci-fi looks
7. **Subtle Pastel** - Very soft 10-step gradient for minimal contrast
8. **High Contrast** - Dramatic 2-step shading with strong lighting
9. **Smooth Gradient** - No gradient map to show standard PBR shading

## Key Learning Concepts

### Gradient Maps (Toon Steps)

The gradient map is the defining feature of toon materials. It discretizes lighting into distinct bands:

- **2 Steps**: Hard comic book style with just light/shadow division
- **3 Steps**: Classic anime cel-shading (highlight, midtone, shadow)
- **5+ Steps**: Softer toon look with more gradual transitions
- **None**: Removes toon effect entirely, creating smooth PBR shading

### Creating Pastel Effects

To achieve soft, pastel aesthetics:
- Use desaturated colors (light pinks, blues, lavenders)
- Increase ambient light intensity (0.7-1.0)
- Use 5+ step gradient maps
- Add subtle emissive glow
- Use lighter background colors

### Creating Vibrant/Bold Effects

For punchy, high-contrast cartoon looks:
- Use fully saturated colors (pure RGB values)
- Use 2-3 step gradient maps for hard edges
- Higher directional light (1.5-2.5)
- Lower ambient light for more contrast
- Dark backgrounds for maximum pop

### Material Properties

**Roughness**
- Controls surface smoothness and specular highlights
- 0.0 = mirror-like glossy surface
- 1.0 = completely matte surface
- Works with toon shading to create varied surface types

**Metalness**
- Controls metallic appearance and reflectivity
- 0.0 = dielectric materials (plastic, rubber, wood)
- 1.0 = fully metallic (reflects environment)
- Interesting when combined with toon gradient maps

**Emissive**
- Makes objects appear to glow from within
- Great for magical effects, screens, neon signs
- Intensity controls strength of self-illumination

### Flat Shading

When enabled, each polygon face receives uniform color rather than smooth interpolation. Creates a faceted, low-poly art style that pairs well with toon materials.

## Technical Implementation

### Gradient Texture Generation

The demo dynamically generates gradient textures using Three.js `DataTexture`:

```javascript
function createGradientTexture(steps) {
    const colors = new Uint8Array(steps * 3);
    for (let i = 0; i < steps; i++) {
        const value = Math.floor((i / (steps - 1)) * 255);
        colors[i * 3] = value;     // R
        colors[i * 3 + 1] = value; // G
        colors[i * 3 + 2] = value; // B
    }
    const texture = new THREE.DataTexture(colors, steps, 1, THREE.RGBFormat);
    return texture;
}
```

This creates grayscale gradients that Three.js uses to quantize lighting calculations into discrete steps.

### MeshToonMaterial Properties

```javascript
const material = new THREE.MeshToonMaterial({
    color: 0xff6b9d,           // Base color
    gradientMap: texture,       // Toon gradient texture
    roughness: 0.8,            // Surface roughness
    metalness: 0.0,            // Metallic appearance
    emissive: 0x000000,        // Emissive color
    emissiveIntensity: 0.0,    // Emissive strength
    flatShading: false         // Flat vs smooth shading
});
```

## Educational Use Cases

### For Students

1. **Experiment with presets** - Load different presets to see dramatic variations
2. **Gradient exploration** - Change gradient steps to understand cel-shading
3. **Color theory** - Practice creating color schemes (pastel, vibrant, monochrome)
4. **Lighting impact** - Adjust lights to see how they affect toon appearance
5. **Material combinations** - Try unusual combinations (metallic + toon, rough + glowing)

### For Instructors

- Demonstrate non-photorealistic rendering (NPR) concepts
- Teach the difference between PBR and stylized rendering
- Show how lighting affects cartoon aesthetics
- Illustrate material property interactions
- Compare toon materials to standard materials (use smooth gradient preset)

## Browser Compatibility

Works in all modern browsers supporting WebGL. Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Usage

Simply open `index.html` in a web browser. No build process or server required.

## Technical Stack

- Three.js r160
- Vanilla JavaScript (ES6 modules)
- HTML5/CSS3
- WebGL

## Tips for Exploration

1. Start with **Classic Toon** preset to understand the baseline
2. Compare **2 Steps** vs **10 Steps** gradient maps
3. Toggle between objects to see how geometry affects shading
4. Try **Metallic Toon** to see unconventional material combinations
5. Experiment with extreme values (full roughness, full metalness)
6. Use **Flat Shading** with 2-step gradients for retro aesthetics
7. Compare **Smooth Gradient** (no gradient map) to other presets

## Learning Outcomes

After exploring this demo, students should understand:

- How gradient maps create cel-shading effects
- The relationship between lighting and toon appearance
- How to create pastel vs vibrant color schemes
- Material property effects on toon materials
- When to use toon materials in 3D projects
- The difference between NPR and PBR rendering

## Future Enhancements (Ideas)

- Outline/rim lighting effects
- Custom gradient map uploads
- Multiple objects with different materials
- Animation presets
- Texture support
- Export settings as JSON

## Credits

Created as an educational resource for learning Three.js toon materials and non-photorealistic rendering techniques.
