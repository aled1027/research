#!/usr/bin/env python3
"""
Slack Emoji Rewriter App

This app allows users to rewrite their messages with emoji additions.
Users can use the /rewrite command to preview their message with an emoji,
then choose to send either the original or modified version.
"""

import os
import json
from pathlib import Path
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Slack app
app = App(token=os.environ.get("SLACK_BOT_TOKEN"))

# Configuration file for monitored channels
CONFIG_FILE = Path(__file__).parent / "channels_config.json"


def load_config():
    """Load channel configuration from JSON file."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"monitored_channels": []}


def save_config(config):
    """Save channel configuration to JSON file."""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)


def is_channel_monitored(channel_id):
    """Check if a channel is being monitored."""
    config = load_config()
    return channel_id in config.get("monitored_channels", [])


def add_emoji_to_message(message):
    """Add a smiley emoji to the end of the message."""
    # Add a smiley emoji - using 😊
    return f"{message} 😊"


@app.command("/rewrite")
def handle_rewrite_command(ack, command, client):
    """
    Handle the /rewrite slash command.

    Usage: /rewrite <your message>
    """
    ack()

    channel_id = command['channel_id']
    user_id = command['user_id']
    original_text = command['text']

    if not original_text:
        client.chat_postEphemeral(
            channel=channel_id,
            user=user_id,
            text="❌ Please provide a message to rewrite. Usage: `/rewrite <your message>`"
        )
        return

    # Check if channel is monitored (optional - could enforce this)
    # For now, we'll allow it in any channel but show a note
    is_monitored = is_channel_monitored(channel_id)

    # Create the modified message
    modified_text = add_emoji_to_message(original_text)

    # Build the response with interactive buttons
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Original message:*\n{original_text}"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Modified message:*\n{modified_text}"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "📤 Send Modified"
                    },
                    "style": "primary",
                    "action_id": "send_modified",
                    "value": json.dumps({
                        "text": modified_text,
                        "channel": channel_id
                    })
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "📝 Send Original"
                    },
                    "action_id": "send_original",
                    "value": json.dumps({
                        "text": original_text,
                        "channel": channel_id
                    })
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "❌ Cancel"
                    },
                    "action_id": "cancel_send"
                }
            ]
        }
    ]

    if not is_monitored:
        blocks.insert(0, {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "ℹ️ _This channel is not in your monitored list. Use `/monitor-channel` to add it._"
                }
            ]
        })

    # Send ephemeral message (only visible to the user)
    client.chat_postEphemeral(
        channel=channel_id,
        user=user_id,
        text="Choose which version to send:",
        blocks=blocks
    )


@app.action("send_modified")
def handle_send_modified(ack, action, client, body):
    """Handle the 'Send Modified' button click."""
    ack()

    value = json.loads(action['value'])
    text = value['text']
    channel = value['channel']
    user_id = body['user']['id']

    # Send the modified message to the channel
    client.chat_postMessage(
        channel=channel,
        text=text,
        username=body['user']['username'],
        icon_url=body['user'].get('profile', {}).get('image_72')
    )

    # Update the ephemeral message to show it was sent
    client.chat_postEphemeral(
        channel=channel,
        user=user_id,
        text="✅ Modified message sent!"
    )


@app.action("send_original")
def handle_send_original(ack, action, client, body):
    """Handle the 'Send Original' button click."""
    ack()

    value = json.loads(action['value'])
    text = value['text']
    channel = value['channel']
    user_id = body['user']['id']

    # Send the original message to the channel
    client.chat_postMessage(
        channel=channel,
        text=text,
        username=body['user']['username'],
        icon_url=body['user'].get('profile', {}).get('image_72')
    )

    # Update the ephemeral message to show it was sent
    client.chat_postEphemeral(
        channel=channel,
        user=user_id,
        text="✅ Original message sent!"
    )


@app.action("cancel_send")
def handle_cancel(ack, client, body):
    """Handle the 'Cancel' button click."""
    ack()

    user_id = body['user']['id']
    channel = body['channel']['id']

    # Send feedback that the action was cancelled
    client.chat_postEphemeral(
        channel=channel,
        user=user_id,
        text="❌ Message cancelled."
    )


@app.command("/monitor-channel")
def handle_monitor_channel(ack, command, client):
    """
    Add the current channel to the monitored channels list.

    Usage: /monitor-channel
    """
    ack()

    channel_id = command['channel_id']
    user_id = command['user_id']

    config = load_config()

    if channel_id in config.get("monitored_channels", []):
        client.chat_postEphemeral(
            channel=channel_id,
            user=user_id,
            text="ℹ️ This channel is already being monitored."
        )
        return

    # Add channel to monitored list
    if "monitored_channels" not in config:
        config["monitored_channels"] = []

    config["monitored_channels"].append(channel_id)
    save_config(config)

    client.chat_postEphemeral(
        channel=channel_id,
        user=user_id,
        text="✅ This channel is now being monitored! Use `/rewrite <message>` to compose messages with emoji."
    )


@app.command("/unmonitor-channel")
def handle_unmonitor_channel(ack, command, client):
    """
    Remove the current channel from the monitored channels list.

    Usage: /unmonitor-channel
    """
    ack()

    channel_id = command['channel_id']
    user_id = command['user_id']

    config = load_config()

    if channel_id not in config.get("monitored_channels", []):
        client.chat_postEphemeral(
            channel=channel_id,
            user=user_id,
            text="ℹ️ This channel is not currently being monitored."
        )
        return

    # Remove channel from monitored list
    config["monitored_channels"].remove(channel_id)
    save_config(config)

    client.chat_postEphemeral(
        channel=channel_id,
        user=user_id,
        text="✅ This channel is no longer being monitored."
    )


@app.command("/list-monitored")
def handle_list_monitored(ack, command, client):
    """
    List all monitored channels.

    Usage: /list-monitored
    """
    ack()

    channel_id = command['channel_id']
    user_id = command['user_id']

    config = load_config()
    monitored = config.get("monitored_channels", [])

    if not monitored:
        client.chat_postEphemeral(
            channel=channel_id,
            user=user_id,
            text="ℹ️ No channels are currently being monitored."
        )
        return

    # Get channel names
    channel_list = []
    for ch_id in monitored:
        try:
            info = client.conversations_info(channel=ch_id)
            channel_name = info['channel']['name']
            channel_list.append(f"• <#{ch_id}> (#{channel_name})")
        except:
            channel_list.append(f"• <#{ch_id}>")

    client.chat_postEphemeral(
        channel=channel_id,
        user=user_id,
        text=f"*Monitored Channels:*\n" + "\n".join(channel_list)
    )


@app.event("app_home_opened")
def handle_app_home_opened(client, event):
    """Display the app home tab with instructions."""
    user_id = event["user"]

    client.views_publish(
        user_id=user_id,
        view={
            "type": "home",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "😊 Emoji Rewriter App"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Welcome! This app helps you rewrite messages with emoji additions."
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Available Commands:*\n\n"
                                "`/rewrite <message>` - Preview your message with an emoji and choose which version to send\n\n"
                                "`/monitor-channel` - Add current channel to monitoring list\n\n"
                                "`/unmonitor-channel` - Remove current channel from monitoring list\n\n"
                                "`/list-monitored` - Show all monitored channels"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*How to use:*\n\n"
                                "1. In any channel, use `/monitor-channel` to add it to your monitoring list\n"
                                "2. Type `/rewrite Hello everyone!` to see your message with an emoji\n"
                                "3. Choose to send either the modified or original version\n"
                                "4. That's it! 🎉"
                    }
                }
            ]
        }
    )


if __name__ == "__main__":
    # Initialize config file if it doesn't exist
    if not CONFIG_FILE.exists():
        save_config({"monitored_channels": []})

    # Start the app in Socket Mode
    handler = SocketModeHandler(app, os.environ.get("SLACK_APP_TOKEN"))
    print("⚡️ Slack Emoji Rewriter App is running!")
    handler.start()
