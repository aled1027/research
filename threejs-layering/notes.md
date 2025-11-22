# Development Notes - Three.js Layering Teaching Tool

## Project Goal
Create an interactive teaching tool for intermediate Three.js developers to understand:
- Depth testing and depth writing
- Transparency and alpha blending
- Render order
- Different material types and their behaviors

## Development Log

### Initial Setup
- Created project directory structure
- Starting research on Three.js rendering pipeline and material properties

### Research Findings

#### Depth Testing (depthTest & depthWrite)
- **depthTest**: Controls whether to test incoming fragment's depth against the depth buffer
  - When true, fragments are only rendered if they're closer than what's already rendered
  - Default: true
- **depthWrite**: Controls whether rendering updates the depth buffer
  - When false, object won't block objects behind it from rendering
  - Common pattern: Opaque objects with both true, transparent objects with depthTest=true, depthWrite=false
- **depthFunc**: Comparison function (LessEqualDepth, GreaterDepth, etc.)

#### Transparency & Alpha
- **transparent**: Must be true to enable alpha blending
- **opacity**: Value from 0.0 (fully transparent) to 1.0 (fully opaque)
- **alphaTest**: Fragments with alpha below this value are discarded (0.0 - 1.0)
  - Useful for textures with cutouts (like leaves)
- Best practice for transparent objects: transparent=true, depthTest=true, depthWrite=false

#### Blending Modes
- **NormalBlending**: Standard alpha blending
- **AdditiveBlending**: Colors add together (creates glow effects)
- **SubtractiveBlending**: Colors subtract
- **MultiplyBlending**: Colors multiply
- **CustomBlending**: Define custom blend equation
- Note: Opacity has limited effect with some blending modes (Multiply, Subtract)

#### Render Order
- **renderOrder**: Integer property on Object3D (default: 0)
- Higher values render after lower values
- Useful for controlling draw order of transparent objects
- Does not propagate to children automatically

#### Material Types
- **MeshBasicMaterial**: No lighting, fast, good for UI or simple colors
- **MeshStandardMaterial**: PBR-based, realistic lighting, metalness/roughness
- **ShaderMaterial**: Custom GLSL shaders, full control but more complex
- Performance: Basic > Standard; ShaderMaterial requires manual uniform updates

### Design Plan
Create interactive demo with:
1. Multiple overlapping objects (planes, spheres, boxes)
2. Each object has independent controls for all depth/transparency settings
3. Side panel with sliders and toggles
4. Real-time updates to visualize how settings interact
5. Examples demonstrating common use cases

### Implementation Details

#### Scene Setup
- Created three overlapping planes (red, green, blue) at different Z positions
- Red plane at z=1 (front), green at z=0 (middle), blue at z=-1 (back)
- Used PlaneGeometry with double-sided materials for visibility from all angles
- Added OrbitControls for interactive camera movement
- Included ambient + directional lighting for StandardMaterial demonstration

#### Material Types Implemented
1. **MeshBasicMaterial**: Default, no lighting calculations
2. **MeshStandardMaterial**: PBR-based with roughness/metalness
3. **ShaderMaterial**: Custom GLSL shader with gradient alpha effect

#### Custom Shader Features
- Vertex shader: Standard UV and position transformation
- Fragment shader: Creates radial gradient alpha effect from center
- Demonstrates manual opacity control via uniforms
- Shows how ShaderMaterial differs from built-in materials

#### Interactive Controls Per Object
- Material type selector (Basic/Standard/Shader)
- Opacity slider (0.0 - 1.0)
- Render order slider (-5 to +5)
- Blending mode selector (Normal/Additive/Subtractive/Multiply)
- Transparent checkbox
- depthTest checkbox
- depthWrite checkbox

#### Preset Scenarios
1. **Default**: Standard transparent setup (depthTest=true, depthWrite=false)
2. **Correct Transparency**: Proper back-to-front ordering with renderOrder
3. **Incorrect Order**: Shows artifacts when depthWrite=true on transparent objects
4. **Glow Effect**: AdditiveBlending with ShaderMaterial, depthTest=false
5. **No Depth Test**: All planes ignore depth, render in arbitrary order
6. **All Opaque**: Standard opaque rendering with proper depth testing

#### Key Learning Points Demonstrated
- **depthWrite=true on transparent objects** causes incorrect rendering (see "Incorrect Order" preset)
- **renderOrder** overrides spatial ordering (higher values render last)
- **AdditiveBlending** creates glow/light effects (colors add together)
- **depthTest=false** makes objects always visible regardless of position
- **ShaderMaterial** requires manual uniform updates but offers full control
- **MeshStandardMaterial** responds to lights, Basic doesn't

#### Technical Challenges Solved
- Material switching: Created material pools to avoid recreating materials
- Shader uniform updates: Different property access for ShaderMaterial
- UI updates: Synchronized sliders with actual values
- Preset system: Easy way to demonstrate common configurations

### Testing Notes
- Verified all blending modes work correctly
- Tested material switching doesn't break state
- Confirmed preset scenarios demonstrate key concepts
- Validated that depth settings interact as expected
- Ensured UI is responsive and updates in real-time

### UI/UX Improvements (Iteration 2)

#### Layout Redesign
- Moved controls from vertical sidebar to horizontal bottom panel (400px height)
- Changed from stacked sections to 3-column grid layout
- All three planes' controls now visible simultaneously without scrolling
- Optimized for laptop screens (MacBook Pro 13"-15")

#### Enhanced Documentation
- Added comprehensive help modal with detailed explanations of all settings
- Each setting includes:
  - What it does
  - When to use it
  - Common mistakes and solutions
  - Recommended configurations
- Modal accessible via "Help & Settings Info" button in header

#### Improved Preset System
- Changed from grid buttons to dropdown menu with descriptions
- Each preset now shows:
  - Title with visual indicators (✓/✗)
  - Short description of what it demonstrates
- Presets include explanations in their names:
  - "✓ Correct Transparency" - shows proper configuration
  - "✗ Wrong Order (Common Mistake)" - demonstrates common error
  - Clear categorization of what each preset teaches

#### Visual Improvements
- Color-coded plane headers (🔴/🟢/🔵) with z-position labels
- Inline value displays for sliders (opacity, render order)
- Compact checkbox layout (2-column grid)
- Cleaner control spacing for better readability
- Material type options include hints (e.g., "Basic (no lighting)")

#### Accessibility & Usability
- All controls visible at once - no need to scroll through sections
- Larger canvas area (60% of screen vs 70% of width)
- Clear visual hierarchy with header, grid layout
- Quick access to presets and help from header
- Info box updated with tips about using presets

### Key Advantages of New Layout
1. **Better for teaching**: Students can see all settings and compare them side-by-side
2. **Laptop-friendly**: Optimized for 13"-15" screens common in education
3. **Less cognitive load**: No scrolling needed to see current state
4. **Faster experimentation**: All controls within reach
5. **Better onboarding**: Help modal provides comprehensive guide

### Bug Fixes (Iteration 2.1)

#### Canvas Overlap Issue
- **Problem**: Canvas was rendering into the controls panel area
- **Root cause**: Renderer and camera were using full window height instead of accounting for 400px controls
- **Fix applied**:
  - Added `overflow: hidden` to canvas container
  - Added CSS rules to constrain canvas element dimensions
  - Fixed initial renderer setup to use `window.innerHeight - 400px`
  - Fixed resize handler to dynamically calculate canvas height
  - Corrected camera aspect ratio calculation to use canvas height
- **Result**: Canvas now properly stays above controls with no overlap
