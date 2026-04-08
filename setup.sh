#!/bin/bash
set -e

# Install dependencies
npm install

# Install hooks
mkdir -p ~/.claude/hooks ~/.claude/session-states
cp hooks/on-start.sh ~/.claude/hooks/on-start.sh
cp hooks/on-stop.sh ~/.claude/hooks/on-stop.sh
chmod +x ~/.claude/hooks/on-start.sh ~/.claude/hooks/on-stop.sh

echo "Done. Add the following hooks to ~/.claude/settings.json (or ask Claude Code to do it):"
cat <<'EOF'

"hooks": {
  "UserPromptSubmit": [
    { "hooks": [{ "type": "command", "command": "~/.claude/hooks/on-start.sh" }] }
  ],
  "Stop": [
    { "hooks": [{ "type": "command", "command": "~/.claude/hooks/on-stop.sh" }] }
  ]
}
EOF
