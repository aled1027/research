"""
Configuration management for Slack collector.
"""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Config:
    """Configuration for Slack collector."""

    # Slack tokens
    bot_token: str  # xoxb-* token for bot operations
    user_token: str  # xoxp-* token for user operations (sending as user)

    # Database
    db_path: str = "slack_messages.db"

    # Collection settings
    fetch_limit: int = 200  # Messages per API call
    include_archived: bool = False

    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables."""
        bot_token = os.environ.get("SLACK_BOT_TOKEN", "")
        user_token = os.environ.get("SLACK_USER_TOKEN", "")

        if not bot_token:
            raise ValueError(
                "SLACK_BOT_TOKEN environment variable is required. "
                "Get it from https://api.slack.com/apps -> OAuth & Permissions"
            )

        if not user_token:
            print(
                "Warning: SLACK_USER_TOKEN not set. "
                "User impersonation features will not work."
            )

        return cls(
            bot_token=bot_token,
            user_token=user_token,
            db_path=os.environ.get("SLACK_DB_PATH", "slack_messages.db"),
            fetch_limit=int(os.environ.get("SLACK_FETCH_LIMIT", "200")),
            include_archived=os.environ.get("SLACK_INCLUDE_ARCHIVED", "").lower() == "true"
        )


def create_env_template():
    """Create a template .env file."""
    template = """# Slack Collector Configuration

# Bot token (xoxb-*) - Required for collecting messages
# Get from: https://api.slack.com/apps -> Your App -> OAuth & Permissions -> Bot User OAuth Token
# Required scopes: channels:history, channels:read, groups:history, groups:read,
#                  im:history, im:read, mpim:history, mpim:read, users:read
SLACK_BOT_TOKEN=xoxb-your-bot-token

# User token (xoxp-*) - Required for sending messages as users
# Get from: https://api.slack.com/apps -> Your App -> OAuth & Permissions -> User OAuth Token
# Required scopes: chat:write
SLACK_USER_TOKEN=xoxp-your-user-token

# Database path (optional, defaults to slack_messages.db)
SLACK_DB_PATH=slack_messages.db

# Number of messages to fetch per API call (optional, defaults to 200)
SLACK_FETCH_LIMIT=200

# Include archived channels (optional, defaults to false)
SLACK_INCLUDE_ARCHIVED=false
"""
    return template


if __name__ == "__main__":
    # Generate .env template
    env_path = Path(".env.template")
    env_path.write_text(create_env_template())
    print(f"Created {env_path}")
