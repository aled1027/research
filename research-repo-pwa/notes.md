# PWA Implementation Notes

## Goal
Convert the research repository portfolio site into a Progressive Web App (PWA) that works on iPhone.

## Initial Analysis
- The repo has a main index.html file at the root
- It's a portfolio/gallery of research projects
- Currently just a static HTML page with inline CSS
- No existing PWA features

## PWA Requirements
1. **manifest.json** - App metadata, icons, display mode
2. **Service Worker** - Offline functionality, caching
3. **HTTPS** - Required for PWA (GitHub Pages provides this)
4. **Meta tags** - Including Apple-specific tags for iPhone
5. **Icons** - Various sizes for different devices

## iPhone-Specific Considerations
- Apple touch icons (apple-touch-icon)
- apple-mobile-web-app-capable meta tag
- Status bar styling (apple-mobile-web-app-status-bar-style)
- Splash screens (optional but nice to have)

## Implementation Steps
1. Create manifest.json
2. Create service worker (sw.js)
3. Update index.html with PWA meta tags
4. Create icons (using SVG/generated images)
5. Register service worker in index.html

## Progress
- [x] Created project folder
- [x] Created manifest.json
- [x] Created service worker
- [x] Updated index.html
- [x] Created icons
- [ ] Tested on iPhone (requires deployment)

## Implementation Details

### 1. manifest.json
Created at `/manifest.json` with:
- App name: "AI Research Projects"
- Short name: "AI Research"
- Theme color: #667eea (matching site gradient)
- Display mode: standalone (for app-like experience)
- Icons: 192x192 and 512x512 PNG files
- Start URL: /research/

### 2. Service Worker (sw.js)
Created at `/sw.js` with:
- Cache-first strategy for offline support
- Caches core files (index.html, manifest.json)
- Dynamic caching for visited pages
- Version-based cache management (ai-research-v1)
- Automatic cache cleanup on activation

### 3. Icon Generation
Created Python script `generate_icons.py` that:
- Generates PNG icons without external dependencies
- Creates 512x512, 192x192, and 180x180 (Apple) icons
- Uses theme color #667eea
- Pure Python implementation using struct and zlib

Generated files:
- `icon-512.png` - Standard PWA icon (512x512)
- `icon-192.png` - Standard PWA icon (192x192)
- `apple-touch-icon.png` - iOS home screen icon (180x180)

### 4. HTML Updates
Modified `/index.html` to include:

**PWA Meta Tags:**
- Manifest link
- Theme color meta tag

**iOS-Specific Meta Tags:**
- `apple-mobile-web-app-capable`: Enables full-screen mode
- `apple-mobile-web-app-status-bar-style`: Black translucent status bar
- `apple-mobile-web-app-title`: Short app title for iOS

**Icon Links:**
- Standard PWA icons (192x192, 512x512)
- Apple touch icon for iOS home screen

**Service Worker Registration:**
- Added script to register sw.js on page load
- Includes error handling and logging

## Testing Instructions

### On iPhone:
1. Visit the site in Safari: https://aled1027.github.io/research/
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. The app icon should appear on your home screen
6. Launch the app - it should open in standalone mode (no Safari UI)
7. Test offline: Turn on Airplane mode and try opening the app

### Expected Behavior:
- App opens without Safari browser chrome
- Purple/blue theme color in status bar
- Works offline after first visit
- App icon visible on home screen

## Technical Notes

### Path Considerations:
- All paths use `/research/` prefix for GitHub Pages deployment
- Service worker scope is set to `/research/`
- Manifest start_url is `/research/`

### Offline Strategy:
- Service worker uses cache-first approach
- Core files cached on install
- Additional pages cached on visit
- Network failures fall back to cached version

### Browser Compatibility:
- Service Workers: Supported in iOS Safari 11.3+
- Manifest: Limited support in Safari (uses meta tags instead)
- Add to Home Screen: Fully supported in iOS Safari

## Limitations & Future Improvements

### Current Limitations:
1. Icons are solid color (could add emoji or logo)
2. No custom splash screen for iOS
3. Basic caching strategy (could be more sophisticated)
4. No offline fallback page

### Potential Improvements:
1. Add custom app icon with logo/emoji
2. Create iOS splash screens for different device sizes
3. Implement more sophisticated caching (network-first for certain routes)
4. Add offline fallback page
5. Add app update notification
6. Implement background sync if needed
