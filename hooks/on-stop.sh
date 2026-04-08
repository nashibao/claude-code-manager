#!/bin/bash
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
mkdir -p ~/.claude/session-states
echo complete > ~/.claude/session-states/"$SESSION_ID"

# Optional: macOS notification
osascript -e 'display notification "Claude Code finished" with title "Claude Code" sound name "Glass"' &

# Optional: Pushcut notification (replace URL with your own)
# curl -s -X POST https://api.pushcut.io/YOUR_KEY/notifications/Claude%20Code%20done &
