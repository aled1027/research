Leveraging Pyodide, InContext Lite Web brings Python-powered article simplification directly to the browser, allowing users to process and adapt reading material for language learners without server-side code. Users upload or paste text, select a target language and proficiency level, then receive a simplified article plus auto-generated comprehension questions—all performed on the client side via the OpenRouter API. The project minimally alters the original Python logic, using `pyfetch` for API requests and interactive HTML forms instead of file I/O or command-line input, providing a streamlined, accessible experience for language educators and learners. Explore the application [here](https://github.com/incontextlang/incontext-lite-web) and obtain an API key at [OpenRouter](https://openrouter.ai).

**Key features and findings:**
- Enables privacy-friendly, in-browser Python execution with Pyodide and async API calls  
- Adapts articles to any proficiency level and language, supporting a range of OpenRouter models  
- Output includes downloadable simplified content and comprehension exercises for learners
