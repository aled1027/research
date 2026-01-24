"""
Configuration management for Slack collector.
"""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Config:
    """Configuration for Slack collector."""

    # Slack token
    user_token: str  # xoxp-* token for all operations

    # Database
    db_path: str = "slack_messages.db"

    # Collection settings
    fetch_limit: int = 200  # Messages per API call
    include_archived: bool = False

    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables."""
        user_token = os.environ.get("SLACK_USER_TOKEN", "")

        if not user_token:
            raise ValueError(
                "SLACK_USER_TOKEN environment variable is required. "
                "Get it from https://api.slack.com/apps -> OAuth & Permissions"
            )

        return cls(
            user_token=user_token,
            db_path=os.environ.get("SLACK_DB_PATH", "slack_messages.db"),
            fetch_limit=int(os.environ.get("SLACK_FETCH_LIMIT", "200")),
            include_archived=os.environ.get("SLACK_INCLUDE_ARCHIVED", "").lower() == "true"
        )


def create_env_template():
    """Create a template .env file."""
    template = """# Slack Collector Configuration
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
