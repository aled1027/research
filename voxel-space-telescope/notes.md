# Voxel Space Telescope - Development Notes

## Goal
Create a voxelized/cubed version of the Space Telescope Triptych with:
- Isometric camera view
- All objects built from cubes/voxels
- Using instanced meshes for performance
- Cubes that move and animate

## Implementation Approach

### 1. Camera Setup
- Use OrthographicCamera instead of PerspectiveCamera
- Set isometric angle (45 degrees from horizontal)
- Disable perspective distortion

### 2. Voxel Objects
- **Earth**: Built from a sphere-like arrangement of cubes
- **Satellites**: Constructed from multiple cube primitives
- **Data Streams**: Particles represented as moving cubes
- **Cosmic Flux**: Voxelized nebula clouds and energy rings
- **Starfield**: Cube-based stars instead of points

### 3. Performance Optimization
- Use InstancedMesh for repeated cube geometry
- Single cube geometry shared across all instances
- Update instance matrices for animation

### 4. Animation Strategy
- Individual cube movements within larger structures
- Pulsing/expanding cube grids
- Rotating voxel formations
- Data cubes flowing along paths

## Development Log

### Initial Setup
- Created directory structure
- Reviewed original implementation
- Identified key elements to voxelize

### Implementation Details

#### Camera System
- Switched from PerspectiveCamera to OrthographicCamera
- Set isometric viewing angle (45° horizontal, elevated vertical)
- Camera positioned at distance of 120 units
- OrbitControls enabled for user interaction

#### Voxel Earth (VoxelEarth class)
- Built from ~800-1000 cube instances arranged in spherical shell
- Uses THREE.InstancedMesh for performance
- Each cube has individual animation:
  - Pulsing scale based on sine wave
  - Subtle position wobble
  - Individual rotation
- Outer glow layer with 80 translucent cubes
- Entire group rotates slowly

#### Voxel Satellites (VoxelSatellite class)
- Each satellite composed of ~9 individual cubes
- Cube arrangement forms recognizable satellite shape:
  - Main body (3 cubes)
  - Solar panels (4 cubes, colored pink)
  - Antenna (2 cubes, colored cyan)
- Individual cube wobble animation
- Orbital motion with elliptical paths
- 6 satellites total with varied orbit parameters

#### Cubic Data Streams (CubicDataStream class)
- Uses InstancedMesh with 15 cubes per stream
- Cubes flow along quadratic Bezier curve
- Individual cube animations:
  - Rotation on all axes
  - Scale pulsing based on path position
  - Additive blending for glow effect
- 6 streams total, one per satellite

#### Cosmic Formations (CosmicCubeFormation class)
- 4 large formations of floating cubes
- Each formation has 30 cubes
- Cubes orbit around formation center
- Individual pulse and rotation animations
- Different colors per formation

#### Starfield
- 500 cube instances instead of point particles
- Varied sizes and colors
- Random rotations for visual interest
- Slow global rotation

### Performance Optimizations
- Single shared cube geometry (THREE.BoxGeometry)
- Extensive use of InstancedMesh:
  - Stars: 500 instances
  - Earth cubes: ~1000 instances
  - Data streams: 90 instances (6 streams × 15 cubes)
  - Cosmic formations: 120 instances (4 formations × 30 cubes)
- Matrix updates only when needed
- No post-processing effects

### Challenges & Solutions
1. **Sphere voxelization**: Used distance checks to create hollow sphere shell
2. **Performance**: InstancedMesh reduced draw calls significantly
3. **Isometric feel**: OrthographicCamera with proper positioning
4. **Animation variety**: Individual offsets and speeds per cube instance

