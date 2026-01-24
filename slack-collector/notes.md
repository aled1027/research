# Slack Message Collector - Development Notes

## Overview
Building a Slack bot that:
1. Collects Slack messages and stores them in SQLite
2. Provides a CLI to send DMs impersonating users

## Progress

### Initial Setup
- Created `slack-collector/` directory
- Planning the architecture:
  - `collector.py` - Main script to collect and store messages
  - `send_dm.py` - CLI for sending DMs as a user
  - `database.py` - SQLite database operations
  - `config.py` - Configuration management

### Technical Decisions

#### Slack API Approach
- Using Slack's Web API for fetching messages and user info
- For sending DMs "as" another user, we need to use `chat.postMessage` with `as_user` parameter
  - Note: This requires a user token (xoxp-) not a bot token (xoxb-)
  - The `chat:write` scope is needed with user tokens for impersonation

#### Database Schema
- `messages` table: id, channel_id, user_id, text, ts, thread_ts, created_at
- `channels` table: id, name, type (channel/dm/group)
- `users` table: id, name, display_name, email

## Learnings

### Slack API Token Types
- **Bot tokens** (`xoxb-`): For bot operations. Can read messages from channels the bot is added to.
- **User tokens** (`xoxp-`): For user operations. Messages sent appear as from the authorizing user.

### User "Impersonation" Limitations
True user impersonation (sending as arbitrary users) is not possible through normal Slack APIs:
- `chat.postMessage` with a user token sends as that token's owner
- The deprecated `as_user` parameter no longer allows arbitrary impersonation
- Enterprise Grid has admin APIs for user-level access, but requires special permissions
- For full impersonation, each user would need to authorize the app individually

### Rate Limiting
Slack's API has tier-based rate limits:
- Tier 1: 1 request per second
- Tier 2: 20 requests per minute
- Tier 3: 50 requests per minute
- Tier 4: 100+ requests per minute

The collector uses a 1-second delay between requests and handles `ratelimited` responses.

### Database Design Choices
- Used `UNIQUE(channel_id, ts)` constraint to prevent duplicate messages
- Stored raw JSON for future debugging/analysis
- Added indexes on channel_id, ts, and user_id for query performance

## Files Created
- `database.py` - SQLite ORM-style wrapper
- `config.py` - Environment variable configuration
- `collector.py` - Message collection script
- `send_dm.py` - DM sending CLI
- `requirements.txt` - Dependencies
- `pyproject.toml` - Package configuration for uv/pip install
- `README.md` - Documentation

## DM Collection Fix (2026-01-24)

The collector was finding DM channels but collecting 0 messages. Root cause:
- **Bot tokens** can only read DMs where the bot is a participant
- **User tokens** can read all the user's personal DMs

Fixed by:
1. Adding `user_client` using `SLACK_USER_TOKEN` when available
2. Using user client for listing IMs and MPIMs (`conversations.list types=im,mpim`)
3. Using user client for fetching DM message history (`conversations.history`)

**Required User Token Scopes for DM collection:**
- `im:read` - List DM channels
- `im:history` - Read DM messages
- `mpim:read` - List group DM channels
- `mpim:history` - Read group DM messages

To add these scopes in Slack App settings:
1. Go to https://api.slack.com/apps -> Your App -> OAuth & Permissions
2. Under "User Token Scopes", add: `im:read`, `im:history`, `mpim:read`, `mpim:history`
3. Reinstall the app to get a new user token with the additional scopes

## uvx Support (2026-01-24)

Added support for running scripts directly with `uvx` using PEP 723 inline script metadata:

- Added inline `# /// script` metadata to `collector.py` and `send_dm.py`
- Added `pyproject.toml` for package installation with `uv pip install .`
- Added `python-dotenv` load calls to scripts so `.env` files work with uvx
- Updated README with uvx usage examples

Scripts can now be run without prior installation:
```bash
uvx collector.py --stats
uvx send_dm.py --list-users
```
