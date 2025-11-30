#!/bin/bash

# Simple command-line tool to check screen recording status on macOS
# Works without needing to build the full SwiftUI app

set -e

echo "🖥️  Mac Screen Recording Status Checker"
echo "======================================="
echo ""

# Check for active screen recording by looking at running processes
echo "📹 Checking for active screen recording..."
echo ""

# Common screen recording apps and their processes
declare -a recording_apps=(
    "zoom.us:Zoom"
    "screencaptureui:macOS Screenshot"
    "QuickTime Player:QuickTime"
    "obs:OBS Studio"
    "ScreenFlow:ScreenFlow"
    "Snagit:Snagit"
    "Google Chrome:Chrome (Google Meet)"
    "Microsoft Teams:Teams"
)

active_recording=0

for app_entry in "${recording_apps[@]}"; do
    IFS=':' read -r process_name app_name <<< "$app_entry"

    if pgrep -f "$process_name" > /dev/null 2>&1; then
        echo "  🔴 $app_name is running"
        active_recording=1
    fi
done

if [ $active_recording -eq 0 ]; then
    echo "  ✅ No known screen recording apps currently running"
fi

echo ""
echo "📋 Checking screen recording permissions..."
echo ""

# Try to read TCC database (requires Full Disk Access)
TCC_DB="$HOME/Library/Application Support/com.apple.TCC/TCC.db"

if [ -r "$TCC_DB" ]; then
    echo "  Querying TCC database for screen recording permissions..."

    # Query the database for screen recording permissions
    # kTCCServiceScreenCapture is the service identifier
    sqlite3 "$TCC_DB" "SELECT client, auth_value FROM access WHERE service='kTCCServiceScreenCapture';" 2>/dev/null | while IFS='|' read -r client auth; do
        if [ "$auth" = "2" ]; then
            echo "  ✅ $client - GRANTED"
        elif [ "$auth" = "0" ]; then
            echo "  ❌ $client - DENIED"
        fi
    done
else
    echo "  ⚠️  Cannot read TCC database (requires Full Disk Access)"
    echo "  Checking for common screen recording apps instead..."
    echo ""

    # Check for installed common apps
    declare -a common_apps=(
        "/Applications/zoom.us.app:Zoom"
        "/Applications/Google Chrome.app:Google Chrome"
        "/Applications/Microsoft Teams.app:Microsoft Teams"
        "/Applications/QuickTime Player.app:QuickTime Player"
        "/Applications/OBS.app:OBS Studio"
        "/Applications/ScreenFlow.app:ScreenFlow"
        "/Applications/Snagit 2024.app:Snagit"
        "/System/Applications/Utilities/Terminal.app:Terminal"
    )

    for app_entry in "${common_apps[@]}"; do
        IFS=':' read -r app_path app_name <<< "$app_entry"

        if [ -d "$app_path" ]; then
            echo "  📱 $app_name is installed"
        fi
    done

    echo ""
    echo "  ℹ️  To see actual permissions, grant this script Full Disk Access:"
    echo "     System Settings → Privacy & Security → Full Disk Access"
fi

echo ""
echo "🔍 System Information:"
echo "  macOS Version: $(sw_vers -productVersion)"
echo "  Current Time: $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "📖 To manage permissions:"
echo "  System Settings → Privacy & Security → Screen Recording"
echo ""
