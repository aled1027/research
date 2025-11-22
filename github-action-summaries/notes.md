# Notes on GitHub Action Summary Generation

## Investigation of Simon Willison's Research Repo

### Overview
Explored https://github.com/simonw/research to understand their automated summary generation system.

### Key Components

1. **cogapp** - A Python tool that executes embedded Python code in markdown files
   - Uses `<!--[[[cog ... ]]]-->` markers to embed Python code
   - Runs with `cog -r -P README.md` to update in-place

2. **LLM CLI** - Simon's llm tool (https://github.com/simonw/llm)
   - Generates summaries of README.md files
   - Uses github/gpt-4.1 model via llm-github-models plugin

3. **_summary.md Files** - Cached summaries for each directory
   - Avoids regenerating summaries on each run
   - Can be deleted to force regeneration

### Workflow Process

1. GitHub Action triggers on push to main
2. Checks out repo with full history (`fetch-depth: 0`)
3. Installs dependencies from requirements.txt
4. Runs `cog -r -P README.md`
5. Commits any changes to README.md and */_summary.md files

### Cogapp Implementation Details

The embedded Python code in README.md:
- Discovers all subdirectories (excluding hidden ones)
- Gets first commit date for each directory using git log
- Sorts directories by date (newest first)
- For each directory:
  - Checks for cached `_summary.md`
  - If not found, generates summary using llm CLI
  - Saves summary to `_summary.md` for caching
  - Outputs markdown with GitHub links

### Dependencies (requirements.txt)
```
cogapp
llm
llm-github-models
```

## Implementation Plan for This Repo

### Differences from Simon's approach
1. Will create a standalone Python script to generate index.html
2. Will keep the cogapp approach for README.md
3. Will add index.html generation to the workflow

### Components to Create
1. `.github/workflows/update-readme.yml` - GitHub Action
2. `requirements.txt` - Python dependencies
3. Update root `README.md` with cogapp code
4. `generate_index.py` - Script to create index.html
5. Update workflow to generate and commit index.html

### Index.html Features
- List all research directories
- Show dates and summaries
- Provide navigation links
- Simple, clean HTML design

## Implementation Details

### Files Created

1. **/.github/workflows/update-readme.yml**
   - GitHub Actions workflow
   - Triggers on push to main branch
   - Checks out repo with full history
   - Installs Python dependencies
   - Runs cogapp to update README.md
   - Runs generate_index.py to create index.html
   - Commits and pushes changes if any

2. **/generate_index.py**
   - Python script to generate index.html
   - Discovers all research directories
   - Gets git commit dates for each project
   - Reads _summary.md files for descriptions
   - Generates responsive HTML page with project cards
   - Includes GitHub links, README links, and demo links
   - Uses icon emojis based on project name keywords

3. **/README.md** (updated)
   - Added cogapp markers with Python code
   - Code discovers all subdirectories
   - Gets first commit date for each
   - Checks for _summary.md cache
   - Generates summaries using llm CLI if needed
   - Outputs formatted markdown with links

### Testing

- Ran generate_index.py locally - successfully generated index.html with 5 projects
- Verified requirements.txt already existed with correct dependencies

### How It Works

1. **On Push to Main:**
   - Workflow triggers automatically
   - Cogapp processes README.md and generates/uses _summary.md files
   - generate_index.py creates index.html with same data
   - Both files are committed back to the repo

2. **Summary Generation:**
   - First time: llm CLI generates summary from README.md
   - Saves to _summary.md for caching
   - Future runs: uses cached _summary.md
   - To regenerate: delete _summary.md and push

3. **Index.html:**
   - Dynamically generated from directory structure
   - Shows project cards with icons, dates, summaries
   - Links to README, demos (if index.html exists), and GitHub
   - Marks newest project with "New" badge
   - Fully responsive design

### Key Improvements Over Manual Approach

- Automatic summary generation using AI
- Consistent formatting across all projects
- No manual HTML editing needed
- Index stays in sync with directory structure
- Cached summaries prevent redundant API calls
- Git dates show actual creation time
