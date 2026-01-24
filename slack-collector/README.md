# Slack Message Collector

A Python tool for collecting Slack messages and storing them in a local SQLite database, plus a CLI for sending DMs.

## Features

- **Message Collection**: Collects messages from public channels, private channels, DMs, and group DMs
- **Incremental Updates**: Only fetches new messages since last collection
- **Thread Support**: Collects thread replies along with main messages
- **User/Channel Tracking**: Stores user and channel metadata
- **DM Sender**: CLI tool to send direct messages via user token

## Setup

### 1. Install Dependencies

The scripts use [PEP 723 inline script metadata](https://peps.python.org/pep-0723/), so you can run them directly with `uvx` (no installation required):

```bash
# Run with uvx (recommended - auto-installs dependencies)
uvx collector.py
uvx send_dm.py --help
```

Or install as a package:

```bash
# Install with uv
uv pip install .

# Then run
slack-collect
slack-dm --help
```

Or traditional pip:

```bash
pip install -r requirements.txt
python collector.py
```

### 2. Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" > "From scratch"
3. Name your app and select your workspace

### 3. Configure OAuth Scopes

Navigate to **OAuth & Permissions** and add these scopes:

**Bot Token Scopes** (for collecting messages):
- `channels:history` - View messages in public channels
- `channels:read` - View basic channel info
- `groups:history` - View messages in private channels
- `groups:read` - View basic private channel info
- `im:history` - View messages in direct messages
- `im:read` - View basic DM info
- `mpim:history` - View messages in group DMs
- `mpim:read` - View basic group DM info
- `users:read` - View users and their basic info
- `users:read.email` - View email addresses (optional)

**User Token Scopes** (for sending DMs as user):
- `chat:write` - Send messages as the user

### 4. Install the App

1. Go to **Install App** in your Slack app settings
2. Click "Install to Workspace"
3. Authorize the requested permissions
4. Copy the **Bot User OAuth Token** (`xoxb-...`)
5. Copy the **User OAuth Token** (`xoxp-...`)

### 5. Set Environment Variables

```bash
export SLACK_USER_TOKEN="xoxp-your-user-token"
```

Or create a `.env` file:

```bash
SLACK_USER_TOKEN=xoxp-your-user-token
SLACK_DB_PATH=slack_messages.db
```

## Usage

### Collecting Messages

```bash
# Run full collection (users, channels, messages)
uvx collector.py

# Collect full history (not just incremental)
uvx collector.py --full

# Collect from specific channel only
uvx collector.py --channel C1234567890

# Use custom database file
uvx collector.py --db my_slack.db

# Show database statistics
uvx collector.py --stats
```

### Sending DMs

```bash
# Send a DM to a user by name
uvx send_dm.py --to john.doe --message "Hello!"

# Send to user by email
uvx send_dm.py --to john@company.com --message "Hello!"

# Send to user by Slack ID
uvx send_dm.py --to U1234567890 --message "Hello!"

# Reply in a thread
uvx send_dm.py --to john.doe --message "Reply" --thread 1234567890.123456

# List available users
uvx send_dm.py --list-users
```

## Database Schema

The SQLite database contains these tables:

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Slack user ID (primary key) |
| name | TEXT | Username |
| display_name | TEXT | Display name |
| real_name | TEXT | Full name |
| email | TEXT | Email address |
| is_bot | INTEGER | 1 if bot, 0 otherwise |
| updated_at | TIMESTAMP | Last update time |

### `channels`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Slack channel ID (primary key) |
| name | TEXT | Channel name |
| type | TEXT | channel/im/mpim/private |
| is_private | INTEGER | 1 if private, 0 otherwise |
| updated_at | TIMESTAMP | Last update time |

### `messages`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment ID |
| channel_id | TEXT | Channel ID (foreign key) |
| user_id | TEXT | User ID (foreign key) |
| text | TEXT | Message content |
| ts | TEXT | Slack timestamp |
| thread_ts | TEXT | Parent thread timestamp |
| message_type | TEXT | Message type |
| raw_json | TEXT | Original JSON |
| created_at | TIMESTAMP | Collection time |

## Important Notes

### About User Impersonation

The `send_dm.py` script sends messages using the **User OAuth Token**. This means:

- Messages appear as if sent by the user who authorized the token
- You cannot send as arbitrary users - only as the token owner
- To send as different users, you need each user's individual token

This is a Slack security feature. True impersonation would require:
- Enterprise Grid with admin permissions
- Or each user individually authorizing your app

### Rate Limiting

The collector automatically handles Slack API rate limits by:
- Adding delays between API calls
- Retrying when rate-limited
- Using cursor-based pagination

### Privacy Considerations

This tool collects potentially sensitive data. Use responsibly:
- Only collect from workspaces you have authorization for
- Secure the database file appropriately
- Comply with your organization's data policies

## Files

- `collector.py` - Main message collection script
- `send_dm.py` - CLI for sending direct messages
- `database.py` - SQLite database operations
- `config.py` - Configuration management
- `requirements.txt` - Python dependencies

## Troubleshooting

### "missing_scope" errors
Add the required OAuth scopes to your app and reinstall it.

### "not_in_channel" errors
The bot needs to be invited to private channels to read them.

### "ratelimited" responses
The collector handles this automatically. For heavy usage, increase the delay between requests.

### User not found
Run `collector.py` first to populate the user database, or use the full Slack user ID.
