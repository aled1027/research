#!/usr/bin/env python3
"""
Slack DM Sender CLI

Send direct messages from one user to another using user token impersonation.

Note: This requires a user OAuth token (xoxp-*) with chat:write scope.
The message will appear as if sent by the user who authorized the token.
"""

import argparse
import sys

try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
except ImportError:
    print("Error: slack_sdk not installed. Run: pip install slack-sdk")
    sys.exit(1)

from config import Config
from database import SlackDatabase


class SlackDMSender:
    """Send DMs using Slack user tokens."""

    def __init__(self, config: Config, db: SlackDatabase):
        self.config = config
        self.db = db

        if not config.user_token:
            raise ValueError(
                "SLACK_USER_TOKEN is required for sending messages as users. "
                "Set it in your environment."
            )

        # Use user token for sending messages
        self.client = WebClient(token=config.user_token)

    def get_user_id(self, identifier: str) -> str:
        """
        Get user ID from name, display name, email, or ID.

        Args:
            identifier: User name, display name, email, or ID

        Returns:
            Slack user ID
        """
        # Check if it's already a user ID
        if identifier.startswith("U") and len(identifier) > 8:
            return identifier

        # Try to find in local database first
        user = self.db.get_user_by_name(identifier)
        if user:
            return user["id"]

        # Try looking up by email via API
        try:
            response = self.client.users_lookupByEmail(email=identifier)
            return response["user"]["id"]
        except SlackApiError:
            pass

        # Try listing users and searching
        try:
            cursor = None
            while True:
                response = self.client.users_list(cursor=cursor, limit=200)
                for user in response.get("members", []):
                    profile = user.get("profile", {})
                    if (
                        user.get("name") == identifier
                        or profile.get("display_name") == identifier
                        or profile.get("real_name") == identifier
                        or profile.get("email") == identifier
                    ):
                        return user["id"]

                cursor = response.get("response_metadata", {}).get("next_cursor")
                if not cursor:
                    break
        except SlackApiError as e:
            print(f"Error looking up user: {e}")

        raise ValueError(f"Could not find user: {identifier}")

    def open_dm_channel(self, user_id: str) -> str:
        """
        Open a DM channel with a user.

        Args:
            user_id: Target user's Slack ID

        Returns:
            DM channel ID
        """
        try:
            response = self.client.conversations_open(users=[user_id])
            return response["channel"]["id"]
        except SlackApiError as e:
            raise ValueError(f"Could not open DM channel: {e}")

    def send_message(
        self,
        recipient: str,
        message: str,
        thread_ts: str = None
    ) -> dict:
        """
        Send a DM to a user.

        Args:
            recipient: Recipient user name, display name, email, or ID
            message: Message text to send
            thread_ts: Optional thread timestamp for replies

        Returns:
            API response dict
        """
        # Get recipient user ID
        recipient_id = self.get_user_id(recipient)

        # Open DM channel
        channel_id = self.open_dm_channel(recipient_id)

        # Send message
        try:
            kwargs = {
                "channel": channel_id,
                "text": message,
            }
            if thread_ts:
                kwargs["thread_ts"] = thread_ts

            response = self.client.chat_postMessage(**kwargs)

            return {
                "ok": True,
                "channel": channel_id,
                "ts": response["ts"],
                "message": response.get("message", {})
            }
        except SlackApiError as e:
            return {
                "ok": False,
                "error": str(e)
            }

    def list_users(self):
        """List available users from the database."""
        users = self.db.get_all_users()
        if not users:
            print("No users in database. Run collector.py first to populate.")
            return

        print(f"{'ID':<12} {'Name':<20} {'Display Name':<25} {'Email'}")
        print("-" * 80)
        for user in users:
            print(
                f"{user['id']:<12} "
                f"{user['name'] or '':<20} "
                f"{user['display_name'] or '':<25} "
                f"{user['email'] or ''}"
            )


def main():
    parser = argparse.ArgumentParser(
        description="Send Slack DMs as a user",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --to john.doe --message "Hello!"
  %(prog)s --to john.doe@company.com --message "Hello via email lookup"
  %(prog)s --to U12345678 --message "Hello via user ID"
  %(prog)s --list-users

Note: Messages are sent as the user who authorized the SLACK_USER_TOKEN.
To send as different users, you need their individual user tokens.
"""
    )

    parser.add_argument(
        "--to",
        type=str,
        help="Recipient (name, display name, email, or user ID)"
    )
    parser.add_argument(
        "--message", "-m",
        type=str,
        help="Message to send"
    )
    parser.add_argument(
        "--thread",
        type=str,
        help="Thread timestamp for replies"
    )
    parser.add_argument(
        "--list-users",
        action="store_true",
        help="List available users from database"
    )
    parser.add_argument(
        "--db",
        type=str,
        default="slack_messages.db",
        help="Database file path"
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

    if args.list_users:
        try:
            sender = SlackDMSender(config, db)
            sender.list_users()
        except ValueError as e:
            # Can list users without user token
            users = db.get_all_users()
            if not users:
                print("No users in database. Run collector.py first to populate.")
            else:
                print(f"{'ID':<12} {'Name':<20} {'Display Name':<25} {'Email'}")
                print("-" * 80)
                for user in users:
                    print(
                        f"{user['id']:<12} "
                        f"{user['name'] or '':<20} "
                        f"{user['display_name'] or '':<25} "
                        f"{user['email'] or ''}"
                    )
        return

    if not args.to or not args.message:
        parser.error("--to and --message are required for sending")

    try:
        sender = SlackDMSender(config, db)
        result = sender.send_message(
            recipient=args.to,
            message=args.message,
            thread_ts=args.thread
        )

        if result["ok"]:
            print(f"Message sent successfully!")
            print(f"  Channel: {result['channel']}")
            print(f"  Timestamp: {result['ts']}")
        else:
            print(f"Failed to send message: {result['error']}")
            sys.exit(1)

    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
