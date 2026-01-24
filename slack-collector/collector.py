#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "slack-sdk>=3.21.0",
#     "python-dotenv>=1.0.0",
# ]
# ///
"""
Slack Message Collector

Collects messages from Slack and stores them in a local SQLite database.
"""

from dotenv import load_dotenv
load_dotenv()

import argparse
import sys
import time
from typing import Optional

try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
except ImportError:
    print("Error: slack_sdk not installed. Run: pip install slack-sdk")
    sys.exit(1)

from config import Config
from database import SlackDatabase


class SlackCollector:
    """Collects Slack messages and stores them in SQLite."""

    def __init__(self, config: Config, db: SlackDatabase):
        self.config = config
        self.db = db
        self.client = WebClient(token=config.bot_token)
        self._rate_limit_delay = 1.0  # seconds between API calls

    def _handle_rate_limit(self, retry_after: int = 1):
        """Handle rate limiting by waiting."""
        print(f"  Rate limited, waiting {retry_after}s...")
        time.sleep(retry_after)

    def collect_users(self) -> int:
        """Fetch and store all users."""
        print("Collecting users...")
        count = 0
        cursor = None

        while True:
            try:
                response = self.client.users_list(cursor=cursor, limit=200)
                users = response.get("members", [])

                for user in users:
                    if not user.get("deleted"):
                        self.db.upsert_user(user)
                        count += 1

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

                time.sleep(self._rate_limit_delay)

            except SlackApiError as e:
                if e.response.get("error") == "ratelimited":
                    self._handle_rate_limit(int(e.response.headers.get("Retry-After", 1)))
                else:
                    print(f"Error fetching users: {e}")
                    break

        print(f"  Collected {count} users")
        return count

    def collect_channels(self) -> int:
        """Fetch and store all channels (public, private, DMs, group DMs)."""
        print("Collecting channels...")
        count = 0

        # Public channels
        count += self._collect_channel_type("public_channel")

        # Private channels
        count += self._collect_channel_type("private_channel")

        # Direct messages
        count += self._collect_ims()

        # Group direct messages
        count += self._collect_mpims()

        print(f"  Collected {count} channels total")
        return count

    def _collect_channel_type(self, channel_type: str) -> int:
        """Collect channels of a specific type."""
        count = 0
        cursor = None

        while True:
            try:
                response = self.client.conversations_list(
                    cursor=cursor,
                    limit=200,
                    types=channel_type,
                    exclude_archived=not self.config.include_archived
                )
                channels = response.get("channels", [])

                for channel in channels:
                    self.db.upsert_channel(channel)
                    count += 1

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

                time.sleep(self._rate_limit_delay)

            except SlackApiError as e:
                if e.response.get("error") == "ratelimited":
                    self._handle_rate_limit(int(e.response.headers.get("Retry-After", 1)))
                elif e.response.get("error") == "missing_scope":
                    print(f"  Skipping {channel_type} (missing scope)")
                    break
                else:
                    print(f"Error fetching {channel_type}: {e}")
                    break

        return count

    def _collect_ims(self) -> int:
        """Collect direct message channels."""
        count = 0
        cursor = None

        while True:
            try:
                response = self.client.conversations_list(
                    cursor=cursor,
                    limit=200,
                    types="im"
                )
                channels = response.get("channels", [])

                for channel in channels:
                    self.db.upsert_channel(channel)
                    count += 1

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

                time.sleep(self._rate_limit_delay)

            except SlackApiError as e:
                if e.response.get("error") == "ratelimited":
                    self._handle_rate_limit(int(e.response.headers.get("Retry-After", 1)))
                elif e.response.get("error") == "missing_scope":
                    print("  Skipping IMs (missing scope)")
                    break
                else:
                    print(f"Error fetching IMs: {e}")
                    break

        # Also collect self-DM (messages to yourself)
        count += self._collect_self_dm()

        return count

    def _collect_self_dm(self) -> int:
        """Collect the DM channel with yourself (notes to self)."""
        try:
            # Get the bot's own user ID
            auth_response = self.client.auth_test()
            own_user_id = auth_response.get("user_id")
            
            if not own_user_id:
                return 0

            # Open/get the DM channel with yourself
            response = self.client.conversations_open(users=[own_user_id])
            channel = response.get("channel", {})
            
            if channel:
                self.db.upsert_channel(channel)
                print(f"  Found self-DM channel: {channel.get('id')}")
                return 1

        except SlackApiError as e:
            if e.response.get("error") == "cannot_dm_bot":
                print("  Skipping self-DM (bot cannot DM itself)")
            elif e.response.get("error") != "missing_scope":
                print(f"  Could not get self-DM: {e.response.get('error')}")
        
        return 0

    def _collect_mpims(self) -> int:
        """Collect group direct message channels."""
        count = 0
        cursor = None

        while True:
            try:
                response = self.client.conversations_list(
                    cursor=cursor,
                    limit=200,
                    types="mpim"
                )
                channels = response.get("channels", [])

                for channel in channels:
                    self.db.upsert_channel(channel)
                    count += 1

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

                time.sleep(self._rate_limit_delay)

            except SlackApiError as e:
                if e.response.get("error") == "ratelimited":
                    self._handle_rate_limit(int(e.response.headers.get("Retry-After", 1)))
                elif e.response.get("error") == "missing_scope":
                    print("  Skipping MPIMs (missing scope)")
                    break
                else:
                    print(f"Error fetching MPIMs: {e}")
                    break

        return count

    def collect_messages(self, channel_id: Optional[str] = None, full_history: bool = False) -> int:
        """Collect messages from channels."""
        print("Collecting messages...")
        total_count = 0

        # Get channels to process
        if channel_id:
            channels = [{"id": channel_id}]
        else:
            channels = self.db.get_all_channels()

        for channel in channels:
            cid = channel["id"]
            channel_name = channel.get("name", cid)

            # Get oldest timestamp if we're doing incremental update
            oldest = None
            if not full_history:
                oldest = self.db.get_latest_message_ts(cid)

            count = self._collect_channel_messages(cid, oldest=oldest)
            if count > 0:
                print(f"  {channel_name}: {count} messages")
            total_count += count

        print(f"  Collected {total_count} messages total")
        return total_count

    def _collect_channel_messages(
        self,
        channel_id: str,
        oldest: Optional[str] = None
    ) -> int:
        """Collect messages from a single channel."""
        count = 0
        cursor = None

        while True:
            try:
                kwargs = {
                    "channel": channel_id,
                    "limit": self.config.fetch_limit,
                }
                if cursor:
                    kwargs["cursor"] = cursor
                if oldest:
                    kwargs["oldest"] = oldest

                response = self.client.conversations_history(**kwargs)
                messages = response.get("messages", [])

                for message in messages:
                    result = self.db.insert_message(channel_id, message)
                    if result is not None:
                        count += 1

                    # Collect thread replies if present
                    if message.get("reply_count", 0) > 0:
                        thread_count = self._collect_thread_replies(
                            channel_id,
                            message["ts"]
                        )
                        count += thread_count

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

                time.sleep(self._rate_limit_delay)

            except SlackApiError as e:
                if e.response.get("error") == "ratelimited":
                    self._handle_rate_limit(int(e.response.headers.get("Retry-After", 1)))
                elif e.response.get("error") in ("channel_not_found", "not_in_channel"):
                    break
                else:
                    print(f"Error fetching messages from {channel_id}: {e}")
                    break

        return count

    def _collect_thread_replies(self, channel_id: str, thread_ts: str) -> int:
        """Collect replies in a thread."""
        count = 0
        cursor = None

        while True:
            try:
                kwargs = {
                    "channel": channel_id,
                    "ts": thread_ts,
                    "limit": self.config.fetch_limit,
                }
                if cursor:
                    kwargs["cursor"] = cursor

                response = self.client.conversations_replies(**kwargs)
                messages = response.get("messages", [])

                # Skip the first message (parent) as it's already collected
                for message in messages[1:]:
                    result = self.db.insert_message(channel_id, message)
                    if result is not None:
                        count += 1

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break

                time.sleep(self._rate_limit_delay)

            except SlackApiError as e:
                if e.response.get("error") == "ratelimited":
                    self._handle_rate_limit(int(e.response.headers.get("Retry-After", 1)))
                else:
                    break

        return count

    def run(self, full_history: bool = False, channel_id: Optional[str] = None):
        """Run the full collection process."""
        print("Starting Slack message collection...")
        print(f"Database: {self.db.db_path}")
        print()

        # Collect users first (needed for message attribution)
        self.collect_users()

        # Collect channels
        self.collect_channels()

        # Collect messages
        self.collect_messages(channel_id=channel_id, full_history=full_history)

        # Print stats
        stats = self.db.get_stats()
        print()
        print("Collection complete!")
        print(f"  Users: {stats['users']}")
        print(f"  Channels: {stats['channels']}")
        print(f"  Messages: {stats['messages']}")


def main():
    parser = argparse.ArgumentParser(
        description="Collect Slack messages and store in SQLite"
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Collect full history (default: incremental)"
    )
    parser.add_argument(
        "--channel",
        type=str,
        help="Only collect from specific channel ID"
    )
    parser.add_argument(
        "--db",
        type=str,
        default="slack_messages.db",
        help="Database file path"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Just show database statistics"
    )

    args = parser.parse_args()

    # Load config
    try:
        config = Config.from_env()
    except ValueError as e:
        print(f"Configuration error: {e}")
        sys.exit(1)

    # Override db path if specified
    if args.db:
        config.db_path = args.db

    # Initialize database
    db = SlackDatabase(config.db_path)

    if args.stats:
        stats = db.get_stats()
        print(f"Database: {config.db_path}")
        print(f"  Users: {stats['users']}")
        print(f"  Channels: {stats['channels']}")
        print(f"  Messages: {stats['messages']}")
        return

    # Run collector
    collector = SlackCollector(config, db)
    try:
        collector.run(full_history=args.full, channel_id=args.channel)
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    finally:
        db.close()


if __name__ == "__main__":
    main()
