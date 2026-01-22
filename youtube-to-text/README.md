# YouTube to Text

A browser-based tool that converts YouTube video transcripts into clean, readable text using AI-powered enhancement.

Based on [youtube-to-text](https://github.com/jaswsunny/youtube-to-text) by jaswsunny.

## Features

- **Transcript Fetching**: Automatically fetch transcripts from YouTube URLs
- **Manual Input**: Paste transcripts directly if auto-fetch fails
- **AI Enhancement**: Clean up auto-generated captions with proper grammar and punctuation
- **Chapter Generation**: Automatically divide content into logical sections
- **Key Takeaways**: Extract main points and memorable quotes
- **Export Options**: Copy to clipboard or download as Markdown

## Usage

1. Open `index.html` in a web browser
2. Enter your OpenRouter API key (saved to localStorage)
3. Either:
   - Paste a YouTube URL and click "Fetch" to auto-extract the transcript
   - Or paste a transcript directly in the "Paste Transcript" tab
4. Select processing options
5. Click "Process Transcript"
6. Copy or download the results

## OpenRouter API Integration

This tool uses [OpenRouter](https://openrouter.ai/) for AI processing. OpenRouter provides unified access to multiple AI models through a single API.

### Getting an API Key

1. Create an account at [openrouter.ai](https://openrouter.ai/)
2. Go to [API Keys](https://openrouter.ai/keys)
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-`)

### API Configuration

```javascript
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,  // Recommended
        'X-Title': 'YouTube to Text'              // Recommended
    },
    body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',  // or other model
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        max_tokens: 4096
    })
});

const data = await response.json();
const result = data.choices[0].message.content;
```

### Supported Models

The tool supports several models via OpenRouter:

| Model | ID | Best For |
|-------|-----|----------|
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | Best quality (recommended) |
| Claude 3 Haiku | `anthropic/claude-3-haiku` | Faster, cheaper |
| GPT-4o | `openai/gpt-4o` | Alternative high quality |
| GPT-4o Mini | `openai/gpt-4o-mini` | Budget option |
| Gemini Pro 1.5 | `google/gemini-pro-1.5` | Google's model |

### API Key Storage

The API key is stored in browser localStorage under the key `openrouter_api_key`. This is shared across other tools in this repository (e.g., grammarly).

```javascript
// Save
localStorage.setItem('openrouter_api_key', apiKey);

// Load
const apiKey = localStorage.getItem('openrouter_api_key');

// Clear
localStorage.removeItem('openrouter_api_key');
```

## How It Works

### Transcript Extraction

The tool attempts to fetch transcripts using CORS proxies to access YouTube's caption data:

1. Parses the YouTube URL to extract the video ID
2. Fetches the video page via CORS proxy
3. Extracts caption track URLs from the page data
4. Fetches and parses the XML transcript
5. Falls back to manual input if auto-fetch fails

### AI Processing

The transcript is sent to OpenRouter with a customized prompt based on selected options:

- **Cleanup**: Fix grammar, remove filler words, add proper punctuation
- **Chapters**: Divide into logical sections with headers
- **Takeaways**: Extract key points and quotes
- **Timestamps**: Optionally preserve or remove timestamps

## Limitations

- Auto-fetch may fail for some videos due to CORS restrictions
- Requires videos to have captions (auto-generated or manual)
- Long videos may exceed token limits; consider processing in sections
- API costs apply based on OpenRouter pricing

## Files

- `index.html` - Main application (single-file, no build required)
- `README.md` - This documentation
- `AGENTS.md` - Development instructions
- `notes.md` - Development notes and decisions

## Related Tools

Other tools in this repository that use OpenRouter:

- [grammarly/](../grammarly/) - AI-powered grammar checker
- [incontext-lite-web/](../incontext-lite-web/) - Article simplification tool
