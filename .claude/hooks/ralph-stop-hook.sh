#!/usr/bin/env bash
# Ralph Loop — Stop Hook
# Intercepts Claude's exit. If a ralph loop is active and not yet complete,
# blocks the exit and re-feeds the task prompt for another iteration.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_FILE="$PROJECT_ROOT/.ralph-state.json"

# If no state file, ralph is not active — allow normal exit
if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

# Read state
ACTIVE=$(jq -r '.active' "$STATE_FILE" 2>/dev/null || echo "false")
if [[ "$ACTIVE" != "true" ]]; then
  exit 0
fi

PROMPT=$(jq -r '.prompt' "$STATE_FILE")
COMPLETION_PROMISE=$(jq -r '.completionPromise' "$STATE_FILE")
MAX_ITERATIONS=$(jq -r '.maxIterations' "$STATE_FILE")
ITERATION=$(jq -r '.iteration' "$STATE_FILE")
TRANSCRIPT_PATH=$(jq -r '.transcript_path // ""' /dev/stdin 2>/dev/null || echo "")

# Check if completion promise appears in the session transcript
if [[ -n "$TRANSCRIPT_PATH" && -f "$TRANSCRIPT_PATH" ]]; then
  if grep -q "$COMPLETION_PROMISE" "$TRANSCRIPT_PATH" 2>/dev/null; then
    echo "Ralph loop: completion promise detected. Exiting cleanly." >&2
    # Clean up state
    jq '.active = false' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    exit 0
  fi
fi

# Check iteration cap
NEXT_ITERATION=$((ITERATION + 1))
if [[ "$NEXT_ITERATION" -gt "$MAX_ITERATIONS" ]]; then
  echo "Ralph loop: max iterations ($MAX_ITERATIONS) reached. Stopping." >&2
  jq '.active = false' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
  exit 0
fi

# Increment iteration in state
jq ".iteration = $NEXT_ITERATION" "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

# Block exit and re-feed the prompt
echo "Ralph loop: iteration $NEXT_ITERATION / $MAX_ITERATIONS — re-feeding prompt." >&2

cat <<EOF
{
  "decision": "block",
  "reason": "RALPH LOOP — Iteration $NEXT_ITERATION of $MAX_ITERATIONS\n\nContinue working on the following task. Review what you did in the previous iteration (check modified files and git log) and improve or complete the work.\n\nTask:\n$PROMPT\n\nWhen the task is fully complete, output the exact text: $COMPLETION_PROMISE"
}
EOF
