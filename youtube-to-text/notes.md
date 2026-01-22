# YouTube to Text - Development Notes

## Objective
Create a browser-based version of https://github.com/jaswsunny/youtube-to-text

## Original Tool Analysis
The original youtube-to-text tool:
- Uses yt-dlp to extract transcripts from YouTube videos
- Uses Google Gemini AI to clean up auto-generated captions
- Generates chapter headers and key takeaways
- Outputs in MS Word 2003 style with export options

## Browser Implementation Challenges

### Challenge 1: Transcript Extraction
- yt-dlp is a command-line tool that can't run in browsers
- YouTube doesn't provide a public transcript API with CORS support
- Options considered:
  1. CORS proxy to fetch YouTube page and extract transcript data
  2. Allow users to paste transcripts directly
  3. Use YouTube's embed API (limited access to captions)

### Solution
- Implemented a hybrid approach:
  1. Try to auto-fetch transcript using youtube-transcript-api format via CORS proxy
  2. Fallback to manual transcript paste
  3. Support for direct YouTube URL input with extraction attempt

### Challenge 2: AI Processing
- Original uses Google Gemini API
- This repo uses OpenRouter for AI calls

### Solution
- Use OpenRouter API following patterns from grammarly/api.js
- Model: anthropic/claude-3.5-sonnet (or user-configurable)
- Features:
  - Clean up auto-generated captions
  - Generate chapter summaries
  - Extract key takeaways

## OpenRouter Integration Patterns (from grammarly/)

### API Endpoint
```
https://openrouter.ai/api/v1/chat/completions
```

### Headers
```javascript
{
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'YouTube to Text'
}
```

### API Key Storage
- Uses localStorage with key 'openrouter_api_key'
- Shared across tools in this repo

## Implementation Decisions

1. **Single-file approach**: Everything in index.html for simplicity and portability
2. **Pico CSS**: Using same CSS framework as other tools in repo
3. **Export formats**: Markdown and copy to clipboard
4. **Caching**: Store processed results in localStorage

## Files Created
- notes.md (this file)
- index.html (main application)
- README.md (documentation)
- AGENTS.md (development instructions)
