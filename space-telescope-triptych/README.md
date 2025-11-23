# Space Telescope Triptych - Three.js Simulation

A three.js animated simulation inspired by a space telescope triptych, depicting the continuous process of satellites collecting emission data from celestial bodies and transmitting it to Earth.

![Space Telescope Simulation](https://img.shields.io/badge/three.js-v0.160-blue)
![Status](https://img.shields.io/badge/status-complete-success)

## Overview

This project creates an interactive 3D visualization that represents the workflow of a space telescope organization:
1. **Space**: Celestial bodies orbit and emit data
2. **Satellites**: Multiple satellites orbit through space, collecting emission data
3. **Data Transmission**: Visual particle streams show data flowing from satellites to Earth

The simulation runs in a continuous animation loop, providing a mesmerizing view of the data collection and transmission process.

## Features

### Visual Elements

#### Celestial Bodies
- 6 unique celestial bodies with vibrant colors (yellow, pink, cyan, white, dark)
- Each body has a glowing aura for visual emphasis
- Bodies orbit at different speeds and heights around a central point
- Continuous rotation and vertical oscillation for dynamic movement

#### Satellites
- 6 satellites orbiting through the scene
- Detailed design with cylindrical body, solar panels, and antenna
- Each satellite follows its own orbital path
- Automatically oriented to maintain realistic positioning

#### Data Collection & Transmission
- **Emission Particles**: Pink particles orbit around celestial bodies, representing emitted data
- **Data Streams**: Colorful particle streams flow from satellites to Earth
- Uses bezier curves for smooth, curved transmission paths
- Multiple colors (cyan, pink, yellow) for visual variety
- Particles fade in and out as they travel

#### Earth
- Blue planet with cyan glow effect
- Positioned as the data receiver
- Rotates slowly to show dynamic nature

#### Environment
- 2000-star background with varied colors
- Atmospheric fog for depth perception
- Dynamic lighting with multiple point lights

### Interaction
- **Mouse Controls**: Click and drag to rotate the view
- **Zoom**: Scroll to zoom in/out
- **Pan**: Right-click and drag to pan the camera
- **Smooth Damping**: Camera movements are smoothed for better user experience

## Technical Implementation

### Technology Stack
- **Three.js v0.160**: 3D graphics library
- **OrbitControls**: Camera control system
- Pure HTML/CSS/JavaScript (no build tools required)

### Key Components

1. **Scene Setup**
   - Perspective camera with fog effect
   - WebGL renderer with shadow mapping
   - Responsive design that adapts to window size

2. **Animation System**
   - RequestAnimationFrame loop for smooth 60fps animation
   - Independent orbital mechanics for each object
   - Particle systems for data visualization

3. **Visual Effects**
   - Glow effects using double-mesh technique
   - Transparency and opacity animations
   - Curved particle paths using quadratic bezier curves
   - Dynamic lighting with emissive materials

### Color Palette

Inspired by the original triptych artwork:
- **Primary**: Yellow/Gold (#FFD700, #F4E04D)
- **Secondary**: Cyan/Teal (#4ECDC4)
- **Accent**: Pink (#FF6B9D)
- **Supporting**: Blue (#2E86AB), Dark (#2C3E50), White (#E8F1F2)

## How to Run

1. **Simple HTTP Server**:
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (with http-server)
   npx http-server
   ```

2. **Direct Browser** (may have CORS issues with some browsers):
   ```bash
   # Just open the file
   open index.html
   ```

3. Visit `http://localhost:8000` in your browser

## Performance Notes

- Optimized for modern browsers with WebGL support
- Particle counts are balanced for performance:
  - 20 particles per data stream (6 streams = 120 total)
  - 5 emission particles per celestial body (6 bodies = 30 total)
  - 2000 background stars
- Runs at 60fps on most modern hardware

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari 15+
- Any modern browser with WebGL 2.0 support

## Design Inspiration

The simulation draws inspiration from a triptych depicting:
- **Left Panel**: Abstract representation of space with orbiting celestial bodies
- **Middle Panel**: Satellites collecting and transmitting emissions
- **Right Panel**: Data arriving on Earth (represented by the data streams reaching Earth in this simulation)

Rather than directly replicating the artistic style, the simulation captures the essence and color palette while adapting it to 3D interactive visualization.

## Project Structure

```
space-telescope-triptych/
├── index.html          # Main simulation file (standalone)
├── notes.md           # Development notes and implementation details
└── README.md          # This file
```

## Future Enhancements (Ideas)

- Add more variety in celestial body types (gas giants, rocky planets, etc.)
- Implement different data collection modes
- Add UI controls for adjusting satellite count, orbit speeds
- Sound effects for data transmission
- VR/AR support
- Real-time data visualization from actual space telescope data

## License

This is a creative educational project created for research and demonstration purposes.

## Author

Created as part of space telescope visualization research.
