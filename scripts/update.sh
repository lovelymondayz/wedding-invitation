#!/bin/bash
# Manual update script — pull latest, rebuild, restart
# Usage: ./scripts/update.sh [--force]

set -e

PROJECT_DIR="/root/hermes/wedding-invitation"
COMPOSE="docker compose"

cd "$PROJECT_DIR"

echo "📡 Checking for updates..."
git fetch origin main 2>/dev/null

LOCAL=$(git rev-parse main 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ] && [ "$1" != "--force" ]; then
    echo "✅ Already up to date ($LOCAL)"
    echo ""
    echo "Services:"
    $COMPOSE ps 2>/dev/null
    exit 0
fi

if [ "$LOCAL" = "$REMOTE" ] && [ "$1" = "--force" ]; then
    echo "🔄 Forced rebuild ($LOCAL)"
else
    echo "🔄 Update: $LOCAL → $REMOTE"
    git pull origin main
fi

echo "🔨 Building..."
$COMPOSE build

echo "🚀 Restarting..."
$COMPOSE up -d

echo "⏳ Waiting for services..."
sleep 5

echo ""
echo "📊 Status:"
$COMPOSE ps

echo ""
echo "🏥 Health:"
curl -sf http://localhost:8080/api/health > /dev/null && echo "  Backend:  ✅" || echo "  Backend:  ❌"
curl -sf http://localhost:3000/ > /dev/null && echo "  Frontend: ✅" || echo "  Frontend: ❌"

echo ""
echo "✅ Done!"
