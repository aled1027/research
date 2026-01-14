# Reader v2 Development Notes

## Source Material

Based on the original `reader` app enhanced with ideas from:
- https://clagnut.com/blog/2433 - TODS: Typography and OpenType Default Stylesheet

## Key Improvements from TODS

### Text Sizing & Adjustment
- `text-size-adjust: none` - prevents font inflation during device rotation
- `font-optical-sizing: auto` - enables optical sizing for variable fonts

### Line Height Strategy
- Body text: `line-height: 1.5` for legibility (vs 1.55 in v1)
- Headings: `line-height: 1.1` for tighter spacing

### Text Wrapping
- `text-wrap: pretty` - reduces widows/orphans in paragraphs
- `text-wrap: balance` - for headings and centered text

### OpenType Features
- `font-variant-ligatures: common-ligatures contextual` - standard ligatures
- `font-kerning: normal` - proper kerning
- `font-variant-numeric: oldstyle-nums proportional-nums` - for prose
- `font-variant-numeric: lining-nums` - for headings
- `text-decoration-skip-ink: auto` - cleaner underlines

### Hyphenation (opted for auto with limits)
- `hyphens: auto` with `lang` attribute required
- `hyphenate-limit-chars: 7 4 3` - minimum word/before/after lengths
- `hyphenate-limit-lines: 2` - max consecutive hyphenated lines

### Language-Specific Quotation Marks
- English: `"..."` and `'...'`
- British: `'...'` and `"..."`
- French: `<<...>>` guillemets

### Dark Mode
- Implemented using `prefers-color-scheme: dark`
- Adjusted colors to reduce "bloom" effect of inverted type
- Slightly warmer dark background

### Superscripts/Subscripts
- `font-variant-position: sub/super` with @supports fallback

## Implementation Decisions

1. **Added System Font Stack with Fallbacks**: Used Georgia as primary but added `font-size-adjust` concept for fallbacks

2. **Progressive Enhancement**: All new CSS features degrade gracefully in older browsers

3. **Dark Mode**: Added automatic dark mode support based on system preference

4. **Hyphenation**: Enabled by default for better text justification (changed from v1 which disabled it)

5. **OpenType Features**: Added where supported by the font

6. **Text Wrapping**: Added `text-wrap: pretty` for paragraphs to reduce orphans

## Testing Notes

- Tested in modern browsers (features degrade gracefully)
- All TODS features are progressive enhancement - unsupported features are ignored
