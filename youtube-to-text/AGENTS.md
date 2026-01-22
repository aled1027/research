# YouTube to Text - Development Guide

## Project Overview

Browser-based YouTube transcript processor using OpenRouter for AI enhancement.

## Quick Start

1. Open `index.html` in a browser
2. Add your OpenRouter API key
3. Paste a YouTube URL or transcript
4. Process and export

## OpenRouter API Pattern

This project follows the standard OpenRouter integration pattern used across this repository.

### API Endpoint

```
https://openrouter.ai/api/v1/chat/completions
```

### Required Headers

```javascript
{
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Your App Name'
}
```

### Request Body

```javascript
{
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
        { role: 'system', content: 'System prompt...' },
        { role: 'user', content: 'User message...' }
    ],
    max_tokens: 4096
}
```

### Response Parsing

```javascript
const data = await response.json();
const content = data.choices[0].message.content;
```

### Error Handling

```javascript
if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API failed: ${response.status}`);
}
```

## API Key Management

Store in localStorage for persistence across sessions:

```javascript
// Key name (shared across repo tools)
const STORAGE_KEY = 'openrouter_api_key';

// Save
localStorage.setItem(STORAGE_KEY, apiKey);

// Load
const apiKey = localStorage.getItem(STORAGE_KEY);

// Clear
localStorage.removeItem(STORAGE_KEY);
```

## Model Selection

Available models via OpenRouter:

- `anthropic/claude-3.5-sonnet` - Recommended for quality
- `anthropic/claude-3-haiku` - Faster/cheaper
- `openai/gpt-4o` - Alternative
- `openai/gpt-4o-mini` - Budget
- `google/gemini-pro-1.5` - Google option

Store user preference:

```javascript
localStorage.setItem('youtube_to_text_model', selectedModel);
```

## Architecture

### Single-File Design

All code is in `index.html`:
- HTML structure
- CSS styles (inline `<style>`)
- JavaScript application (inline `<script>`)

This makes it easy to deploy and share.

### Key Components

1. **API Key Management**: Save/load/clear OpenRouter keys
2. **Transcript Fetching**: CORS proxy approach to get YouTube captions
3. **AI Processing**: Send transcript to OpenRouter with custom prompts
4. **Output Display**: Markdown rendering and export

## Extending

### Adding New Processing Options

1. Add checkbox in HTML:
```html
<div class="option-card">
    <label>
        <input type="checkbox" id="opt-newfeature">
        New Feature Description
    </label>
</div>
```

2. Cache element:
```javascript
optNewFeature: document.getElementById('opt-newfeature'),
```

3. Include in options:
```javascript
const options = {
    // ...existing
    newfeature: this.elements.optNewFeature.checked
};
```

4. Update prompt builder:
```javascript
if (options.newfeature) {
    prompt += `- Instructions for new feature\n`;
}
```

### Adding Tool Calls

For structured output, use tool calls (see grammarly/api.js for example):

```javascript
body: JSON.stringify({
    model: model,
    messages: [...],
    tools: [{
        type: 'function',
        function: {
            name: 'extract_data',
            description: 'Extract structured data',
            parameters: {
                type: 'object',
                properties: {
                    // Define schema
                }
            }
        }
    }],
    tool_choice: { type: 'function', function: { name: 'extract_data' } }
})
```

## Testing

Open `index.html` directly in a browser. No build step required.

Test scenarios:
1. API key save/load/clear
2. YouTube URL parsing (various formats)
3. Transcript auto-fetch (may fail due to CORS)
4. Manual transcript paste
5. Processing with different option combinations
6. Copy and download functionality

## Dependencies

- [Pico CSS](https://picocss.com/) - Minimal CSS framework (CDN)
- [OpenRouter API](https://openrouter.ai/) - AI model access

No npm packages or build tools required.
