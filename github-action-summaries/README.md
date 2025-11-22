# Automated Summary Generation with GitHub Actions

## Overview

This project implements an automated system for generating and maintaining project summaries and documentation in a research repository. Inspired by [Simon Willison's research repository](https://github.com/simonw/research), this implementation uses GitHub Actions to automatically:

1. Generate AI-powered summaries of research projects
2. Update the main README.md with project listings
3. Create and maintain an interactive index.html page

## Key Features

- **Automated Summary Generation**: Uses [Simon Willison's llm CLI tool](https://github.com/simonw/llm) to generate concise summaries from README files
- **Smart Caching**: Summaries are cached in `_summary.md` files to avoid redundant API calls
- **Dynamic Index Page**: Automatically generates a beautiful, responsive HTML index
- **GitHub Integration**: Runs automatically on every push to main branch
- **Git-Based Chronology**: Projects are sorted by their first commit date

## Implementation

### Architecture

The system consists of three main components:

#### 1. GitHub Actions Workflow (`.github/workflows/update-readme.yml`)

Triggers on every push to main and:
- Checks out the repository with full git history
- Installs Python dependencies (cogapp, llm, llm-github-models)
- Runs cogapp to process README.md
- Executes generate_index.py to create index.html
- Commits and pushes any changes

#### 2. Cogapp-Enabled README.md

The root README.md contains embedded Python code within `<!--[[[cog ... ]]]-->` markers. This code:
- Discovers all research project directories
- Retrieves first commit date for each project using git log
- Checks for cached `_summary.md` files
- Generates new summaries using llm CLI when needed
- Outputs formatted markdown with GitHub links

#### 3. Index Generator Script (`generate_index.py`)

A standalone Python script that:
- Scans all project directories
- Reads _summary.md files for descriptions
- Generates a responsive HTML page with project cards
- Includes smart icon selection based on project names
- Provides links to READMEs, demos, and GitHub

### How It Works

```
Push to main
    ↓
GitHub Actions triggered
    ↓
Checkout repo + install dependencies
    ↓
Run cogapp on README.md
    ├─ For each project directory:
    │  ├─ Check for _summary.md (cache)
    │  ├─ If missing: generate summary with llm CLI
    │  └─ Save to _summary.md
    ↓
Run generate_index.py
    ├─ Read all _summary.md files
    └─ Generate index.html
    ↓
Commit and push if changes detected
```

### Summary Generation

Summaries are generated using the llm CLI with this prompt:

> "Summarize this research project concisely. Write just 1 paragraph (3-5 sentences) followed by an optional short bullet list if there are key findings. Vary your opening - don't start with 'This report' or 'This research'. Include 1-2 links to key tools/projects. Be specific but brief. No emoji."

The llm tool uses the `github/gpt-4.1` model via the llm-github-models plugin.

## Files Created

### In Repository Root

- `.github/workflows/update-readme.yml` - GitHub Actions workflow configuration
- `generate_index.py` - Python script for HTML generation
- `README.md` - Updated with cogapp code blocks
- `index.html` - Auto-generated project index (created by workflow)
- `requirements.txt` - Python dependencies (already existed)

### In Project Directories

- `_summary.md` - Cached AI-generated summaries (auto-created as needed)

## Usage

### Normal Operation

Simply push changes to the main branch. The GitHub Action will:
1. Automatically detect new projects
2. Generate summaries for projects without `_summary.md` files
3. Update README.md and index.html
4. Commit changes back to the repository

### Regenerating Summaries

To force regeneration of a project summary:
1. Delete the `_summary.md` file in that project's directory
2. Push to main
3. The workflow will generate a fresh summary

### Local Testing

You can test the index generation locally:

```bash
python generate_index.py
```

To test README generation with cogapp:

```bash
pip install -r requirements.txt
cog -r -P README.md
```

## Dependencies

From `requirements.txt`:
- `cogapp` - Code generation tool for markdown
- `llm` - Simon Willison's LLM CLI tool
- `llm-github-models` - GitHub models plugin for llm

## Key Differences from Simon Willison's Implementation

1. **Index.html Generation**: Added automatic HTML index page generation (not in original)
2. **Workflow Enhancement**: Extended workflow to generate and commit index.html
3. **Icon System**: Implemented smart icon selection based on project keywords
4. **Badge System**: Marks newest project with a "New" badge

## Benefits

- **Zero Manual Maintenance**: README and index.html stay synchronized automatically
- **Consistent Formatting**: All summaries follow the same style and structure
- **Cost Efficient**: Caching prevents redundant LLM API calls
- **Time-Aware**: Projects show actual creation dates from git history
- **User-Friendly**: Beautiful HTML interface for browsing projects

## Example Output

### README.md Format

```markdown
### [project-name](https://github.com/user/repo/tree/main/project-name) (2025-11-22)

Project description generated by AI, including key findings and relevant links.

* Key finding 1
* Key finding 2
```

### Index.html Features

- Responsive grid layout
- Gradient background (purple theme)
- Project cards with hover effects
- Icons based on project type
- "New" badge for latest project
- Links to README, demos, and GitHub
- Footer with repository information

## Troubleshooting

**Summaries not generating?**
- Check that llm CLI is properly configured with GitHub token
- Verify requirements.txt dependencies are installed
- Ensure GITHUB_TOKEN secret has `models: read` permission

**Index.html not updating?**
- Check that generate_index.py runs without errors
- Verify workflow has `contents: write` permission
- Look for errors in GitHub Actions logs

## Future Enhancements

Potential improvements:
- Add search/filter functionality to index.html
- Support for tags and categories
- RSS feed generation
- Project statistics and analytics
- Dark mode toggle for index.html

## Credits

- Implementation inspired by [Simon Willison's research repository](https://github.com/simonw/research)
- Uses [cogapp](https://nedbatchelder.com/code/cog/) by Ned Batchelder
- Powered by [llm CLI](https://github.com/simonw/llm) by Simon Willison
