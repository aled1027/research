The YouTube to Text project is a browser-based tool that automatically extracts and cleans YouTube video transcripts, enhancing readability and structure with AI processing via [OpenRouter](https://openrouter.ai/). Users can fetch transcripts directly from video URLs or paste them manually, then apply options for grammar correction, logical chapter division, key takeaways, and quote extraction. The processed text can be exported as Markdown or copied to the clipboard. The tool supports multiple AI models, such as Claude 3.5 Sonnet and GPT-4o, and stores API keys in localStorage for reuse across the repository’s apps. For implementation details and source code, see [youtube-to-text](https://github.com/jaswsunny/youtube-to-text).

**Key features:**
- Automated transcript fetching and manual input support
- AI-powered cleanup, chapter creation, and key point extraction
- Flexible export options (Markdown, clipboard)
- Integration with various AI models through OpenRouter
- LocalStorage for secure API key management

**Limitations:**  
- Reliance on YouTube captions and CORS proxies may affect reliability  
- Large transcripts may need sectional processing due to token limits  
- OpenRouter AI processing incurs usage costs
