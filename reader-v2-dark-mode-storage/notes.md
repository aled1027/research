# Reader v2 - Dark Mode & Storage Updates

## Task
1. Fix the bottom controls in dark mode
2. Add the ability to store text and progress locally

## Analysis

### Dark Mode Issues Found

Looking at the current CSS in `reader-v2/index.html`:

1. **Bottom controls gradient** - The `.controls` dark mode gradient uses `rgba(26, 26, 26, 0.95)` which matches the dark background. This seems correct.

2. **Navigation buttons** - The `.nav-btn` in dark mode:
   - Sets `border-color: #555` and `color: #aaa`
   - Hover state sets `background: #333`
   - Missing: The disabled button state may not be visible enough

3. **Progress text** - Uses `#777` in dark mode which may be too dark against the gradient background.

### Storage Implementation

For storing text and progress, `localStorage` is the best choice because:
- Simple key-value storage is sufficient
- Text content is typically <1MB (localStorage limit is ~5MB)
- Synchronous API is simpler for this use case
- No need for complex querying (would warrant IndexedDB)

Storage structure:
- `reader-v2-content`: The pasted/saved text content
- `reader-v2-progress`: Current page number

## Changes Made

### 1. Dark Mode Fixes

Updated the dark mode styling for bottom controls in `reader-v2/index.html`:

**Controls background:**
- Increased opacity from 0.95 to 0.98 for better visibility

**Navigation buttons (`.nav-btn`):**
- Added solid background color: `#2a2a2a`
- Improved text color to `#ccc` (was `#aaa`)
- Hover state: background `#3a3a3a`, border `#666`, text `#e0e0e0`
- Disabled state: background `#252525`, border `#444`, text `#555`

**Progress text:**
- Changed from `#777` to `#aaa` for better contrast

### 2. localStorage Implementation

Added storage functions:
- `saveContent(content)` - Saves HTML content to localStorage
- `loadContent()` - Retrieves saved content
- `saveProgress(page)` - Saves current page number
- `loadProgress()` - Retrieves saved page number
- `clearStorage()` - Clears all saved data

**Integration points:**
- Content is saved when entering reading mode
- Progress is saved on every page change (scroll or navigation)
- On page load, if saved content exists:
  - Content is restored to the paste area
  - If progress > 0, shows "Resume from page X" button
  - "Start Over" button clears storage and starts fresh

### 3. User Experience

When a user returns to the page with saved content:
- They see their previously pasted text
- If they were partway through, they get two options:
  1. "Start Over" - clears progress and starts from page 1
  2. "Resume from page X" - continues where they left off
