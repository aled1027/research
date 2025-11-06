# Anki Git Backup

An Anki add-on that automatically backs up your Anki collection to a Git repository, creating a commit history of all your changes over time. This allows you to:

- 📚 Keep a version-controlled history of all your cards and decks
- 🔄 Track changes to your flashcards over time
- ☁️ Automatically sync your backups to GitHub, GitLab, or any Git remote
- 🔒 Have peace of mind with regular automated backups
- 📊 View readable JSON exports of your entire collection

Inspired by the [Obsidian Git plugin](https://github.com/Vinzent03/obsidian-git).

## Features

- **Manual Backup**: Trigger a backup anytime from the Tools menu
- **Automatic Backup**: Schedule automatic backups at configurable intervals (e.g., every 10 minutes)
- **Git Integration**: Automatically commits and optionally pushes to a remote repository
- **Structured Export**: Exports your decks, cards, and notes in organized JSON format
- **Human-Readable Summary**: Includes a summary.txt with backup statistics
- **Configurable**: Customize commit messages, backup intervals, and more

## Installation

### Method 1: Manual Installation (Recommended for Development)

1. **Locate your Anki add-ons folder**:
   - **Windows**: `%APPDATA%\Anki2\addons21`
   - **Mac**: `~/Library/Application Support/Anki2/addons21`
   - **Linux**: `~/.local/share/Anki2/addons21`

   You can also find it by opening Anki, going to **Tools → Add-ons**, and clicking **View Files**.

2. **Create the plugin folder**:
   ```bash
   cd /path/to/addons21
   mkdir anki-git-backup
   ```

3. **Copy the plugin files**:
   Copy these files into the `anki-git-backup` folder:
   - `__init__.py`
   - `manifest.json`
   - `config.json`
   - `config.md`

4. **Restart Anki**

### Method 2: Using AnkiWeb (Future)

Once published to AnkiWeb, you'll be able to install via the add-on code. (Not yet available)

## Configuration

### Initial Setup

1. **Open Anki** and go to **Tools → Add-ons**
2. Select **Anki Git Backup** and click **Config**
3. Set your configuration:

```json
{
  "git_repo_path": "/path/to/your/backup/repo",
  "auto_backup_enabled": true,
  "auto_backup_interval_minutes": 10,
  "commit_message_template": "Anki backup: {timestamp}",
  "auto_push_enabled": true,
  "export_format": "json"
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `git_repo_path` | Absolute path to your Git repository | `""` (empty) |
| `auto_backup_enabled` | Enable automatic backups | `false` |
| `auto_backup_interval_minutes` | Backup interval in minutes | `10` |
| `commit_message_template` | Template for commit messages (supports `{timestamp}`, `{cards}`, `{decks}`) | `"Anki backup: {timestamp}"` |
| `auto_push_enabled` | Automatically push commits to remote | `true` |
| `export_format` | Export format (`json` or `txt`) | `"json"` |

### Setting Up Your Git Repository

1. **Create a backup directory**:
   ```bash
   mkdir ~/anki-backup
   cd ~/anki-backup
   git init
   ```

2. **(Optional) Add a remote repository**:
   ```bash
   git remote add origin https://github.com/yourusername/anki-backup.git
   ```

3. **Set the path in the plugin config**:
   Update `git_repo_path` to your backup directory (e.g., `/home/user/anki-backup`)

4. **Restart Anki** to apply the configuration

## Usage

### Manual Backup

1. Go to **Tools → Backup to Git**
2. The plugin will export your collection and create a Git commit
3. If `auto_push_enabled` is true, it will also push to your remote

### Automatic Backup

Once configured with `auto_backup_enabled: true`, the plugin will:
1. Start automatically when you open your Anki profile
2. Back up your collection at the specified interval
3. Show a tooltip notification after each successful backup

### What Gets Backed Up

The plugin creates a structured backup in your Git repository:

```
anki-backup/
├── decks.json          # All decks with cards and notes
├── metadata.json       # Collection statistics
└── summary.txt         # Human-readable summary
```

#### Example `decks.json` Structure:
```json
[
  {
    "name": "Spanish::Vocabulary",
    "id": 1234567890,
    "card_count": 250,
    "notes": [
      {
        "note_id": 1234567891,
        "model": "Basic",
        "fields": {
          "Front": "hola",
          "Back": "hello"
        },
        "tags": ["spanish", "greetings"],
        "cards": [
          {
            "card_id": 1234567892,
            "queue": 2,
            "due": 15,
            "ivl": 30,
            "reps": 5
          }
        ]
      }
    ]
  }
]
```

#### Example `summary.txt`:
```
# Anki Collection Backup Summary

Backup Date: 2025-11-06T10:30:00
Total Cards: 1,234
Total Notes: 856
Total Decks: 15

## Decks

- Spanish::Vocabulary: 250 cards
- Japanese::Kanji: 180 cards
- Computer Science: 304 cards
...
```

## Viewing Your Backup History

Since your backups are stored in Git, you can:

1. **View commit history**:
   ```bash
   cd ~/anki-backup
   git log --oneline
   ```

2. **See what changed**:
   ```bash
   git diff HEAD~1 HEAD
   ```

3. **Restore a previous version**:
   ```bash
   git checkout <commit-hash>
   ```

4. **View on GitHub/GitLab**: If you've pushed to a remote, you can browse your backup history online

## Troubleshooting

### "Git repository path not configured"
- Make sure you've set the `git_repo_path` in the add-on configuration
- The path must be absolute (e.g., `/home/user/anki-backup`, not `~/anki-backup`)

### "Git repository path does not exist"
- Create the directory first: `mkdir /path/to/backup`
- Make sure the path is correct and accessible

### Push fails
- This is normal if you haven't set up a remote repository
- To set up a remote: `git remote add origin <url>` in your backup directory
- Make sure you have push access to the remote repository

### Backup not running automatically
- Check that `auto_backup_enabled` is set to `true` in the config
- Restart Anki after changing the configuration
- Check the Anki console for any error messages (Tools → Debug Console)

## Development

### Project Structure

```
anki-git-backup/
├── __init__.py         # Main plugin code
├── manifest.json       # Plugin metadata
├── config.json         # Default configuration
└── config.md          # Configuration documentation
```

### Key Components

- **AnkiGitBackup class**: Main plugin logic
- **setup_hooks()**: Registers menu items and hooks
- **export_collection()**: Exports Anki data to JSON
- **git_commit_and_push()**: Handles Git operations
- **QTimer**: Manages automatic backup scheduling

### Testing

To test the plugin:
1. Install it in your Anki add-ons folder
2. Set up a test Git repository
3. Configure the plugin
4. Trigger a manual backup from Tools menu
5. Check that files are created and committed

## Privacy & Security

- All data is stored locally in your specified Git repository
- If you push to a remote, ensure it's a private repository (unless you want your flashcards public)
- The plugin does not send data anywhere except to your configured Git remote
- No analytics or telemetry is collected

## Limitations

- The plugin exports data in JSON format, which is not directly importable back into Anki (it's for backup/archival purposes)
- Media files (images, audio) are not currently backed up (only text content)
- Very large collections (100,000+ cards) may take longer to export

## Future Enhancements

- [ ] Media file backup support
- [ ] Selective deck backup
- [ ] Restore functionality
- [ ] Backup scheduling options (e.g., only on sync)
- [ ] Backup on collection changes
- [ ] Diff view in Anki

## Contributing

This is an open-source project. Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify as needed.

## Credits

- Inspired by [Obsidian Git](https://github.com/Vinzent03/obsidian-git)
- Built for the Anki community

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Check the Anki console for error messages
3. Open an issue on GitHub with details about your setup and the error

---

**Note**: This plugin is not affiliated with or endorsed by Anki. Anki is a trademark of Damien Elmes.
