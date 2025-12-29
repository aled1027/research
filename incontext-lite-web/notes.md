# InContext Lite Web - Development Notes

## Goal
Create a web version of the incontext-lite Python script using Pyodide.

## Requirements
- Use Pyodide to run Python in the browser
- Allow user to upload text file
- Form inputs for target language and language level
- Use Pico CSS for styling
- Minimize changes to the original Python script

## Approach
1. Embed the Python script with minimal modifications for browser environment
2. Replace file I/O with JavaScript interop
3. Replace `requests` with Pyodide's `pyodide.http.pyfetch`
4. Embed prompts.yaml content directly in Python
5. Return results to JavaScript for display

## Changes needed for Pyodide compatibility
- Remove file reading for article.txt (get from JS)
- Remove input() calls (get from JS form)
- Replace requests.post with pyodide.http.pyfetch
- Embed prompts dictionary instead of loading from YAML file
- Output results to JS instead of file writing

## Implementation Notes

### Pyodide Integration
- Used Pyodide v0.24.1 from CDN
- Loaded micropip to install PyYAML (for future extensibility)
- Used `pyodide.globals.set()` to pass variables from JS to Python
- Python code returns a dict that gets converted to JS object via `.toJs()`

### Form Design
- File upload with fallback to textarea for pasting
- API key field (required for OpenRouter)
- Model selector with sensible default (gpt-4o-mini)
- Language and level inputs

### Key Pyodide Differences
- `pyfetch` is async, so all functions became async
- Response handling: `await response.json()` instead of `response.json()`
- Can't use `sys.exit()` - use exceptions instead
- Variables from JS accessed directly via `js_variablename`

### Output Handling
- Preview shows first 2 paragraphs
- Full output shows everything including questions/answers
- Copy to clipboard and download buttons for user convenience

## What I Learned
1. Pyodide's `pyfetch` works well for HTTP requests but requires async/await
2. Pico CSS provides clean styling with minimal effort
3. Python code embedded in JS needs escaped newlines (`\\n` not `\n`) in strings
4. The `toJs()` method is needed to convert Python dicts to JS objects
