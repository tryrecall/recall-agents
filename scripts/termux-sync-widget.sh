#!/data/data/com.termux/files/usr/bin/bash
# SteelEngine OAuth Sync Widget
# Syncs Claude Code tokens to SteelEngine over SSH
# Place in ~/.shortcuts/ on phone for Termux:Widget

termux-toast "Syncing SteelEngine auth..."

# Run sync on the configured SteelEngine host.
SERVER="${STEELENGINE_SERVER:-steelengine-host}"
RESULT=$(ssh "$SERVER" '$HOME/steelengine/scripts/sync-claude-code-auth.sh' 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    # Extract expiry time from output
    EXPIRY=$(echo "$RESULT" | grep "Token expires:" | cut -d: -f2-)

    termux-vibrate -d 100
    termux-toast "SteelEngine synced! Expires:${EXPIRY}"

    # Optional: restart steelengine service
    ssh "$SERVER" 'systemctl --user restart steelengine' 2>/dev/null
else
    termux-vibrate -d 300
    termux-toast "Sync failed: ${RESULT}"
fi
