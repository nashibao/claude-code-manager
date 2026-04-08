# Claude Code Manager

Raycast extension for managing [Claude Code](https://claude.ai/code) sessions in iTerm2.

## Features

- **List Claude Sessions** — View active and past Claude Code sessions. Switch to an active session's iTerm2 tab, or resume a past session.
- **Launch Claude Code** — Open a new Claude Code session in a new iTerm2 tab.

## Requirements

- [iTerm2](https://iterm2.com/)
- [Claude Code CLI](https://claude.ai/code)
- macOS (uses AppleScript for iTerm2 integration)

## Setup

```bash
npm install
npm run dev
```

## Configuration

| Preference | Description | Default |
|---|---|---|
| Default Directory | Working directory for new sessions | `~` |
