Designed as a lightweight, AI-powered grammar checker in the browser, this project leverages Anthropic's Claude 3.5 Sonnet via the [OpenRouter API](https://openrouter.ai/) to analyze and suggest corrections for grammar, spelling, punctuation, style, and clarity. Built with vanilla HTML, CSS (via [Pico.css](https://picocss.com/)), and JavaScript, the tool features interactive, color-coded error highlighting with tooltips, allowing users to accept or dismiss suggestions. The API key is stored securely in local storage and the app requires no build process—just serve the static files for full functionality. Security is considered (local storage, XSS prevention), and customization options are provided for AI model selection and error highlighting.

**Key Highlights:**
- No build tools or external JS dependencies required; runs as pure static files
- Supports fine-grained, interactive grammar feedback through OpenRouter tool calling
- Responsive design for both desktop and mobile
- Simple testing and unit test suite included
