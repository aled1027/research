# Grammarly AI Checker - Development Notes

## Project Overview
Building a Grammarly-like grammar checker that uses AI via OpenRouter API.

## Requirements
- OpenRouter API key stored in local storage
- Textarea for pasting formatted blog/substack posts
- AI-powered grammar checking (double words, commas, etc.)
- Highlights, suggestions, tooltips UI
- Pico.css for base styling
- HTML, JS, CSS only (no frameworks)
- Tests included

## Development Log

### Session 1 - Initial Setup

**Approach:**
1. Create HTML structure with Pico.css
2. Implement OpenRouter API integration with tool calls for structured grammar feedback
3. Build highlighting/tooltip UI similar to Grammarly
4. Add local storage for API key persistence
5. Create tests using vanilla JS

**Key Design Decisions:**
- Using contenteditable div for rich text display with error highlighting
- OpenRouter API with tool use for structured grammar issue extraction
- CSS-based tooltips for suggestions
- Simple test runner without external dependencies

**Files to create:**
- index.html - Main application
- styles.css - Custom styles
- app.js - Main application logic
- api.js - OpenRouter API integration
- tests.html - Test runner page
- tests.js - Test suite

### Implementation Complete

**Files created:**
1. `index.html` - Main HTML structure with Pico.css styling
2. `styles.css` - Custom CSS for error highlighting, tooltips, and UI components
3. `api.js` - OpenRouter API integration using tool calls for structured grammar feedback
4. `app.js` - Main application logic including:
   - Local storage for API key persistence
   - Text rendering with error highlighting
   - Interactive tooltips for suggestions
   - Accept/dismiss functionality for issues
5. `tests.html` - Test runner page
6. `tests.js` - Unit tests covering API, initialization, local storage, HTML escaping, issue management, tooltips, and UI state

**Key Technical Decisions:**

1. **Tool Calls**: Using OpenRouter's tool calling feature to get structured JSON responses with grammar issues. This ensures consistent data format rather than parsing free-form text.

2. **Error Highlighting**: Using span elements with CSS classes for different error types. The `::after` pseudo-element creates underlines while background provides highlighting.

3. **Tooltip Positioning**: Calculates position based on viewport to avoid overflow, with fallback to showing above if below would overflow.

4. **HTML Escaping**: Custom escapeHtml function to prevent XSS when rendering user content.

5. **Issue Tracking**: Each issue gets a unique ID and status (active/dismissed/accepted) for state management.

**Testing Strategy:**
- Unit tests for individual components and methods
- Mock localStorage for storage tests
- No external test framework - simple custom test runner

### Bug Fix - result.issues.map is not a function

**Issue:** Error occurred when checking grammar: "result.issues.map is not a function"

**Root Cause:** The API response might not always return `result.issues` as an array, or the result structure might be unexpected in edge cases.

**Fix:**
1. Added defensive check in `app.js` to ensure `result.issues` is an array before calling `.map()`
2. Enhanced `api.js` to always ensure `issues` is an array using `Array.isArray()` check
3. Added null-safe optional chaining (`result?.issues`) for additional safety

**Changes:**
- `app.js` line 194: Added `Array.isArray()` check before mapping issues
- `api.js` line 129: Added `Array.isArray()` check when parsing tool call results
