# AI Grammar Checker

A Grammarly-style grammar checking application powered by AI through OpenRouter. Built with vanilla HTML, CSS, and JavaScript using Pico.css for base styling.

## Features

- **AI-Powered Grammar Checking**: Uses OpenRouter API with Claude 3.5 Sonnet to analyze text for grammar, spelling, punctuation, style, and clarity issues
- **Rich Error Highlighting**: Color-coded highlighting for different error types with interactive tooltips
- **Accept/Dismiss Suggestions**: Click on errors to see suggestions and either accept or dismiss them
- **Local Storage**: API key is securely stored in browser local storage
- **Responsive Design**: Works on desktop and mobile devices
- **No Build Required**: Pure HTML/CSS/JS - just serve the files

## Setup

### 1. Get an OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account or sign in
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### 2. Run the Application

You can serve the files using any static file server. Here are a few options:

**Option A: Python (built-in)**
```bash
cd grammarly
python3 -m http.server 8000
```
Then open http://localhost:8000

**Option B: Node.js (if you have it)**
```bash
npx serve grammarly
```

**Option C: VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

### 3. Configure Your API Key

1. Open the application in your browser
2. Click on "OpenRouter API Key Settings"
3. Paste your API key
4. Click "Save Key"

The key will be stored in your browser's local storage and persist across sessions.

## Usage

1. **Paste your text**: Copy your blog post, article, or any text into the textarea
2. **Click "Check Grammar"**: The AI will analyze your text for issues
3. **Review errors**: Issues are highlighted in the text with color-coded underlining
4. **Click on errors**: See detailed suggestions in tooltips
5. **Accept or dismiss**: Apply suggestions or dismiss issues you want to keep

## Error Types

| Type | Color | Description |
|------|-------|-------------|
| Spelling | Red | Misspelled words, typos |
| Grammar | Yellow | Subject-verb agreement, tense issues, double words |
| Punctuation | Blue | Missing or incorrect commas, periods, etc. |
| Style | Pink | Awkward phrasing, passive voice, wordiness |
| Clarity | Blue | Confusing sentences, ambiguous references |

## Running Tests

1. Open `tests.html` in your browser
2. Click "Run Tests"
3. View the test results showing pass/fail status

The test suite covers:
- API configuration
- App initialization
- Local storage operations
- HTML escaping (XSS prevention)
- Issue management
- Tooltip functionality
- UI state management

## Technical Details

### Architecture

- `index.html` - Main application page
- `styles.css` - Custom styles on top of Pico.css
- `api.js` - OpenRouter API integration with tool calls
- `app.js` - Main application logic
- `tests.html` - Test runner page
- `tests.js` - Unit test suite

### API Integration

The application uses OpenRouter's chat completions endpoint with tool calling to get structured grammar feedback:

```javascript
{
    tools: [{
        type: 'function',
        function: {
            name: 'report_grammar_issues',
            parameters: {
                properties: {
                    issues: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { enum: ['spelling', 'grammar', 'punctuation', 'style', 'clarity'] },
                                original_text: { type: 'string' },
                                suggested_text: { type: 'string' },
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }]
}
```

This ensures consistent, structured responses from the AI model.

### Security

- API key is stored locally in the browser (never sent to any server except OpenRouter)
- HTML content is escaped to prevent XSS attacks
- No external dependencies beyond Pico.css CDN

## Customization

### Change AI Model

Edit `api.js` and modify the `MODEL` constant:

```javascript
const GrammarAPI = {
    MODEL: 'anthropic/claude-3.5-sonnet', // Change this
    // ...
};
```

Available models: https://openrouter.ai/docs#models

### Customize Error Colors

Edit `styles.css` and modify the CSS custom properties:

```css
:root {
    --error-spelling: #ff6b6b;
    --error-grammar: #feca57;
    --error-punctuation: #48dbfb;
    --error-style: #ff9ff3;
    --error-clarity: #54a0ff;
}
```

## Cost

The application uses OpenRouter which bills based on token usage. A typical grammar check of a medium blog post (~500 words) costs approximately $0.01-$0.03 depending on the model used.

## License

MIT License - Feel free to use, modify, and distribute.
