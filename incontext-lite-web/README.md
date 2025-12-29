# InContext Lite Web

A browser-based version of the InContext Lite article simplifier, powered by Pyodide.

## Features

- **Run Python in the browser** - Uses Pyodide to execute Python code directly in the browser
- **Article simplification** - Simplifies articles for language learners at specified proficiency levels
- **Comprehension questions** - Auto-generates questions and answers based on the simplified content
- **File upload or paste** - Support for uploading `.txt` files or pasting text directly
- **Download results** - Save the simplified article with questions to a text file

## Usage

1. Open `index.html` in a modern web browser
2. Enter your OpenRouter API key
3. Upload an article file or paste text directly
4. Specify the target language (e.g., Spanish, French)
5. Specify the proficiency level (e.g., A2, Intermediate, B1)
6. Click "Simplify Article"
7. View the preview and full output
8. Copy to clipboard or download the results

## Requirements

- Modern web browser with JavaScript enabled
- OpenRouter API key (get one at https://openrouter.ai)
- Internet connection for API calls and loading Pyodide

## Technical Details

### Changes from Original Python Script

The web version makes minimal changes to preserve the original logic:

1. **API calls**: Replaced `requests.post` with Pyodide's `pyfetch` for async HTTP requests
2. **File I/O**: Removed file reading/writing; inputs come from the HTML form, outputs display in the browser
3. **User input**: Replaced `input()` calls with form field values passed from JavaScript
4. **Prompts**: Embedded the prompts dictionary directly instead of loading from YAML
5. **Async**: Added `async/await` throughout since `pyfetch` is asynchronous

### Libraries Used

- **Pyodide** - Python runtime compiled to WebAssembly
- **Pico CSS** - Minimal CSS framework for styling
- **PyYAML** - Loaded via micropip (for potential future YAML support)

## Supported Models

Any model available on OpenRouter, including:
- `openai/gpt-4o-mini` (default)
- `openai/gpt-4o`
- `anthropic/claude-3.5-sonnet`
- `google/gemini-pro`

## File Structure

```
incontext-lite-web/
├── index.html    # Main application (single-file)
├── README.md     # This file
└── notes.md      # Development notes
```
