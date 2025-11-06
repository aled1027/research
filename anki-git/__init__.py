"""
Anki Git Backup - A plugin to back up Anki collections to a Git repository
"""

import os
import json
import subprocess
from datetime import datetime
from typing import Optional, Dict, List, Any

from aqt import mw, gui_hooks
from aqt.qt import QAction, QTimer
from aqt.utils import showInfo, showWarning, tooltip


class AnkiGitBackup:
    """Main class for Anki Git Backup functionality"""

    def __init__(self):
        self.config = mw.addonManager.getConfig(__name__)
        self.timer: Optional[QTimer] = None
        self.setup_hooks()

    def setup_hooks(self):
        """Set up Anki hooks and menu items"""
        # Add menu item
        action = QAction("Backup to Git", mw)
        action.triggered.connect(self.manual_backup)
        mw.form.menuTools.addAction(action)

        # Set up automatic backup timer
        gui_hooks.profile_did_open.append(self.on_profile_open)
        gui_hooks.profile_will_close.append(self.on_profile_close)

    def on_profile_open(self):
        """Called when a profile is opened"""
        # Reload config
        self.config = mw.addonManager.getConfig(__name__)

        # Set up automatic backup if enabled
        if self.config.get("auto_backup_enabled", False):
            self.start_auto_backup()

    def on_profile_close(self):
        """Called when a profile is closed"""
        if self.timer:
            self.timer.stop()
            self.timer = None

    def start_auto_backup(self):
        """Start the automatic backup timer"""
        if self.timer:
            self.timer.stop()

        interval_minutes = self.config.get("auto_backup_interval_minutes", 10)
        interval_ms = interval_minutes * 60 * 1000

        self.timer = QTimer()
        self.timer.timeout.connect(self.auto_backup)
        self.timer.start(interval_ms)

        tooltip(f"Anki Git Backup: Auto-backup enabled (every {interval_minutes} minutes)")

    def manual_backup(self):
        """Perform a manual backup"""
        try:
            self.perform_backup()
            showInfo("Backup completed successfully!")
        except Exception as e:
            showWarning(f"Backup failed: {str(e)}")

    def auto_backup(self):
        """Perform an automatic backup"""
        try:
            self.perform_backup()
            tooltip("Anki Git Backup: Backup completed")
        except Exception as e:
            print(f"Anki Git Backup error: {str(e)}")

    def perform_backup(self):
        """Main backup logic"""
        # Check if git repo path is configured
        git_repo_path = self.config.get("git_repo_path", "")
        if not git_repo_path:
            raise Exception("Git repository path not configured. Please configure in Tools > Add-ons > Anki Git Backup > Config")

        if not os.path.exists(git_repo_path):
            raise Exception(f"Git repository path does not exist: {git_repo_path}")

        # Ensure it's a git repository
        if not os.path.exists(os.path.join(git_repo_path, ".git")):
            # Initialize git repo
            self.run_git_command(git_repo_path, ["git", "init"])

        # Export collection data
        self.export_collection(git_repo_path)

        # Git operations
        self.git_commit_and_push(git_repo_path)

    def export_collection(self, output_dir: str):
        """Export the Anki collection to files"""
        # Create backup directory structure
        backup_dir = os.path.join(output_dir, "anki-backup")
        os.makedirs(backup_dir, exist_ok=True)

        # Get collection stats
        col = mw.col

        # Export deck information
        decks_data = []
        deck_name_ids = col.decks.all_names_and_ids()

        for deck_name_id in deck_name_ids:
            deck_name = deck_name_id.name
            deck_id = deck_name_id.id
            deck = col.decks.get(deck_id)

            # Get cards in this deck
            card_ids = col.decks.cids(deck_id, children=False)

            deck_info = {
                "name": deck_name,
                "id": deck_id,
                "card_count": len(card_ids),
                "config": deck
            }

            # Export notes and cards for this deck
            notes_data = []
            for card_id in card_ids:
                card = col.get_card(card_id)
                note = col.get_note(card.nid)

                note_data = {
                    "note_id": note.id,
                    "model": note.note_type()["name"],
                    "fields": dict(zip([f["name"] for f in note.note_type()["flds"]], note.fields)),
                    "tags": note.tags,
                    "cards": []
                }

                # Add card info
                card_data = {
                    "card_id": card.id,
                    "queue": card.queue,
                    "due": card.due,
                    "ivl": card.ivl,
                    "factor": card.factor,
                    "reps": card.reps,
                    "lapses": card.lapses,
                }
                note_data["cards"].append(card_data)
                notes_data.append(note_data)

            deck_info["notes"] = notes_data
            decks_data.append(deck_info)

        # Write decks data to JSON file
        decks_file = os.path.join(backup_dir, "decks.json")
        with open(decks_file, "w", encoding="utf-8") as f:
            json.dump(decks_data, f, indent=2, ensure_ascii=False)

        # Export collection metadata
        metadata = {
            "timestamp": datetime.now().isoformat(),
            "total_cards": col.card_count(),
            "total_notes": col.note_count(),
            "deck_count": len(decks_data),
            "anki_version": mw.pm.meta.get("version", "unknown")
        }

        metadata_file = os.path.join(backup_dir, "metadata.json")
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        # Create a human-readable summary
        summary = self.create_summary(decks_data, metadata)
        summary_file = os.path.join(backup_dir, "summary.txt")
        with open(summary_file, "w", encoding="utf-8") as f:
            f.write(summary)

    def create_summary(self, decks_data: List[Dict], metadata: Dict) -> str:
        """Create a human-readable summary of the backup"""
        lines = [
            "# Anki Collection Backup Summary",
            "",
            f"Backup Date: {metadata['timestamp']}",
            f"Total Cards: {metadata['total_cards']}",
            f"Total Notes: {metadata['total_notes']}",
            f"Total Decks: {metadata['deck_count']}",
            "",
            "## Decks",
            ""
        ]

        for deck in decks_data:
            lines.append(f"- {deck['name']}: {deck['card_count']} cards")

        return "\n".join(lines)

    def git_commit_and_push(self, repo_path: str):
        """Commit and optionally push changes to Git"""
        # Stage all changes
        self.run_git_command(repo_path, ["git", "add", "-A"])

        # Check if there are changes to commit
        result = self.run_git_command(repo_path, ["git", "status", "--porcelain"])
        if not result.strip():
            # No changes to commit
            return

        # Create commit message
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        col = mw.col

        commit_template = self.config.get("commit_message_template", "Anki backup: {timestamp}")
        commit_message = commit_template.format(
            timestamp=timestamp,
            cards=col.card_count(),
            decks=len(col.decks.all_names_and_ids())
        )

        # Commit
        self.run_git_command(repo_path, ["git", "commit", "-m", commit_message])

        # Push if enabled
        if self.config.get("auto_push_enabled", True):
            try:
                self.run_git_command(repo_path, ["git", "push"])
            except Exception as e:
                # Push might fail if no remote is configured, or network issues
                print(f"Push failed (this is okay if no remote is configured): {str(e)}")

    def run_git_command(self, cwd: str, command: List[str]) -> str:
        """Run a git command in the specified directory"""
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout


# Initialize the plugin
anki_git_backup = AnkiGitBackup()
