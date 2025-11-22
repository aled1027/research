Inspired by Simon Willison's open research workflow, this project streamlines documentation by automating the generation and maintenance of project summaries and indexes using GitHub Actions. It leverages [Simon Willison's llm CLI tool](https://github.com/simonw/llm) to create AI-powered summaries for each research project, caches these summaries for efficiency, and produces a responsive [index.html](https://github.com/simonw/research) for easy browsing. On every commit to the main branch, the system detects new projects, generates or updates summaries, and synchronizes both README.md and the HTML index, making research management effortless and consistent. Enhanced features include chronological listing, dynamic icon assignment, and badges for new projects.

**Key features:**
- Automated, cached AI summary generation via the llm CLI
- Instant README.md and index.html updates on code push
- Chronological sorting using git history
- Smart icons and “New” badges for projects
- Zero-maintenance workflow requiring no manual intervention
