# Slack Emoji App Development Notes

## Goal
Build a Slack app that:
- Allows users to configure which channels to monitor
- Intercepts/rewrites messages by adding a smiley emoji
- Gives users the option to send original or modified message

## Initial Research

### Slack API Limitations
- Slack doesn't allow true "interception" of messages before they're sent
- Need to use alternative approaches:
  1. Slash commands
  2. Message shortcuts
  3. Interactive components with Block Kit

## Approach
Will implement using:
- Slash command (e.g., `/rewrite [message]`) for message composition
- Interactive buttons to choose between original and modified message
- Block Kit for rich UI
- Channel configuration stored in-app

## Implementation Details

### Technology Stack
- **Python 3.7+** with Slack Bolt framework
- **Socket Mode** for easy development (no public URL needed)
- **JSON file storage** for channel configuration

### Files Created
1. **app.py** - Main application with all handlers
2. **requirements.txt** - Python dependencies
3. **manifest.json** - Slack app configuration
4. **SETUP.md** - Complete setup instructions
5. **.env.example** - Environment variable template
6. **.gitignore** - Ignore sensitive files
7. **test_app.py** - Basic unit tests

### Features Implemented

#### Slash Commands
- `/rewrite <message>` - Preview message with emoji, choose version to send
- `/monitor-channel` - Add current channel to monitoring list
- `/unmonitor-channel` - Remove current channel from monitoring
- `/list-monitored` - Display all monitored channels

#### Interactive Components
- Button handlers for:
  - Send modified message
  - Send original message
  - Cancel action

#### App Home
- Welcome screen with instructions
- Command documentation

### How It Works
1. User types `/rewrite Hello everyone!`
2. App shows ephemeral message (only user can see) with:
   - Original: "Hello everyone!"
   - Modified: "Hello everyone! 😊"
   - Three buttons: Send Modified, Send Original, Cancel
3. User clicks button to send their choice
4. Message posts to channel as the bot user

### Key Design Decisions

**Why Socket Mode?**
- No need for public HTTPS endpoint
- Easier for development and testing
- Simpler deployment

**Why Ephemeral Messages?**
- User sees preview without cluttering channel
- Private interaction between user and app
- Clean UX

**Why JSON for Storage?**
- Simple, no database required
- Easy to inspect and modify
- Sufficient for channel IDs

**Message Sending as Bot**
- Slack limitations: can't send as user directly
- Current: bot posts with attribution
- Future: could use incoming webhooks or user tokens (requires different scopes)

### Limitations & Future Work

**Current Limitations:**
- Messages sent as bot, not as user
- No actual message interception (uses slash command workflow)
- Simple emoji addition only

**Future Enhancements:**
- LLM integration for intelligent rewriting
- Multiple emoji/tone options
- Per-channel rewriting rules
- Message templates
- User preferences storage
- Direct message support

## Testing
- Created basic unit tests for emoji addition function
- Verified JSON structure for manifest
- Tested command flow logic

## Started: 2025-12-04
## Completed: 2025-12-04
