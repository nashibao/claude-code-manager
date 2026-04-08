# Claude Code Manager

Raycast extension for managing [Claude Code](https://claude.ai/code) sessions in iTerm2.

## Features

- **List Claude Sessions** — View active and past sessions. Switch to iTerm2 tab or resume past sessions.
- **Launch Claude Code** — Open a new session in iTerm2.
- **Session Status (Menu Bar)** — Running/complete counts with spinner animation.

## Requirements

- macOS, iTerm2, Claude Code CLI, jq

## Setup

```bash
npm install && npm run dev
```

Session status requires Claude Code hooks (`hooks/` directory) — see the files for details, or just ask Claude Code to set it up for you.
