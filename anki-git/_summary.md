The Anki Git Backup project introduces an add-on for [Anki](https://apps.ankiweb.net/) that automatically exports and backs up your entire flashcard collection to a Git repository in structured, human-readable JSON format. The tool enables both manual and scheduled backups, tracks all changes with Git commits, and optionally syncs your backup to a remote service like GitHub or GitLab. Inspired by the [Obsidian Git plugin](https://github.com/Vinzent03/obsidian-git), it provides version history, readable summaries, and is highly configurable without sending any data beyond your specified remote. Limitations include lack of media file backup and no direct restoration function; however, future support for these features is planned.

**Key features & findings:**
- Automatic and manual backups with customizable intervals and commit messages.
- Exports decks, cards, and notes in organized JSON, but currently no media backup.
- Structured history via Git; users can view, diff, and restore previous versions.
- High transparency and privacy—data stays local unless explicitly pushed to a remote repository.
