# Reader App Development Notes

## Goal
Build a reader app optimized for long-form prose/fiction reading, based on human-centered UX research.

## Key Design Decisions

### Input
- Rich text paste area that preserves formatting from Google Docs (bold, italic, etc.)
- Using contenteditable div to capture HTML formatting on paste

### Reading Experience Design Principles Applied

1. **Typography**: Georgia serif font for familiarity and readability
2. **Line Length**: Max-width constraint for 55-75 characters per line
3. **Line Spacing**: 1.5 line-height for breathing room
4. **Margins**: Generous margins, especially on wide screens
5. **Contrast**: Off-white background (#fefdfb), dark gray text (#2d2d2d)
6. **Text Flow**: Left-aligned, no hyphenation, no justified text
7. **Minimal UI**: Controls hidden by default, appear on interaction
8. **Navigation**: Pagination with keyboard/click navigation
9. **Progress**: Subtle page indicator at bottom
10. **Stability**: No animations or layout shifts during reading

## Implementation Notes

- Single HTML file for simplicity
- Pure CSS/JS, no frameworks (reduces complexity and load time)
- Pagination calculated based on viewport height
- Preserves rich text by using innerHTML from paste events

## What I Learned

1. **contenteditable + paste**: Using `contenteditable="true"` on a div allows pasting rich HTML content directly, preserving formatting from sources like Google Docs.

2. **Scroll-snap pagination**: CSS `scroll-snap-type: y mandatory` with `scroll-snap-align: start` creates smooth pagination without complex JavaScript calculations.

3. **Google Docs cleanup**: Google Docs adds many inline styles and wrapper spans. The cleanup function strips unnecessary attributes while preserving semantic formatting (bold/italic).

4. **Dynamic pagination**: Calculating page breaks requires measuring content in the DOM. The approach here adds elements one by one and checks for overflow.

5. **Control visibility**: Using CSS transitions on opacity with JavaScript timeouts creates a smooth show/hide effect for controls without jarring transitions.

6. **Click zones**: Dividing the screen into thirds (left, center, right) for navigation mimics e-reader patterns and feels intuitive.

## Files Created

- `index.html` - Complete reader application
- `notes.md` - Development notes (this file)
- `README.md` - User documentation
