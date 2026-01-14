# Reader v2

An enhanced minimalist reading application with professional typography based on TODS (Typography and OpenType Default Stylesheet) principles.

## What's New in v2

This version incorporates ideas from [TODS: Typography and OpenType Default Stylesheet](https://clagnut.com/blog/2433) by Richard Rutter, adding professional typographic features while maintaining the original's minimalist design philosophy.

## Quick Start

1. Open `index.html` in a web browser
2. Paste your text (supports rich text from Google Docs with formatting)
3. Click "Start Reading"
4. Navigate with arrow keys, clicks, or swipes

## Typography Improvements

### OpenType Features
- **Common ligatures**: Enabled for natural text flow (fi, fl, etc.)
- **Contextual alternates**: Enabled for proper glyph connections
- **Kerning**: Normal kerning for better letter spacing
- **Oldstyle figures**: Proportional oldstyle numerals in body text blend with lowercase
- **Lining figures**: Tabular lining numerals in headings and UI elements

### Text Rendering
- **Optical sizing**: Enabled for variable fonts (`font-optical-sizing: auto`)
- **Text size adjust**: Prevents unwanted text inflation on mobile rotation
- **Text wrap: pretty**: Reduces widows and orphans in paragraphs
- **Text wrap: balance**: Balanced line lengths for headings

### Hyphenation
- Enabled by default with smart limits:
  - Minimum word length: 7 characters
  - Minimum characters before break: 4
  - Minimum characters after break: 3
  - Maximum consecutive hyphenated lines: 2
- Disabled for headings and code blocks

### Dark Mode
- Automatic system preference detection
- Carefully adjusted colors to reduce "bloom" effect of inverted type
- Warmer dark background (#1a1a1a) for reduced eye strain

### Additional Features
- **Language-aware quotation marks**: Proper quotes for English, British English, French, and German
- **OpenType superscripts/subscripts**: Uses font's own glyphs when available
- **Code-specific typography**: Tabular lining figures, slashed zero, no ligatures
- **Small caps utility class**: For acronyms and stylistic text

## Design Philosophy

The best reading interface is one you forget about. This app is designed to disappear, letting you focus entirely on the text, now with professional-grade typography.

## Controls

| Action | Input |
|--------|-------|
| Next page | Right arrow, Down arrow, Space, Click right side |
| Previous page | Left arrow, Up arrow, Click left side |
| Exit reading | Escape key, x button |
| Show controls | Mouse move, Touch, Scroll |

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). All typography features are progressive enhancement - unsupported features are gracefully ignored. Requires JavaScript enabled.

## Technical Details

- Single HTML file
- No external dependencies
- Works offline
- No data collection or storage
- Content stays in browser memory only

## Source

Based on the original `reader` app, enhanced with ideas from:
- [TODS: Typography and OpenType Default Stylesheet](https://clagnut.com/blog/2433) by Richard Rutter
