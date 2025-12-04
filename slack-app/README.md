# Slack Emoji Rewriter App

A Slack app that allows users to preview and send messages with emoji additions. Users can compose messages via a slash command, see both original and modified versions, and choose which to send to the channel.

## Overview

This app addresses the requirement to monitor channels and "intercept" messages for rewriting. Due to Slack API limitations (Slack doesn't allow true message interception before sending), this implementation uses a slash command workflow that provides similar functionality:

1. User configures which channels to monitor
2. User composes message via `/rewrite <message>` command
3. App shows both original and emoji-enhanced versions
4. User selects which version to send

## Features

### Core Functionality
- **Message Rewriting**: Adds a smiley emoji (😊) to the end of messages
- **Preview & Choice**: Shows both original and modified versions before sending
- **Channel Monitoring**: Track which channels are configured for use
- **Interactive UI**: Uses Slack Block Kit for rich, button-based interactions

### Commands

| Command | Description |
|---------|-------------|
| `/rewrite <message>` | Preview your message with emoji additions and choose which version to send |
| `/monitor-channel` | Add the current channel to your monitoring list |
| `/unmonitor-channel` | Remove the current channel from monitoring |
| `/list-monitored` | Display all monitored channels |

### App Home
- Welcome screen with instructions
- Complete command reference
- Usage guide

## Technical Implementation

### Architecture
```
┌─────────────┐
│  Slack User │
└──────┬──────┘
       │ /rewrite Hello
       ▼
┌─────────────────┐
│   Slack API     │
└──────┬──────────┘
       │ Socket Mode
       ▼
┌─────────────────┐
│  Python App     │
│  (Slack Bolt)   │
├─────────────────┤
│ • Commands      │
│ • Interactions  │
│ • Storage       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ channels_config │
│    .json        │
└─────────────────┘
```

### Technology Stack
- **Python 3.7+**: Core language
- **Slack Bolt Framework**: Slack app development framework
- **Socket Mode**: WebSocket connection (no public URL needed)
- **Block Kit**: Rich UI components
- **JSON**: Simple file-based storage

### Key Components

#### 1. Command Handlers (`app.py`)
```python
@app.command("/rewrite")
def handle_rewrite_command(ack, command, client):
    # Shows preview with buttons
```

#### 2. Interactive Components
```python
@app.action("send_modified")
def handle_send_modified(ack, action, client, body):
    # Posts modified message to channel
```

#### 3. Channel Configuration
```python
def load_config():
    # Loads monitored channels from JSON
```

### User Flow

1. **Setup**: User adds channel to monitoring with `/monitor-channel`
2. **Compose**: User types `/rewrite Hello everyone!`
3. **Preview**: App shows ephemeral message:
   ```
   Original message:
   Hello everyone!

   Modified message:
   Hello everyone! 😊

   [Send Modified] [Send Original] [Cancel]
   ```
4. **Send**: User clicks button, message posts to channel
5. **Confirmation**: User sees "✅ Modified message sent!"

## Design Decisions

### Why Socket Mode?
- No need for public HTTPS endpoint
- Simpler development and deployment
- Ideal for internal workspace apps
- No tunneling/ngrok required

### Why Ephemeral Messages?
- Private preview (only user sees it)
- No channel clutter
- Clean user experience
- Immediate feedback

### Why Slash Commands vs. Event API?
Slack's API doesn't allow intercepting messages before they're sent. Alternatives considered:

| Approach | Pros | Cons | Selected |
|----------|------|------|----------|
| Slash Command | Full control, clear UX | Extra typing | ✅ Yes |
| Message Shortcuts | Post-send only | Can't prevent original | ❌ No |
| Event API | Automatic | Can't intercept | ❌ No |
| Custom Input | Complex UI | Hard to implement | ❌ No |

### Message Sending Limitations
Currently messages are sent **as the bot** (not as the original user) because:
- Slack doesn't allow bots to impersonate users
- User tokens have security/privacy implications
- Bot messages can include attribution (username/avatar)

Future options:
- Use incoming webhooks (more flexibility)
- Request user tokens (requires user OAuth)
- Accept bot-sent messages as acceptable UX

## Installation & Setup

See [SETUP.md](SETUP.md) for complete installation instructions.

Quick start:
```bash
# Install dependencies
pip install -r requirements.txt

# Configure credentials (see SETUP.md)
cp .env.example .env
# Edit .env with your tokens

# Run the app
python app.py
```

## File Structure

```
slack-app/
├── app.py                 # Main application code
├── requirements.txt       # Python dependencies
├── manifest.json         # Slack app configuration
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── SETUP.md             # Setup instructions
├── test_app.py          # Unit tests
├── notes.md             # Development notes
└── README.md            # This file
```

## Future Enhancements

### Short Term
- [ ] Multiple emoji options (happy, professional, casual)
- [ ] Customizable emoji per channel
- [ ] Remember user preferences
- [ ] Support for DMs and private channels

### Medium Term
- [ ] **LLM Integration**: Replace simple emoji with AI-powered rewriting
  - Tone adjustment (professional, casual, friendly)
  - Grammar correction
  - Length optimization
- [ ] Message templates
- [ ] Scheduled sending
- [ ] Analytics (most used channels, etc.)

### Long Term
- [ ] Multi-workspace support
- [ ] Team-wide policies
- [ ] Integration with other apps
- [ ] Custom rewriting rules engine

## Limitations

### Current Version
1. **Not True Interception**: Uses slash command, not automatic interception
2. **Bot Attribution**: Messages sent as bot, not original user
3. **Simple Rewriting**: Only adds emoji, no LLM yet
4. **Manual Invocation**: User must remember to use `/rewrite`

### Slack API Constraints
- Cannot intercept messages before they're posted
- Cannot send messages as other users without user tokens
- Rate limits on API calls
- Socket Mode requires app to be running continuously

## Testing

Basic unit tests are provided in `test_app.py`:

```bash
python test_app.py
```

Tests cover:
- Emoji addition logic
- Message formatting
- Edge cases (empty messages, existing emoji)

## Security Considerations

- **Tokens**: All credentials in `.env` (not committed)
- **Scopes**: Minimal required scopes only
- **Storage**: Channel IDs only (no message content)
- **Privacy**: Ephemeral messages (user-only visibility)

## Contributing

To extend this app:

1. **Add new rewriting logic**: Modify `add_emoji_to_message()` in `app.py`
2. **Add LLM integration**: Import LLM library, call in rewrite function
3. **Add new commands**: Use `@app.command()` decorator
4. **Add buttons**: Use `@app.action()` decorator
5. **Update manifest**: Add new scopes/commands to `manifest.json`

Example LLM integration point:
```python
def add_emoji_to_message(message):
    # Current: Simple emoji
    # Future: Call LLM API here
    # return llm_rewrite(message, style="friendly")
    return f"{message} 😊"
```

## License

This is a demonstration project. Use and modify as needed.

## Support

For issues or questions about:
- **Slack API**: See [api.slack.com/docs](https://api.slack.com/docs)
- **Slack Bolt**: See [slack.dev/bolt-python](https://slack.dev/bolt-python)
- **This Implementation**: See notes.md for development details

---

**Built with**: Python, Slack Bolt Framework, Socket Mode, Block Kit

**Status**: ✅ Functional prototype ready for LLM enhancement
