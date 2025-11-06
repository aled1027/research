# Anki Git Backup Configuration

## git_repo_path
The absolute path to your Git repository where backups will be stored.
Example: `/home/user/anki-backup` or `C:\Users\Username\anki-backup`

Leave empty to disable backups until configured.

## auto_backup_enabled
Enable or disable automatic backups.
- `true`: Backups run automatically at the specified interval
- `false`: Only manual backups via Tools menu

## auto_backup_interval_minutes
How often (in minutes) to automatically back up your collection.
Minimum: 1 minute
Recommended: 10-30 minutes

## commit_message_template
Template for Git commit messages. You can use:
- `{timestamp}`: Current date and time
- `{cards}`: Total number of cards
- `{decks}`: Number of decks

Example: `Anki backup: {timestamp} - {cards} cards in {decks} decks`

## auto_push_enabled
Automatically push commits to the remote repository after each backup.
- `true`: Push to remote after each commit
- `false`: Only commit locally (you'll need to push manually)

## export_format
Format for exporting card data:
- `json`: Structured JSON format (recommended)
- `txt`: Plain text format
