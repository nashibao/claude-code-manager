# Claude Code Manager

Raycast extension for managing [Claude Code](https://claude.ai/code) sessions in iTerm2.

## Features

- **List Claude Sessions** — View active and past Claude Code sessions. Switch to an active session's iTerm2 tab, or resume a past session.
- **Launch Claude Code** — Open a new Claude Code session in a new iTerm2 tab.
- **Session Status (Menu Bar)** — Shows running/complete session counts in the menu bar with a spinner animation.

## Requirements

- [iTerm2](https://iterm2.com/)
- [Claude Code CLI](https://claude.ai/code)
- [jq](https://jqlang.github.io/jq/) (`brew install jq`)
- macOS (uses AppleScript for iTerm2 integration)

## Setup

```bash
npm install
npm run dev
```

### Claude Code Hooks (required for session status)

The menu bar status relies on Claude Code hooks to track running/complete state. Copy the hook scripts and add the hook configuration to your Claude Code settings:

```bash
# Copy hooks
cp hooks/on-start.sh ~/.claude/hooks/on-start.sh
cp hooks/on-stop.sh ~/.claude/hooks/on-stop.sh
chmod +x ~/.claude/hooks/on-start.sh ~/.claude/hooks/on-stop.sh
```

Add the following to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/home/.claude/hooks/on-start.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/home/.claude/hooks/on-stop.sh"
          }
        ]
      }
    ]
  }
}
```

Replace `/path/to/home` with your actual home directory path.

Optionally, edit `on-stop.sh` to add Pushcut or other webhook notifications.

## Configuration

| Preference | Description | Default |
|---|---|---|
| Default Directory | Working directory for new sessions | `~` |
