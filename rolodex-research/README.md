# Rolodex Research: Interactive Scroll Components with GSAP

A comprehensive exploration of rolodex-style user interfaces, featuring five distinct variations that demonstrate different approaches to scroll-based 3D animations using GSAP (GreenSock Animation Platform).

## Overview

This research project investigates how the classic physical rolodex interaction pattern can be reimagined for modern web experiences. Each variation showcases different animation techniques, 3D transforms, and scroll-based interactions, with all items occupying full viewport height (100vh).

## Live Demo

Open `index.html` in a web browser to access the main menu, which provides links to all five variations.

## Variations

### 1. Classic Rotating Cards
**File:** `variation-1-classic.html`

A traditional rolodex interpretation with cards rotating on a horizontal axis, creating a cylindrical carousel effect.

**Key Features:**
- Cards rotate from below (90°) to center (0°) and up (-90°)
- 3D perspective with Z-axis depth translation
- Smooth scroll-tied animations with GSAP ScrollTrigger
- Visual scroll indicators with active state

**Animation Phases:**
1. **Entering** (0-50vh): Card rotates in from below with fade and scale
2. **Active** (25-75vh): Subtle Y-axis rotation for dynamic feel
3. **Leaving** (50-100vh): Card rotates up and away with fade

**Technical Highlights:**
- Perspective: 1500px
- Transform order: rotateX + Z-translation + scale
- Uses `transform-style: preserve-3d` for depth

### 2. 3D Flip Carousel
**File:** `variation-2-flip.html`

Cards flip like pages in a book, with pronounced depth and perspective creating an immersive reading experience.

**Key Features:**
- Book-page flip effect using Y-axis rotation
- Four-phase animation for fine control
- Floating effect during active state
- Progress bar for visual feedback
- Icon-enhanced content

**Animation Phases:**
1. **Enter** (0-40vh): Flip in from right side
2. **Active Approach** (40-60vh): Float up with scale increase
3. **Active Settle** (60-70vh): Return to neutral
4. **Leave** (70-100vh): Flip out to left side

**Technical Highlights:**
- Perspective: 2000px (higher for more pronounced depth)
- RotateY: 90° → 0° → -90°
- Scale variation: 0.7 → 1.05 → 1 → 0.7
- Y-translation: 0 → -20px → 0 for floating

### 3. Stacked Cards with Perspective
**File:** `variation-3-stacked.html`

Cards stack on top of each other with depth effects, sliding away to reveal the next layer beneath.

**Key Features:**
- Depth-based stacking with progressive scaling
- Cards emerge from behind and slide forward
- Gradient overlays for enhanced depth
- Decorative blur circles for visual polish
- Side-mounted progress indicator

**Animation Phases:**
1. **Enter** (0-40vh): Scale up from small background card
2. **Active** (40-60vh): Subtle pulse and rotation
3. **Settle** (50-60vh): Return to normal scale
4. **Leave** (60-100vh): Slide up and away off screen

**Technical Highlights:**
- Initial scale offset: 0.7 - (index × 0.05)
- Z-index management for proper layering
- Combined rotateY + rotateZ during active state
- Exit animation: y: -100vh with rotateX tilt

### 4. Circular Scroll Wheel
**File:** `variation-4-circular.html`

Items arranged in a circle that rotates as you scroll, mimicking a physical rotating file wheel.

**Key Features:**
- Circular positioning using trigonometry
- Continuous rotation through 360° per card
- Dynamic scale and opacity based on position
- Cards at front (top) are largest and brightest
- Rotating wheel indicator visualization

**Animation Phases:**
- Continuous smooth rotation throughout scroll
- Front card (top center) scales to 1.0, opacity 1.0
- Back cards scale to 0.6, opacity 0.3
- Subtle content pulse when card is centered

**Technical Highlights:**
- Position calculation: `x = sin(angle) × radius`, `y = -cos(angle) × radius`
- Radius: 800px for optimal viewport coverage
- Z-depth: `z = cos(angle) × 400 - 400`
- Scale: `1 - (distanceFromTop × 0.4)`
- Rotation: `progress × 360 × totalCards`

### 5. Split-Flap Display
**File:** `variation-5-splitflap.html`

Inspired by vintage airport and train station displays, cards flip from top to bottom with mechanical precision.

**Key Features:**
- Authentic split-flap mechanism
- Top half flips while bottom remains static
- Monospace typography for retro aesthetic
- Mechanical "snap" timing
- Status bar with card counter

**Animation Phases:**
1. **Enter** (0-30vh): Fade in and scale up
2. **Active Wobble** (40-60vh): Subtle back-and-forth tilt
3. **Leave Flip** (60-80vh): Top half flips to -180°
4. **Fade Out** (80-100vh): Entire card fades away

**Technical Highlights:**
- Two separate divs (`.flip-top`, `.flip-bottom`) with different transform origins
- Content doubled in height, positioned oppositely in each half
- Transform-origin: bottom (top half), top (bottom half)
- Border between halves creates split line illusion
- RotateX animation on top half only

## Technical Implementation

### GSAP ScrollTrigger Pattern

All variations use a consistent pattern:

```javascript
// Create spacer div for scroll height
const spacer = document.createElement('div');
spacer.style.height = `${cards.length * 100}vh`;
document.body.appendChild(spacer);

// Animate based on scroll position
gsap.to(element, {
    // transform properties
    scrollTrigger: {
        trigger: spacer,
        start: () => `${index * 100}vh top`,
        end: () => `${(index + 1) * 100}vh top`,
        scrub: 1, // Smooth scroll-tied animation
        onEnter: () => updateUI(),
        onEnterBack: () => updateUI()
    }
});
```

### Common Design Patterns

1. **Spacer Pattern**: Invisible div creates scrollable height
2. **Fixed Positioning**: All cards positioned fixed, animated in place
3. **Phased Animations**: Multiple ScrollTriggers per card for different animation phases
4. **Dynamic Timing**: Functions calculate start/end points based on card index
5. **UI Indicators**: Dots, progress bars, or counters show current position

### Transform Best Practices

Order matters for CSS transforms:
1. **Translate** (position)
2. **Rotate** (orientation)
3. **Scale** (size)

For 3D effects:
- Set `perspective` on container (not individual elements)
- Use `transform-style: preserve-3d` for nested 3D
- Apply `backface-visibility: hidden` to prevent z-fighting
- Combine rotations on different axes for complex motion

## Performance Considerations

- **GPU Acceleration**: CSS transforms leverage hardware acceleration
- **Efficient Scrubbing**: GSAP's scrub optimizes animation performance
- **Fixed Positioning**: Reduces browser reflows and repaints
- **No Scroll Loops**: GSAP handles all calculations, no manual scroll listeners
- **60fps Target**: All variations maintain smooth 60fps on modern browsers

## Key Learnings

### Animation Timing
- Each card should occupy at least 100vh of scroll space
- Break complex animations into 3-4 phases for better control
- Use 40-50% of space for entering, 20-30% active, 30-40% leaving
- Scrub value of 1 provides good balance between smoothness and responsiveness

### 3D Transforms
- Perspective of 1500-2000px works well for card layouts
- Combine rotation with scale and opacity for dramatic effects
- Z-axis translation enhances depth perception
- Multiple rotation axes (rotateX + rotateY) create complex motion

### User Experience
- Visual indicators (dots, progress bars) are essential
- Back links should be clearly visible
- Subtle animations during active state draw attention
- Color-coded gradients improve visual hierarchy
- Monospace fonts enhance mechanical/technical aesthetics

### Math & Trigonometry
- Sine/cosine essential for circular positioning
- Normalize angles to -180° to 180° range for consistent calculations
- Distance-based scaling creates natural depth
- Angle-based opacity simulates front/back visibility

## Browser Compatibility

- Modern browsers with CSS3 3D transform support
- GSAP 3.12.5+ required
- ScrollTrigger plugin required
- Tested on Chrome, Firefox, Safari, Edge

## File Structure

```
rolodex-research/
├── index.html                    # Main landing page
├── variation-1-classic.html      # Classic rotating cards
├── variation-2-flip.html         # 3D flip carousel
├── variation-3-stacked.html      # Stacked cards
├── variation-4-circular.html     # Circular scroll wheel
├── variation-5-splitflap.html    # Split-flap display
├── notes.md                      # Development notes and learnings
└── README.md                     # This file
```

## Usage

1. Open `index.html` in a web browser
2. Click on any variation to explore it
3. Scroll to see the rolodex effects in action
4. Use navigation dots/indicators to jump between cards
5. Click "Back" to return to the main menu

## Future Enhancements

Potential areas for further exploration:

1. **Mobile Optimization**: Touch gestures and responsive breakpoints
2. **Accessibility**: Keyboard navigation and screen reader support
3. **Performance**: Intersection Observer for lazy loading
4. **Variations**: Additional patterns (horizontal scroll, grid-based, etc.)
5. **Interactivity**: Click/drag to manually control animations
6. **Physics**: Spring animations and momentum-based scrolling
7. **Hybrid Approaches**: Combining multiple animation techniques
8. **Dynamic Content**: Loading content from APIs or JSON

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: 3D transforms, gradients, flexbox, animations
- **JavaScript (ES6+)**: Modern syntax and DOM manipulation
- **GSAP 3.12.5**: Animation engine
- **ScrollTrigger**: Scroll-based animation control

## Conclusion

This research demonstrates five distinct approaches to implementing rolodex-style interactions on the web. Each variation showcases different aspects of 3D transforms, scroll-based animations, and GSAP capabilities. The techniques explored here can be adapted for various use cases including:

- Product showcases and galleries
- Storytelling and presentations
- Portfolio and case study presentations
- Feature tours and onboarding flows
- Interactive documentation
- Marketing landing pages

The key to effective rolodex interactions is balancing visual impact with performance, ensuring smooth animations while maintaining clarity and usability.
