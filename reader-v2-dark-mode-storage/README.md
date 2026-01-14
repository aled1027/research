# Reader v2 - Dark Mode & Storage Updates

This update enhances the Reader v2 application with improved dark mode styling for the bottom navigation controls and adds localStorage-based persistence for text content and reading progress.

## Changes

### Dark Mode Improvements

Fixed visibility issues with the bottom controls bar in dark mode:

- **Navigation buttons**: Added solid background colors, improved text contrast, and proper disabled state styling
- **Progress indicator**: Increased text brightness from `#777` to `#aaa` for better readability
- **Controls background**: Increased gradient opacity for better visual separation

### localStorage Persistence

Added the ability to save and restore reading sessions:

- **Content persistence**: Pasted text is automatically saved to localStorage when entering reading mode
- **Progress tracking**: Current page number is saved on every navigation action
- **Resume functionality**: On page load, if saved content exists:
  - Content is restored to the paste area
  - Users can choose to "Resume" from their last position or "Start Over"

## Technical Details

**Storage keys:**
- `reader-v2-content` - HTML content of the pasted text
- `reader-v2-progress` - Current page number (0-indexed)

**Why localStorage over IndexedDB:**
- Simple key-value storage is sufficient for this use case
- Text content is typically well under the ~5MB localStorage limit
- Synchronous API is simpler and doesn't require async handling
- No need for complex querying or indexing

## Files Modified

- `reader-v2/index.html` - All changes in single file (CSS + JavaScript)
