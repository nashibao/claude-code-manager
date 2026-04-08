#!/bin/bash
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
mkdir -p ~/.claude/session-states
echo running > ~/.claude/session-states/"$SESSION_ID"
