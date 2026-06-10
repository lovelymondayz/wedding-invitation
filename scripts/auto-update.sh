#!/bin/bash
# Auto-update script for wedding-invitation
# Checks git for new commits, pulls, rebuilds, and restarts Docker services

set -e

PROJECT_DIR="/root/hermes/wedding-invitation"
LOG_FILE="$PROJECT_DIR/logs/auto-update.log"
COMPOSE="docker compose"

mkdir -p "$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cd "$PROJECT_DIR"

# Fetch latest from remote
git fetch origin main 2>/dev/null

# Check if there are updates
LOCAL=$(git rev-parse main 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "✅ Already up to date ($LOCAL)"
    exit 0
fi

log "🔄 Update detected: $LOCAL → $REMOTE"

# Pull latest
git pull origin main 2>&1 | tee -a "$LOG_FILE"

# Rebuild and restart
log "🔨 Rebuilding..."
$COMPOSE build 2>&1 | tee -a "$LOG_FILE"

log "🚀 Restarting services..."
$COMPOSE up -d 2>&1 | tee -a "$LOG_FILE"

# Wait for health
sleep 5

# Verify backend health
if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
    log "✅ Backend healthy"
else
    log "⚠️ Backend health check failed"
fi

# Verify frontend
if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    log "✅ Frontend healthy"
else
    log "⚠️ Frontend health check failed"
fi

log "✅ Auto-update complete"
