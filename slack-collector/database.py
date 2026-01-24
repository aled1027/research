"""
SQLite database operations for Slack message storage.
"""

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional


class SlackDatabase:
    """Manages SQLite database for Slack messages."""

    def __init__(self, db_path: str = "slack_messages.db"):
        self.db_path = Path(db_path)
        self.conn: Optional[sqlite3.Connection] = None
        self._init_db()

    def _init_db(self):
        """Initialize the database with required tables."""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row

        cursor = self.conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                display_name TEXT,
                real_name TEXT,
                email TEXT,
                is_bot INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Channels table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS channels (
                id TEXT PRIMARY KEY,
                name TEXT,
                type TEXT,  -- 'channel', 'im', 'mpim', 'private'
                is_private INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Messages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id TEXT NOT NULL,
                user_id TEXT,
                text TEXT,
                ts TEXT NOT NULL,
                thread_ts TEXT,
                message_type TEXT DEFAULT 'message',
                raw_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(channel_id, ts),
                FOREIGN KEY (channel_id) REFERENCES channels(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Reactions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                user_id TEXT NOT NULL,
                FOREIGN KEY (message_id) REFERENCES messages(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Index for faster lookups
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages(ts)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id)")

        self.conn.commit()

    def upsert_user(self, user_data: dict):
        """Insert or update a user."""
        cursor = self.conn.cursor()
        profile = user_data.get("profile", {})

        cursor.execute("""
            INSERT INTO users (id, name, display_name, real_name, email, is_bot, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                display_name = excluded.display_name,
                real_name = excluded.real_name,
                email = excluded.email,
                is_bot = excluded.is_bot,
                updated_at = excluded.updated_at
        """, (
            user_data.get("id"),
            user_data.get("name"),
            profile.get("display_name"),
            profile.get("real_name"),
            profile.get("email"),
            1 if user_data.get("is_bot") else 0,
            datetime.now().isoformat()
        ))
        self.conn.commit()

    def upsert_channel(self, channel_data: dict):
        """Insert or update a channel."""
        cursor = self.conn.cursor()

        # Determine channel type
        if channel_data.get("is_im"):
            channel_type = "im"
        elif channel_data.get("is_mpim"):
            channel_type = "mpim"
        elif channel_data.get("is_private"):
            channel_type = "private"
        else:
            channel_type = "channel"

        cursor.execute("""
            INSERT INTO channels (id, name, type, is_private, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                type = excluded.type,
                is_private = excluded.is_private,
                updated_at = excluded.updated_at
        """, (
            channel_data.get("id"),
            channel_data.get("name", channel_data.get("id")),
            channel_type,
            1 if channel_data.get("is_private") else 0,
            datetime.now().isoformat()
        ))
        self.conn.commit()

    def insert_message(self, channel_id: str, message_data: dict) -> Optional[int]:
        """Insert a message, returns message id or None if duplicate."""
        cursor = self.conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO messages (channel_id, user_id, text, ts, thread_ts, message_type, raw_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                channel_id,
                message_data.get("user"),
                message_data.get("text"),
                message_data.get("ts"),
                message_data.get("thread_ts"),
                message_data.get("type", "message"),
                str(message_data)
            ))
            self.conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            # Duplicate message (same channel_id and ts)
            return None

    def get_latest_message_ts(self, channel_id: str) -> Optional[str]:
        """Get the timestamp of the latest message in a channel."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT ts FROM messages
            WHERE channel_id = ?
            ORDER BY ts DESC
            LIMIT 1
        """, (channel_id,))
        row = cursor.fetchone()
        return row["ts"] if row else None

    def get_user_by_name(self, name: str) -> Optional[dict]:
        """Find a user by name or display name."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM users
            WHERE name = ? OR display_name = ? OR real_name = ?
        """, (name, name, name))
        row = cursor.fetchone()
        return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Find a user by ID."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    def get_all_users(self) -> list:
        """Get all users."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY name")
        return [dict(row) for row in cursor.fetchall()]

    def get_all_channels(self) -> list:
        """Get all channels."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM channels ORDER BY name")
        return [dict(row) for row in cursor.fetchall()]

    def get_messages(self, channel_id: str = None, limit: int = 100) -> list:
        """Get messages, optionally filtered by channel."""
        cursor = self.conn.cursor()
        if channel_id:
            cursor.execute("""
                SELECT m.*, u.name as user_name, c.name as channel_name
                FROM messages m
                LEFT JOIN users u ON m.user_id = u.id
                LEFT JOIN channels c ON m.channel_id = c.id
                WHERE m.channel_id = ?
                ORDER BY m.ts DESC
                LIMIT ?
            """, (channel_id, limit))
        else:
            cursor.execute("""
                SELECT m.*, u.name as user_name, c.name as channel_name
                FROM messages m
                LEFT JOIN users u ON m.user_id = u.id
                LEFT JOIN channels c ON m.channel_id = c.id
                ORDER BY m.ts DESC
                LIMIT ?
            """, (limit,))
        return [dict(row) for row in cursor.fetchall()]

    def get_stats(self) -> dict:
        """Get database statistics."""
        cursor = self.conn.cursor()

        cursor.execute("SELECT COUNT(*) as count FROM users")
        users_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM channels")
        channels_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM messages")
        messages_count = cursor.fetchone()["count"]

        return {
            "users": users_count,
            "channels": channels_count,
            "messages": messages_count
        }

    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
