#!/usr/bin/env python3
"""
Generate index.html for the research repository
This script discovers all research project directories and creates an index page with links and summaries
"""
import os
import subprocess
import pathlib
from datetime import datetime, timezone
import html

def get_git_date(dirname):
    """Get the first commit date for a directory"""
    try:
        result = subprocess.run(
            ['git', 'log', '--diff-filter=A', '--follow', '--format=%aI', '--reverse', '--', dirname],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            date_str = result.stdout.strip().split('\n')[0]
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except Exception:
        pass
    return None

def get_git_origin():
    """Get the GitHub origin URL"""
    try:
        result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0 and result.stdout.strip():
            origin = result.stdout.strip()

            # Handle local proxy URLs (e.g., http://local_proxy@127.0.0.1:25644/git/aled1027/research)
            if 'local_proxy@' in origin and '/git/' in origin:
                # Extract the path after /git/
                parts = origin.split('/git/')
                if len(parts) > 1:
                    repo_path = parts[1]
                    origin = f'https://github.com/{repo_path}'

            # Handle SSH URLs
            if origin.startswith('git@github.com:'):
                origin = origin.replace('git@github.com:', 'https://github.com/')

            # Remove .git suffix
            if origin.endswith('.git'):
                origin = origin[:-4]

            return origin
    except Exception:
        pass
    return None

def get_project_icon(dirname):
    """Return an icon emoji based on directory name keywords"""
    name_lower = dirname.lower()
    if 'git' in name_lower or 'version' in name_lower:
        return '🃏'
    elif 'money' in name_lower or 'finance' in name_lower or 'lifestyle' in name_lower or 'fire' in name_lower or 'inflat' in name_lower:
        return '💰'
    elif 'three' in name_lower or '3d' in name_lower or 'layer' in name_lower or 'quiz' in name_lower:
        return '🎮'
    elif 'web' in name_lower or 'html' in name_lower:
        return '🌐'
    elif 'data' in name_lower or 'analysis' in name_lower:
        return '📊'
    elif 'ai' in name_lower or 'llm' in name_lower or 'gpt' in name_lower:
        return '🤖'
    else:
        return '🔬'

def main():
    research_dir = pathlib.Path.cwd()
    github_origin = get_git_origin()

    # Collect all subdirectories with metadata
    projects = []
    for d in research_dir.iterdir():
        if d.is_dir() and not d.name.startswith('.'):
            readme_path = d / "README.md"
            summary_path = d / "_summary.md"

            # Get commit date or fallback to mtime
            commit_date = get_git_date(d.name)
            if not commit_date:
                commit_date = datetime.fromtimestamp(d.stat().st_mtime, tz=timezone.utc)

            # Read summary if available
            summary = None
            if summary_path.exists():
                with open(summary_path, 'r') as f:
                    summary = f.read().strip()

            # Determine if README exists
            has_readme = readme_path.exists()

            # Check if project has an index.html
            has_index = (d / "index.html").exists()

            projects.append({
                'name': d.name,
                'date': commit_date,
                'summary': summary,
                'has_readme': has_readme,
                'has_index': has_index,
                'icon': get_project_icon(d.name)
            })

    # Sort by date, newest first
    projects.sort(key=lambda x: x['date'], reverse=True)

    # Generate HTML
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Projects - AI-Generated Tools</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: #1f2937;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}

        header {{
            text-align: center;
            color: white;
            margin-bottom: 50px;
        }}

        header h1 {{
            font-size: 3em;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }}

        header p {{
            font-size: 1.2em;
            opacity: 0.95;
            max-width: 700px;
            margin: 0 auto;
        }}

        .stats {{
            text-align: center;
            color: white;
            margin-bottom: 30px;
            font-size: 1.1em;
        }}

        .projects-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }}

        .project-card {{
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            transition: transform 0.3s, box-shadow 0.3s;
            position: relative;
            overflow: hidden;
        }}

        .project-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }}

        .project-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.3);
        }}

        .project-icon {{
            font-size: 3em;
            margin-bottom: 15px;
        }}

        .project-title {{
            font-size: 1.8em;
            margin-bottom: 10px;
            color: #1f2937;
            word-break: break-word;
        }}

        .project-date {{
            color: #6b7280;
            font-size: 0.9em;
            margin-bottom: 15px;
        }}

        .project-description {{
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 20px;
            min-height: 80px;
        }}

        .project-links {{
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }}

        .btn {{
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            display: inline-block;
            text-align: center;
            flex: 1;
            min-width: 120px;
        }}

        .btn-primary {{
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }}

        .btn-primary:hover {{
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}

        .btn-secondary {{
            background: #f3f4f6;
            color: #374151;
        }}

        .btn-secondary:hover {{
            background: #e5e7eb;
        }}

        .badge {{
            position: absolute;
            top: 15px;
            right: 15px;
            background: #10b981;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
        }}

        footer {{
            text-align: center;
            margin-top: 60px;
            color: white;
            opacity: 0.9;
        }}

        footer a {{
            color: white;
            text-decoration: underline;
        }}

        @media (max-width: 768px) {{
            header h1 {{
                font-size: 2em;
            }}

            .projects-grid {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧪 AI Research Projects</h1>
            <p>A collection of tools and experiments entirely generated by Large Language Models. Each project demonstrates AI capabilities in research, development, and problem-solving.</p>
        </header>

        <div class="stats">
            <strong>{len(projects)}</strong> research projects
        </div>

        <div class="projects-grid">
"""

    # Add project cards
    for i, project in enumerate(projects):
        # Escape HTML in summary
        summary_text = html.escape(project['summary']) if project['summary'] else "Research project - see README for details."

        # Truncate long summaries
        if len(summary_text) > 300:
            summary_text = summary_text[:297] + "..."

        date_str = project['date'].strftime('%Y-%m-%d')

        # Show "New" badge for the most recent project
        badge = '<div class="badge">New</div>' if i == 0 else ''

        # Build links
        links = []
        if project['has_index']:
            links.append(f'<a href="{project["name"]}/index.html" class="btn btn-primary">🚀 Launch Tool</a>')
        if project['has_readme']:
            links.append(f'<a href="{project["name"]}/README.md" class="btn btn-secondary">📖 Docs</a>')

        if github_origin:
            links.append(f'<a href="{github_origin}/tree/main/{project["name"]}" class="btn btn-secondary" target="_blank">💻 Code</a>')

        links_html = '\n                    '.join(links) if links else '<a href="{}" class="btn btn-secondary">📁 View Folder</a>'.format(project["name"])

        html_content += f"""            <div class="project-card">
                {badge}
                <div class="project-icon">{project['icon']}</div>
                <h2 class="project-title">{html.escape(project['name'])}</h2>
                <div class="project-date">{date_str}</div>
                <p class="project-description">
                    {summary_text}
                </p>
                <div class="project-links">
                    {links_html}
                </div>
            </div>

"""

    # Close HTML
    html_content += f"""        </div>

        <footer>
            <p><strong>About These Projects</strong></p>
            <p style="margin-top: 10px;">Every line of code and documentation was written by Large Language Models (primarily Claude). This showcases the current capabilities of AI in autonomous research and development.</p>"""

    if github_origin:
        html_content += f"""
            <p style="margin-top: 20px;">
                <a href="{github_origin}" target="_blank">View on GitHub</a>
            </p>"""

    html_content += """
        </footer>
    </div>
</body>
</html>
"""

    # Write to index.html
    with open('index.html', 'w') as f:
        f.write(html_content)

    print(f"Generated index.html with {len(projects)} projects")

if __name__ == '__main__':
    main()
