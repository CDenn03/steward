#!/usr/bin/env bash
# Triggered after every fs_write tool use.
# If a src/ or prisma/ file was written, remind the agent to keep docs current.

EVENT=$(cat)
TOOL_INPUT=$(echo "$EVENT" | grep -o '"path":"[^"]*"' | head -1 | sed 's/"path":"//;s/"//')

# Only act on source / schema files
if echo "$TOOL_INPUT" | grep -qE '(src/|prisma/schema\.prisma)'; then
  echo "REMINDER: A source file was modified. Review USER_JOURNEY.md and DOCUMENTATION.md — update any sections that describe changed behaviour, new routes, roles, or data models."
fi

exit 0
