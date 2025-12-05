# Rolodex Research Notes

## Project Goal
Create 3-10 different rolodex component variations using HTML, CSS, JS, and GSAP, exploring various interaction patterns and animation effects.

## Research Notes

### What is a Rolodex?
A rolodex is a rotating file device used to store business contact cards. The digital equivalent creates a similar scrolling/rotating experience where items flip or rotate as you navigate through them.

### Key Characteristics:
- Cards that rotate or flip
- Full-screen items (100vh each)
- Smooth transitions between items
- 3D perspective effects
- Tactile, physical-feeling interactions

### GSAP Animation Opportunities:
1. **Entering viewport**: Scale, fade, rotate in
2. **In view**: Active state, parallax, subtle animations
3. **Leaving viewport**: Scale out, fade, rotate away

## Variations to Explore:

### 1. Classic Rotating Cards
Traditional rolodex with cards rotating on a horizontal axis, creating a cylinder effect.

### 2. 3D Flip Carousel
Cards flip like pages in a book, with depth and perspective.

### 3. Stacked Cards with Perspective
Cards stack on top of each other and slide away with depth effects.

### 4. Circular Scroll Wheel
Items arranged in a circle that rotates as you scroll.

### 5. Split-Flap Display
Inspired by airport/train displays, cards flip from top to bottom.

## Implementation Plan:
- Use ScrollTrigger for scroll-based animations
- Apply 3D transforms for depth
- Smooth easing functions for natural motion
- Color-coded cards for visual distinction
- Responsive design considerations

## Development Log:

### Session Start
- Created directory structure
- Planning 5 distinct rolodex variations
- Each will demonstrate different GSAP techniques

### Implementation Complete

#### Variation 1: Classic Rotating Cards
**Key Learnings:**
- Used `rotateX` for horizontal axis rotation (90° to 0° to -90°)
- Perspective of 1500px works well for card-based layouts
- Scrub value of 1 provides smooth scroll-tied animation
- Cards need `transform-style: preserve-3d` for depth
- Z-axis translation (-500 to 0 to -500) enhances depth perception
- Combined rotation with scale and opacity for dramatic effect

**Technical Details:**
- Enter: rotateX from 90° (below) to 0° (center)
- Active: Subtle rotateY (5°) for dynamic feel
- Leave: rotateX to -90° (above) with fade out
- Each card takes 100vh of scroll space

#### Variation 2: 3D Flip Carousel
**Key Learnings:**
- `rotateY` creates book-page flip effect
- Higher perspective (2000px) gives more pronounced depth
- Breaking animations into 4 phases creates more control:
  1. Enter (flip in from right)
  2. Active approach (floating + scale up)
  3. Active settle (return to normal)
  4. Leave (flip out to left)
- Progress bar adds user feedback for scroll position
- Icons add visual interest and break up text

**Technical Details:**
- Cards flip on Y-axis: 90° → 0° → -90°
- Active state includes y: -20px for floating effect
- Scale varies: 0.7 → 1.05 → 1 → 0.7
- Timing: 40vh enter, 20vh active, 10vh settle, 30vh leave

#### Variation 3: Stacked Cards with Perspective
**Key Learnings:**
- Z-index management crucial for stacking order
- Initial offset (scale 0.7 - index*0.05) creates depth queue
- Cards positioned behind with y-offset create stack illusion
- Gradient overlays add depth and polish
- Decorative blur circles enhance visual appeal
- Progress indicator on side is less intrusive

**Technical Details:**
- Initial state: scale 0.7-0.65, y: 100-250px, opacity 0.3
- Active state: scale 1.02, subtle rotation (rotateY: 3°, rotateZ: -1°)
- Leave: y: -100vh, scale 1.2, rotateX -15°
- Each card's z-index: totalCards - index

#### Variation 4: Circular Scroll Wheel
**Key Learnings:**
- Trigonometry essential: sin/cos for circular positioning
- Radius of 800px works well for viewport sizes
- Need to calculate angle per card: 360° / totalCards
- Scale and opacity based on distance from front (top center)
- Z-index must update dynamically based on position
- Continuous rotation achieved by: progress * 360 * totalCards

**Technical Details:**
- Position: x = sin(angle) * radius, y = -cos(angle) * radius
- Z-depth: z = cos(angle) * 400 - 400
- Scale calculation: 1 - (distanceFromTop * 0.4)
- Opacity: 1 - (distanceFromTop * 0.7)
- Cards rotate through full 360° per section

#### Variation 5: Split-Flap Display
**Key Learnings:**
- Split-flap requires two halves: top and bottom
- Top half has transform-origin: bottom
- Bottom half has transform-origin: top
- Content must be positioned absolutely and doubled in height
- Top content aligns to bottom, bottom content aligns to top
- Monospace font essential for mechanical aesthetic
- Sharp timing creates "snap" feel

**Technical Details:**
- Two `.flip-half` divs each containing full content
- Top flips: rotateX 0° → -2° (wobble) → 0° → -180° (flip away)
- Bottom half remains static (true to split-flap mechanism)
- Border between halves creates split line illusion
- Color gradients with darker bottom simulate shadow

## Key GSAP Techniques Used:

### ScrollTrigger Patterns:
1. **Standard scrub**: `scrub: 1` for smooth scroll-tied animation
2. **Multiple triggers**: Each card gets 3-4 ScrollTrigger animations
3. **Dynamic start/end**: Use functions for precise timing per card
4. **OnUpdate callbacks**: For progress bars and indicators
5. **OnEnter/OnEnterBack**: For state management and indicators

### Transform Combinations:
- **Depth**: rotateX + z-axis translation + scale
- **Page flip**: rotateY + scale + opacity
- **Stacking**: y translation + scale + opacity + z-index
- **Circular**: x/y from trig + rotateY + scale + opacity + z
- **Split-flap**: rotateX with transform-origin manipulation

### Best Practices Discovered:
1. Use fixed positioning for cards, spacer div for scroll height
2. Each card needs 100vh scroll space minimum
3. Perspective should be on container, not individual cards
4. `transform-style: preserve-3d` essential for nested 3D
5. `backface-visibility: hidden` prevents z-fighting
6. Color-coded gradients improve visual hierarchy
7. UI indicators (dots, progress bars) improve UX
8. Combine transforms in specific order: translate → rotate → scale

## Performance Considerations:
- GSAP's scrub handles animation efficiently
- Fixed positioning reduces reflows
- CSS transforms use GPU acceleration
- Each variation runs smoothly at 60fps
- No JavaScript loops during scroll (GSAP handles all)

## Design Patterns:
1. **Spacer Pattern**: Invisible div for scroll height
2. **Fixed Cards**: All cards positioned fixed, animated in place
3. **Phased Animation**: Enter → Active → Settle → Leave
4. **Dynamic Indicators**: Update UI based on scroll position
5. **Consistent Structure**: All variations share similar HTML patterns
