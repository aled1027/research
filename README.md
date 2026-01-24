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
## 23 research projects

### [gmail-client](https://github.com/aled1027/research/tree/main/gmail-client) (2026-01-24)

Built using Node.js/Express and the Gmail API, this project delivers a minimal, browser-based Gmail client with secure OAuth2 login, real-time inbox access, and email management. The intuitive Pico.css frontend allows users to view, search, read, compose, and delete emails—plus mark them as read automatically. Key Gmail features like query-based search and HTML email rendering are supported, and common tasks such as sending or trashing emails are streamlined via concise RESTful API endpoints. To run locally, users configure OAuth2 credentials from the [Google Cloud Console](https://console.cloud.google.com/) and launch with one command. The open-source codebase encourages customization for personal or team productivity needs ([see project repo](https://github.com/googleapis/google-api-nodejs-client)).

**Key features:**
- Secure Google sign-in and session management
- Fast inbox browsing, searching (Gmail syntax), and pagination
- Read, send, mark as read, and delete emails efficiently
- Modern, lightweight interface with Pico.css
- Easily extensible with Node.js and Express

### [youtube-to-text](https://github.com/aled1027/research/tree/main/youtube-to-text) (2026-01-22)

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

### [reader-v2-dark-mode-storage](https://github.com/aled1027/research/tree/main/reader-v2-dark-mode-storage) (2026-01-13)

Reader v2 has been upgraded to better support dark mode and enhance user reading experience by persisting text content and progress using localStorage. The bottom navigation controls now offer higher contrast, clearer button states, and improved separation in dark mode for greater readability. Users’ pasted text and reading positions are automatically saved to localStorage, allowing seamless session recovery: upon returning, users can resume where they left off or start fresh. These updates are implemented entirely within the `reader-v2/index.html` file, employing simple, robust storage operations. Explore the [Reader v2 app](#) or review [localStorage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for technical details.

Key improvements:
- Enhanced navigation control visibility and readability in dark mode
- Automatic session persistence (text and progress) via localStorage
- "Resume" feature for seamless reading continuity

### [reader-v2](https://github.com/aled1027/research/tree/main/reader-v2) (2026-01-13)

Reader v2 is a minimalist reading application that integrates sophisticated typographic features inspired by [TODS: Typography and OpenType Default Stylesheet](https://clagnut.com/blog/2433) to enhance on-screen reading comfort and fidelity. The app supports rich text input (including Google Docs formatting) and boasts modern OpenType features like ligatures, optical sizing, and language-aware quotes, as well as automatic dark mode with carefully tuned colors to minimize eye strain. It prioritizes a design philosophy where the interface fades away, allowing full immersion in the text, while all enhancements degrade gracefully in unsupported browsers. Reader v2 is delivered as a single, offline-capable HTML file requiring no external dependencies or data storage.

**Key features:**
- Professional typography: ligatures, kerning, hyphenation, optical sizing, smart quotes, and figure styles  
- Thoughtful dark mode design for reduced "bloom" and visual fatigue  
- Fully browser-based with no user data collection or internet requirement

### [reader](https://github.com/aled1027/research/tree/main/reader) (2026-01-13)

Inspired by human-centered UX principles, the Reader App is a minimalist web application designed to enhance the experience of reading long-form prose and fiction. The app focuses on usability and comfort, implementing research-backed decisions in typography, layout, color, and interaction to minimize distractions and promote immersion. It supports rich text input (e.g., from Google Docs), responsive design, and intuitive, low-friction navigation via keyboard, mouse, or touch — all within a standalone HTML file with no dependencies or data collection. Controls and UI elements are hidden by default and only revealed on interaction, ensuring the reading experience remains central.

**Key features and findings:**
- Optimal reading comfort through Georgia serif font, ideal line length (55-75 chars), and soft color scheme.
- Progressive disclosure of UI, fading controls when inactive for minimum visual clutter.
- Full offline support and privacy, with no external data storage or tracking.
- Efficient pagination boosts spatial memory, while navigation is accessible via multiple input methods.

Explore the project: [Reader App GitHub](https://github.com/yourusername/reader-app)  
Learn more about [typography in UX](https://practicaltypography.com/reading-long-text.html)

### [grammarly](https://github.com/aled1027/research/tree/main/grammarly) (2026-01-12)

Designed as a lightweight, AI-powered grammar checker in the browser, this project leverages Anthropic's Claude 3.5 Sonnet via the [OpenRouter API](https://openrouter.ai/) to analyze and suggest corrections for grammar, spelling, punctuation, style, and clarity. Built with vanilla HTML, CSS (via [Pico.css](https://picocss.com/)), and JavaScript, the tool features interactive, color-coded error highlighting with tooltips, allowing users to accept or dismiss suggestions. The API key is stored securely in local storage and the app requires no build process—just serve the static files for full functionality. Security is considered (local storage, XSS prevention), and customization options are provided for AI model selection and error highlighting.

**Key Highlights:**
- No build tools or external JS dependencies required; runs as pure static files
- Supports fine-grained, interactive grammar feedback through OpenRouter tool calling
- Responsive design for both desktop and mobile
- Simple testing and unit test suite included

### [incontext-lite-web](https://github.com/aled1027/research/tree/main/incontext-lite-web) (2025-12-29)

Leveraging Pyodide, InContext Lite Web brings Python-powered article simplification directly to the browser, allowing users to process and adapt reading material for language learners without server-side code. Users upload or paste text, select a target language and proficiency level, then receive a simplified article plus auto-generated comprehension questions—all performed on the client side via the OpenRouter API. The project minimally alters the original Python logic, using `pyfetch` for API requests and interactive HTML forms instead of file I/O or command-line input, providing a streamlined, accessible experience for language educators and learners. Explore the application [here](https://github.com/incontextlang/incontext-lite-web) and obtain an API key at [OpenRouter](https://openrouter.ai).

**Key features and findings:**
- Enables privacy-friendly, in-browser Python execution with Pyodide and async API calls  
- Adapts articles to any proficiency level and language, supporting a range of OpenRouter models  
- Output includes downloadable simplified content and comprehension exercises for learners

### [rolodex-research](https://github.com/aled1027/research/tree/main/rolodex-research) (2025-12-20)

Exploring how the physical rolodex metaphor can enhance modern web UX, this project presents five interactive scroll components powered by GSAP and ScrollTrigger, each leveraging viewport-spanning cards and 3D CSS transforms. The variations — classic rotating cards, 3D page-flip carousel, stacked depth cards, circular scroll wheel, and split-flap display — demonstrate distinct animation techniques, phased scroll-based transitions, and thoughtful UI indicators. Common design patterns include fixed card positioning, phased ScrollTrigger animation for enter/active/leave states, and performance-oriented use of GPU-accelerated transforms. The project offers practical code and demo files, providing a learn-by-example approach for adaptable implementation in portfolios, galleries, product tours, or presentations. Try the interactive examples and code at [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/) and the [Rolodex Research GitHub page](https://github.com/rolodex-research), if available.

**Key findings:**
- Phased animation (using 3-4 scroll stages) and perspective settings (1500–2000px) yield convincing 3D effects.
- Circular layouts require trigonometric positioning for smooth rotation and natural depth.
- Visual indicators (progress bars, navigation dots) are essential for user orientation.
- Fixed positioning and hardware-accelerated transforms ensure smooth performance across modern browsers.

### [threejs-toon-material](https://github.com/aled1027/research/tree/main/threejs-toon-material) (2025-12-20)

Three.js Toon Material Explorer is an interactive educational tool that empowers students to experiment with the properties of Three.js's `MeshToonMaterial`, enabling hands-on mastery of cel-shading and cartoon-style rendering. Users can tweak gradient maps, surface qualities, and lighting across nine curated presets, gaining insight into both soft pastel aesthetics and bold, high-contrast toon looks. The demo dynamically generates gradient textures using Three.js's `DataTexture`, illustrating how lighting quantization shapes visual style, while controls for roughness, metalness, and emissive properties highlight the material's versatility. Designed for browser-based use, the project supports direct exploration without a build process, making it ideal for both classroom demos and self-paced learning. Explore the live demo and documentation at [Three.js](https://threejs.org/) or host the project from your own browser.

**Key findings/concepts:**
- Gradient maps determine the number of shading bands, crucial for the toon effect (from classic 2-step comic style to smooth gradients).
- Material parameters like roughness, metalness, and emissive color can create a range of surface types, including glossy, metallic, and glowing cartoon objects.
- Lighting configuration (ambient/directional intensity, color) dramatically affects cel-shaded visuals; pastel tones require softer lighting, bold styles favor higher contrast.
- Flat shading produces faceted, low-poly looks ideal for stylized visuals and heavily enhances the cartoon feel.
- The project highlights the distinction between non-photorealistic rendering (NPR) and physically based rendering (PBR) in Three.js.

### [slack-app](https://github.com/aled1027/research/tree/main/slack-app) (2025-12-20)

The Slack Emoji Rewriter App is a Python-based Slack add-on that lets users preview and send emoji-enhanced messages via a slash command workflow, addressing Slack's inability to intercept messages before they're posted. Users can configure channel monitoring, compose messages using `/rewrite`, review both original and modified (with a smiley emoji) versions, and decide which version to post, all within an interactive UI powered by Slack Block Kit. The app operates in Socket Mode for easy deployment and leverages ephemeral messages for private previews, with message attribution as the bot due to API constraints. Key tools and documentation include the [Slack Bolt Framework](https://slack.dev/bolt-python) and the [Slack API docs](https://api.slack.com/docs), and the groundwork is laid for future upgrades like LLM-powered rewriting.

**Key findings/characteristics:**
- Slash commands offer a practical workaround for message interception limitations.
- Ephemeral messages provide a clean, user-centric preview experience.
- All message modifications are sent as the bot, not as the original user, due to Slack restrictions.
- The app is well-positioned for future enhancements, including AI-powered rewriting and custom emoji logic.

### [yjs-demo](https://github.com/aled1027/research/tree/main/yjs-demo) (2025-12-20)

Demonstrating real-time visitor presence in SvelteKit, this project integrates Yjs for local-first data synchronization and Cloudflare Durable Objects for persistent, distributed storage. Each connected browser tab updates its presence via a Yjs shared map—changes propagate seamlessly across clients using WebSockets, with Cloudflare Durable Objects handling state rebroadcast and persistence. The setup features a minimalist SvelteKit UI and separate worker deployments for Yjs and the app, enabling quick local development and easy deployment to Cloudflare's edge. Full instructions, worker configs, and source code are included for rapid experimentation.

**Key findings/tools:**
- **Yjs** enables granular presence state sharing with automatic conflict resolution.  
- **Cloudflare Durable Objects** provide efficient, persistent relaying and storage.  
- Minimal end-to-end example: [Demo App](https://yjs-sveltekit-demo.services-a01.workers.dev), [Yjs project](https://github.com/yjs/yjs).

### [yjs-demo-fix](https://github.com/aled1027/research/tree/main/yjs-demo-fix) (2025-12-20)

Visitors to a SvelteKit app deployed on Cloudflare Workers encountered 500 errors for all static assets because the worker configuration didn't specify how to serve these files. The root cause was missing `assets` and `nodejs_compat` settings in `wrangler.sveltekit.toml`; these are essential for enabling asset delivery and Node.js module compatibility with SvelteKit’s Cloudflare adapter. The fix involved explicitly defining the assets directory and binding, along with enabling Node.js compatibility—restoring proper loading of static resources. Key details and setup instructions are outlined in Cloudflare’s [SvelteKit deployment guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/) and the [adapter documentation](https://kit.svelte.dev/docs/adapter-cloudflare).

Key changes:
- Added `assets = { directory = ".svelte-kit/cloudflare", binding = "STATIC_ASSETS" }` to `wrangler.sveltekit.toml`
- Enabled `compatibility_flags = ["nodejs_compat"]`
- No more 500 errors; static assets load as expected

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

