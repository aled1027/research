# Reader App

A minimalist reading application designed for long-form prose and fiction, built on human-centered UX research principles.

## Quick Start

1. Open `index.html` in a web browser
2. Paste your text (supports rich text from Google Docs with formatting)
3. Click "Start Reading"
4. Navigate with arrow keys, clicks, or swipes

## Design Philosophy

The best reading interface is one you forget about. This app is designed to disappear, letting you focus entirely on the text.

## UX Principles Applied

### Typography & Layout
- **Font**: Georgia serif for familiarity and reduced cognitive load
- **Line Length**: 55-75 characters per line (optimal scan rhythm)
- **Line Height**: 1.55× font size (visual breathing room)
- **Margins**: Generous margins that scale with screen size
- **Alignment**: Left-aligned, no hyphenation (preserves prose rhythm)

### Color & Contrast
- **Background**: Off-white (#fefdfb) to reduce eye strain
- **Text**: Dark gray (#2d2d2d) for moderate contrast
- No harsh black-on-white

### Interaction Design
- **Minimal UI**: Controls hidden by default
- **Progressive Disclosure**: UI appears only on interaction (mouse move, touch, scroll)
- **Auto-hide**: Controls fade after 2 seconds of inactivity
- **Click Navigation**: Tap left third for previous, right third for next

### Navigation
- **Pagination**: Scroll-snap pagination for spatial memory
- **Keyboard**: Arrow keys, spacebar, and Escape
- **Progress**: Subtle "X of Y" indicator

### Stability
- No animations during reading
- No layout shifts
- Consistent page structure

## Controls

| Action | Input |
|--------|-------|
| Next page | Right arrow, Down arrow, Space, Click right side |
| Previous page | Left arrow, Up arrow, Click left side |
| Exit reading | Escape key, × button |
| Show controls | Mouse move, Touch, Scroll |

## Features

- **Rich Text Support**: Preserves bold, italic, headings, and other formatting from Google Docs
- **Responsive**: Adapts to any screen size
- **No Dependencies**: Pure HTML/CSS/JS, works offline
- **Repagination**: Content re-flows on window resize

## Technical Details

- Single HTML file (~400 lines)
- No external dependencies
- Works offline
- No data collection or storage
- Content stays in browser memory only

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled.
