# Voxel Space Telescope

An isometric, voxelized interpretation of the Space Telescope Triptych using Three.js.

## Overview

This project reimagines the original Space Telescope Triptych visualization using a cube-based (voxelized) aesthetic with an isometric camera view. All objects in the scene are constructed from individual cubes that move, pulse, and rotate independently, creating a dynamic, blocky cosmic landscape.

## Key Features

### 🎥 Isometric Camera
- Uses Three.js `OrthographicCamera` instead of perspective
- Maintains consistent object scale regardless of distance
- Positioned at 45° angle for classic isometric view
- Interactive OrbitControls for exploration

### 🟦 Voxelized Objects

#### Earth
- Constructed from approximately 1,000 cube instances
- Arranged in a hollow spherical shell
- Individual cubes pulse and wobble independently
- Outer glow layer with translucent cubes
- Slow rotation of entire planet

#### Satellites
- 6 satellites orbiting Earth
- Each satellite built from 9 cubes:
  - 3-cube main body (white/cyan)
  - 4-cube solar panels (pink/magenta)
  - 2-cube antenna (cyan)
- Follow elliptical orbital paths
- Individual cube wobble animations

#### Data Streams
- 6 cubic data streams connecting satellites to Earth
- 15 rotating cubes per stream (90 total)
- Flow along quadratic Bezier curves
- Scale pulsing based on position
- Additive blending for ethereal glow

#### Cosmic Formations
- 4 large floating cube formations
- 30 cubes per formation (120 total)
- Orbit around formation centers
- Independent pulse and rotation
- Various cosmic colors

#### Starfield
- 500 cube "stars" instead of point particles
- Varied sizes, colors, and rotations
- Subtle global rotation

## Technical Implementation

### Performance Optimization

The visualization uses **InstancedMesh** extensively for efficient rendering:

| Component | Technique | Instance Count |
|-----------|-----------|----------------|
| Stars | InstancedMesh | 500 |
| Earth | InstancedMesh | ~1,000 |
| Data Streams | InstancedMesh (6×) | 90 |
| Cosmic Formations | InstancedMesh (4×) | 120 |
| Satellites | Individual meshes | 54 (6×9) |

**Total cube instances: ~1,750+**

All instances share a single `BoxGeometry`, minimizing memory usage and draw calls.

### Animation System

Each cube has individual animation parameters:
- **Offset**: Phase shift for varied timing
- **Speed**: Individual animation rate
- **Base Position**: Original position for transformations
- **Index**: Reference in instanced mesh

Matrix updates happen per frame using Three.js `Object3D` as a dummy object, then transferring matrices to the InstancedMesh.

### No Post-Processing

Unlike many modern Three.js scenes, this implementation avoids post-processing effects. Instead:
- Additive blending on materials for glow
- Emissive materials for self-illumination
- Directional and ambient lighting for depth

## Code Structure

### Main Classes

```javascript
VoxelEarth
├── createGlowLayer()
└── update()

VoxelSatellite
├── constructor() // builds cube structure
└── update()

CubicDataStream
├── updateEndpoints()
└── update()

CosmicCubeFormation
└── update()
```

### Shared Resources
- `cubeGeometry`: Single BoxGeometry(1,1,1) used by all cubes
- `scene`: Main Three.js scene
- `camera`: OrthographicCamera with isometric positioning

## Color Palette

- **Earth**: Ocean blue (`0x2E86AB`)
- **Satellites**: White/gray (`0xEEEEEE`)
- **Solar Panels**: Pink/magenta (`0xFF6B9D`)
- **Antennas**: Cyan (`0x4ECDC4`)
- **Data Streams**: Rainbow (cyan, pink, gold, yellow, purple, mint)
- **Cosmic Formations**: Rainbow accent colors

## Usage

Simply open `index.html` in a modern web browser. The scene is self-contained with CDN dependencies.

### Controls
- **Left Mouse**: Rotate camera
- **Right Mouse**: Pan camera
- **Scroll**: Zoom in/out

## Design Decisions

### Why Isometric?

Isometric projection provides several benefits for a voxel aesthetic:
- Consistent scale across depth (no perspective distortion)
- Classic retro game feel
- Better visibility of cube structure
- Clearer spatial relationships

### Why InstancedMesh?

Rendering 1,700+ individual cubes efficiently requires instancing:
- Single draw call per InstancedMesh
- Shared geometry and material
- Individual matrix transformations
- GPU-accelerated rendering

### Why Cubes?

Cubes are the fundamental voxel primitive:
- Simple, recognizable form
- Easy to instance and transform
- Natural blocky aesthetic
- Strong visual contrast with smooth curves of original

## Comparisons to Original

| Aspect | Original | Voxel Version |
|--------|----------|---------------|
| Camera | Perspective | Orthographic (Isometric) |
| Earth | Smooth sphere | ~1,000 cubes |
| Satellites | Composite meshes | 9 cubes each |
| Data | Smooth particles | Rotating cubes |
| Flux | Nebula clouds | Cube formations |
| Stars | Point particles | Cube instances |
| Effects | Post-processing ready | Material-based |

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

Expected performance on modern hardware:
- **60 FPS** on desktop with dedicated GPU
- **30-60 FPS** on integrated graphics
- **Variable** on mobile (depends on device)

The InstancedMesh approach is highly optimized, but rendering 1,700+ animated cubes still requires decent GPU capabilities.

## Future Enhancements

Potential improvements:
- Shader-based cube animations (move logic to GPU)
- LOD system (reduce cubes when zoomed out)
- Custom cube vertex shader for more complex deformations
- Voxel chunking system for larger worlds
- Interactive elements (click satellites, etc.)

## Files

- `index.html` - Complete visualization (self-contained)
- `notes.md` - Development notes and implementation details
- `README.md` - This file

## License

This is a creative exploration project based on the Space Telescope Triptych concept.
