# Research projects carried out by AI tools

Each directory in this repo is a separate research project carried out by an LLM tool - usually Claude Code. Every single line of text and code was written by an LLM.

I try to include prompts and links to transcripts in the PRs that added each report, or in the commits.

This README uses cogapp to automatically generate project descriptions.

<!--[[[cog
import os
import subprocess
import pathlib
from datetime import datetime, timezone

# Model to use for generating summaries
MODEL = "github/gpt-4.1"

# Get all subdirectories with their first commit dates
research_dir = pathlib.Path.cwd()
subdirs_with_dates = []

for d in research_dir.iterdir():
    if d.is_dir() and not d.name.startswith('.'):
        # Get the date of the first commit that touched this directory
        try:
            result = subprocess.run(
                ['git', 'log', '--diff-filter=A', '--follow', '--format=%aI', '--reverse', '--', d.name],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                # Parse first line (oldest commit)
                date_str = result.stdout.strip().split('\n')[0]
                commit_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                subdirs_with_dates.append((d.name, commit_date))
            else:
                # No git history, use directory modification time
                subdirs_with_dates.append((d.name, datetime.fromtimestamp(d.stat().st_mtime, tz=timezone.utc)))
        except Exception:
            # Fallback to directory modification time
            subdirs_with_dates.append((d.name, datetime.fromtimestamp(d.stat().st_mtime, tz=timezone.utc)))

# Print the heading with count
print(f"## {len(subdirs_with_dates)} research projects\n")

# Sort by date, most recent first
subdirs_with_dates.sort(key=lambda x: x[1], reverse=True)

for dirname, commit_date in subdirs_with_dates:
    folder_path = research_dir / dirname
    readme_path = folder_path / "README.md"
    summary_path = folder_path / "_summary.md"

    date_formatted = commit_date.strftime('%Y-%m-%d')

    # Get GitHub repo URL
    github_url = None
    try:
        result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0 and result.stdout.strip():
            origin = result.stdout.strip()
            # Convert SSH URL to HTTPS URL for GitHub
            if origin.startswith('git@github.com:'):
                origin = origin.replace('git@github.com:', 'https://github.com/')
            if origin.endswith('.git'):
                origin = origin[:-4]
            github_url = f"{origin}/tree/main/{dirname}"
    except Exception:
        pass

    if github_url:
        print(f"### [{dirname}]({github_url}) ({date_formatted})\n")
    else:
        print(f"### {dirname} ({date_formatted})\n")

    # Check if summary already exists
    if summary_path.exists():
        # Use cached summary
        with open(summary_path, 'r') as f:
            description = f.read().strip()
            if description:
                print(description)
            else:
                print("*No description available.*")
    elif readme_path.exists():
        # Generate new summary using llm command
        prompt = """Summarize this research project concisely. Write just 1 paragraph (3-5 sentences) followed by an optional short bullet list if there are key findings. Vary your opening - don't start with "This report" or "This research". Include 1-2 links to key tools/projects. Be specific but brief. No emoji."""
        result = subprocess.run(
            ['llm', '-m', MODEL, '-s', prompt],
            stdin=open(readme_path),
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            error_msg = f"LLM command failed for {dirname} with return code {result.returncode}"
            if result.stderr:
                error_msg += f"\nStderr: {result.stderr}"
            raise RuntimeError(error_msg)
        if result.stdout.strip():
            description = result.stdout.strip()
            print(description)
            # Save to cache file
            with open(summary_path, 'w') as f:
                f.write(description + '\n')
        else:
            raise RuntimeError(f"LLM command returned no output for {dirname}")
    else:
        print("*No description available.*")

    print()  # Add blank line between entries

]]]-->
## 11 research projects

### [mac-state](https://github.com/aled1027/research/tree/main/mac-state) (2025-11-29)

Mac State Monitor is a native macOS application designed to provide users with real-time visibility into their Mac's screen recording state. It identifies which apps currently have screen recording permissions and alerts users if any are actively recording, leveraging SwiftUI for a native interface and Apple's ScreenCaptureKit API. Users can run a quick command-line tool for instant status checks or build a full-featured GUI for ongoing monitoring, auto-refresh, and permission management. The architecture utilizes system state observation and heuristic app detection, but notes important limitations in full TCC database access and comprehensive detection of recording apps.

Key project resources:
- [ScreenCaptureKit Documentation](https://developer.apple.com/documentation/screencapturekit)
- [Swift Toolchain Downloads](https://www.swift.org/download/)

Key Findings:
- Current permission detection is heuristic-based and may miss some apps without direct TCC database access.
- Active recording detection is limited to known apps, with room for future enhancement.
- The open-source project runs entirely locally and restricts its permissions to ensure user privacy.

### [voxel-space-telescope](https://github.com/aled1027/research/tree/main/voxel-space-telescope) (2025-11-23)

The Voxel Space Telescope project transforms the Space Telescope Triptych into a dynamic, cube-based cosmic visualization using Three.js and an isometric orthographic camera. By leveraging Three.js's InstancedMesh, the scene efficiently animates over 1,700 individual cubes forming entities like Earth, satellites, data streams, cosmic formations, and a cube starfield—each with unique, per-cube animations and glow effects, entirely without post-processing. The isometric projection ensures a consistent blocky aesthetic and clear spatial relationships, while interactive controls enable real-time exploration in any modern browser. Design priorities focused on performance, recognizability, and the visual contrast of cubes as voxels. The implementation is self-contained; all you need is the [Three.js library](https://threejs.org/) and the provided [index.html](https://github.com/mrdoob/three.js/blob/dev/examples/index.html) file.

**Key findings and innovations:**
- Achieves real-time animation of 1,700+ cubes using InstancedMesh and a shared geometry, maximizing GPU performance.
- Adopts an orthographic isometric camera for consistent scale, clarity, and retro-style visuals.
- Eliminates post-processing, relying instead on material effects like additive blending and emissive lighting.
- Offers modular, maintainable class structure for voxel entities, supporting future extensibility.

### [space-telescope-triptych](https://github.com/aled1027/research/tree/main/space-telescope-triptych) (2025-11-23)

Inspired by a triptych artwork, this project presents an interactive 3D simulation that visually models the operations of a space telescope organization using [three.js](https://threejs.org/). The animation depicts celestial bodies emitting data, which satellites collect and transmit to Earth using dynamic particle streams along smooth, curved paths. Key visual details include glowing planets, detailed satellites, vibrant data flows, and a densely populated starfield—all rendered with optimized performance for modern browsers and interactive camera controls. The color scheme and movement faithfully capture the essence of the original artwork while enabling user exploration of the space data transmission workflow.

**Key Features:**
- Real-time orbital mechanics for celestial bodies and satellites  
- Data emission and transmission visualized via animated particle systems  
- Interactive controls using OrbitControls and intuitive camera movement  
- Pure HTML/JavaScript implementation—no build tools required  
- Atmospheric effects, glow, and dynamic lighting for visual depth

Explore the project source or try a live demo via [three.js examples](https://threejs.org/examples/).

### [research-repo-pwa](https://github.com/aled1027/research/tree/main/research-repo-pwa) (2025-11-22)

Transforming the AI Research Projects repository into a Progressive Web App (PWA) delivers an app-like, installable interface with robust offline support, specifically optimized for iPhone and mobile browsers. The redesign includes a service worker for smart caching, a manifest file for installability and branding, and tailored icons and meta tags for seamless home screen use and full-screen display on iOS. Minimal resource overhead ensures fast performance and ensures users can access content even without an internet connection after their initial visit. The core implementation leverages key technologies and best practices detailed in [MDN’s PWA documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps), and custom workflows like a Python-based icon generator.

**Key findings:**
- Offline loading and home screen installation work reliably across major browsers, including iOS Safari.
- Service worker implements a cache-first strategy for near-instant loading and robust offline access.
- Custom scripts and careful asset packaging minimize resource impact while supporting consistent cross-device branding.

### [threejs-quiz](https://github.com/aled1027/research/tree/main/threejs-quiz) (2025-11-22)

Designed as an interactive educational tool, the Three.js Mastery Quiz offers a comprehensive set of 50 multiple-choice questions that span beginner to advanced topics in 3D web development using [Three.js](https://threejs.org/). The application delivers instant feedback with in-depth explanations and embeds live 3D visualizations for key concepts, supporting both self-paced and classroom learning. Built as a single, easily deployable HTML file—leveraging CDN access to Three.js—it tracks student progress via local storage and works seamlessly across devices and modern browsers. Teachers can host and customize the quiz, adding their own questions or visual demos, while students benefit from auto-saved progress and detailed results analysis.

**Key Features:**
- Covers core topics: scene setup, geometry, materials, lighting, and advanced shaders.
- Responsive, mobile-friendly UI with progress tracking and reset controls.
- No build tools required; just open [index.html](https://threejs.org/examples/#webgl_animation_skinning_blending) in any WebGL-enabled browser.
- Open-source and modifiable for educational use.

### [threejs-quiz-fix](https://github.com/aled1027/research/tree/main/threejs-quiz-fix) (2025-11-22)

Addressing a display issue in a Three.js-powered quiz, the project fixed a problem where the visualization canvas remained blank because the renderer was initialized while the element was hidden (`display: none`) and thus received zero dimensions. The solution involved updating the renderer size and camera aspect immediately after the canvas becomes visible, and introducing a responsive resize event handler to maintain correct sizing when the window changes. These changes ensure the canvas correctly displays and adapts whenever quiz questions are answered or the browser is resized. For more details about Three.js, see [Three.js documentation](https://threejs.org/docs/).

Key changes:
- Renderer resizing logic added after making the canvas visible ensures correct display after quiz interaction.
- Responsive handler for window resizing guarantees persistent visualization integrity.

### [github-action-summaries](https://github.com/aled1027/research/tree/main/github-action-summaries) (2025-11-22)

Inspired by Simon Willison's open research workflow, this project streamlines documentation by automating the generation and maintenance of project summaries and indexes using GitHub Actions. It leverages [Simon Willison's llm CLI tool](https://github.com/simonw/llm) to create AI-powered summaries for each research project, caches these summaries for efficiency, and produces a responsive [index.html](https://github.com/simonw/research) for easy browsing. On every commit to the main branch, the system detects new projects, generates or updates summaries, and synchronizes both README.md and the HTML index, making research management effortless and consistent. Enhanced features include chronological listing, dynamic icon assignment, and badges for new projects.

**Key features:**
- Automated, cached AI summary generation via the llm CLI
- Instant README.md and index.html updates on code push
- Chronological sorting using git history
- Smart icons and “New” badges for projects
- Zero-maintenance workflow requiring no manual intervention

### [threejs-layer-quiz](https://github.com/aled1027/research/tree/main/threejs-layer-quiz) (2025-11-22)

Designed to reinforce core Three.js rendering concepts, the Layering Quiz presents 20 interactive multiple-choice questions that challenge users to predict visual outcomes based on specific material settings—covering depth testing, depth writing, render order, and blending modes. Each question not only assesses theoretical knowledge but also provides instant feedback, detailed explanations, and a live Three.js render illustrating the correct answer. The quiz supports structured learning by organizing questions into focused categories and integrates with the [Three.js Layering Demo](../threejs-layering/index.html), encouraging hands-on experimentation. Scoring and feedback mechanisms help users identify and target common mistakes in transparency, depth, and blending configuration.

**Key features & findings:**
- Highlights frequent errors, such as incorrect depthWrite settings on transparent objects and improper renderOrder usage.
- Reinforces when to use additive, multiply, or normal blending for various visual effects.
- Distinguishes effects of material type and settings on rendered outcomes.
- Built entirely with vanilla JavaScript and [Three.js](https://threejs.org/) ES6 modules for direct browser use.

### [threejs-layering](https://github.com/aled1027/research/tree/main/threejs-layering) (2025-11-22)

The Three.js Layering & Materials Teaching Tool is an interactive demo designed for intermediate developers to explore and understand how rendering order, depth testing, transparency, blending modes, and material types work in Three.js. Users manipulate live controls for overlapping colored planes, instantly visualizing how settings like `depthTest`, `depthWrite`, `renderOrder`, and blending affect 3D scene composition—especially transparent objects. Key learning scenarios and experiments illustrate common pitfalls and solutions, such as transparent object sorting and blending artifacts, while supporting multiple material types from MeshBasicMaterial to custom ShaderMaterial. The demo showcases the necessity of proper depth and blending handling for correct, artifact-free rendering and highlights performance considerations relevant to real projects. For hands-on use, see [the Three.js documentation](https://threejs.org/docs/) and browse related transparency topics in [Three.js Discourse](https://discourse.threejs.org/).

**Key findings:**
- Transparent objects require `depthWrite=false` and careful `renderOrder` for correct layering and blending.
- Different blending modes (normal, additive, multiply) enable varied visual effects but behave differently with opacity.
- Material choice impacts both rendering appearance and performance in live 3D scenes.
- Depth testing prevents visual artifacts and controls UI overlays versus scene depth.
- Custom shaders provide advanced control but demand GLSL and Three.js uniform management expertise.

### [is-my-lifestyle-inflating](https://github.com/aled1027/research/tree/main/is-my-lifestyle-inflating) (2025-11-07)

“Is My Lifestyle Inflating?” is an interactive web and Python CLI tool designed to help individuals detect and measure lifestyle inflation—especially those pursuing Financial Independence, Retire Early (FIRE). By analyzing personal financial data over time, it provides key metrics such as savings rate, personal inflation rate, discretionary spending ratio, and progress towards financial independence, with clear visualizations and actionable alerts. The tool distinguishes between essential and discretionary spending, compares personal trends to economic inflation (CPI), and identifies category-specific hotspots of rising expenses. All processing and data storage are local for privacy, making it safe and easy to use. Try it directly in your browser: [https://aled1027.github.io/research/is-my-lifestyle-inflating/](https://aled1027.github.io/research/is-my-lifestyle-inflating/) or via the [Python CLI](https://github.com/aled1027/research/blob/main/lifestyle_tracker.py).

**Key findings and features:**
- Savings rate decline is the primary warning for lifestyle inflation; category analysis pinpoints discretionary overspending.
- Personal inflation above CPI and a rising discretionary ratio signal concern.
- Most lifestyle inflation is gradual and category-specific, requiring regular tracking and context-specific interpretation.
- The tool is privacy-first and works offline, with no server-side data handling.

### [anki-git](https://github.com/aled1027/research/tree/main/anki-git) (2025-11-06)

The Anki Git Backup project introduces an add-on for [Anki](https://apps.ankiweb.net/) that automatically exports and backs up your entire flashcard collection to a Git repository in structured, human-readable JSON format. The tool enables both manual and scheduled backups, tracks all changes with Git commits, and optionally syncs your backup to a remote service like GitHub or GitLab. Inspired by the [Obsidian Git plugin](https://github.com/Vinzent03/obsidian-git), it provides version history, readable summaries, and is highly configurable without sending any data beyond your specified remote. Limitations include lack of media file backup and no direct restoration function; however, future support for these features is planned.

**Key features & findings:**
- Automatic and manual backups with customizable intervals and commit messages.
- Exports decks, cards, and notes in organized JSON, but currently no media backup.
- Structured history via Git; users can view, diff, and restore previous versions.
- High transparency and privacy—data stays local unless explicitly pushed to a remote repository.

<!--[[[end]]]-->

