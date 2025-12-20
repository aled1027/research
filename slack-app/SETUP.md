# Slack Emoji Rewriter App - Setup Guide

## Prerequisites

- Python 3.7 or higher
- A Slack workspace where you have permission to install apps

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From an app manifest"**
4. Select your workspace
5. Copy the contents of `manifest.json` from this project and paste it in the YAML/JSON editor
6. Click **"Next"** and then **"Create"**

## Step 2: Get Your Credentials

### Bot Token
1. In your app settings, go to **"OAuth & Permissions"**
2. Click **"Install to Workspace"**
3. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

### Signing Secret
1. Go to **"Basic Information"**
2. Scroll to **"App Credentials"**
3. Copy the **"Signing Secret"**

### App-Level Token (for Socket Mode)
1. Go to **"Basic Information"**
2. Scroll to **"App-Level Tokens"**
3. Click **"Generate Token and Scopes"**
4. Name it "socket-mode" and add the `connections:write` scope
5. Click **"Generate"**
6. Copy the token (starts with `xapp-`)

## Step 3: Configure the App

1. Create a `.env` file in the project directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   ```

## Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

Or using a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 5: Run the App

```bash
python app.py
```

You should see: `⚡️ Slack Emoji Rewriter App is running!`

## Step 6: Test the App

1. In your Slack workspace, go to any channel
2. Type `/monitor-channel` to add the channel to your monitoring list
3. Type `/rewrite Hello everyone!` to test the rewriter
4. You'll see both the original and modified messages
5. Click a button to send your preferred version!

## Available Commands

- `/rewrite <message>` - Preview your message with emoji additions
- `/monitor-channel` - Add the current channel to monitoring
- `/unmonitor-channel` - Remove the current channel from monitoring
- `/list-monitored` - Show all monitored channels

## How It Works

1. The app uses **Socket Mode** to avoid needing a public URL
2. When you use `/rewrite`, it shows you both versions of your message
3. You can choose which version to send using interactive buttons
4. The app tracks which channels you've configured for monitoring
5. Messages are sent as the bot (with your username displayed)

## Future Enhancements

Currently, the app adds a simple emoji (😊) to messages. Future versions could:
- Use LLM-based rewriting for more sophisticated modifications
- Add different emoji styles or tones
- Provide customizable rewriting rules per channel
- Support message templates

## Troubleshooting

**App won't start:**
- Check that all tokens in `.env` are correct
- Make sure Socket Mode is enabled in your app settings

**Commands not working:**
- Reinstall the app to your workspace
- Check that the app has the necessary scopes

**Can't send messages:**
- Ensure the bot is invited to the channel (`/invite @Emoji Rewriter`)
- Check the `chat:write` scope is enabled
