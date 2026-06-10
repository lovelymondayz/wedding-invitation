#!/bin/bash
# Webhook listener for GitHub push events
# Listens on port 9000, validates GitHub webhook secret, triggers auto-update

set -e

PROJECT_DIR="/root/hermes/wedding-invitation"
LOG_FILE="$PROJECT_DIR/logs/webhook.log"
SECRET_FILE="$PROJECT_DIR/.webhook_secret"
COMPOSE="docker compose"
PORT=9000

mkdir -p "$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Generate webhook secret if not exists
if [ ! -f "$SECRET_FILE" ]; then
    SECRET=$(openssl rand -hex 32)
    echo "$SECRET" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
    log "Generated webhook secret: $SECRET"
fi

SECRET=$(cat "$SECRET_FILE")
log "Starting webhook listener on port $PORT"

# Use ncat to listen for webhook requests
while true; do
    # Read the request
    REQUEST=$(echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" | ncat -l -p "$PORT" -c '
        read -r LINE
        EVENT=""
        SIGNATURE=""
        while read -r HEADER; do
            HEADER=$(echo "$HEADER" | tr -d "\r")
            [ -z "$HEADER" ] && break
            case "$HEADER" in
                X-GitHub-Event*) EVENT="${HEADER#*: }" ;;
                X-Hub-Signature-256*) SIGNATURE="${HEADER#*: }" ;;
            esac
        done
        
        # Read body
        BODY=""
        while read -r BODY_LINE; do
            BODY="${BODY}${BODY_LINE}"
        done
        
        # Validate signature
        if [ -n "$SIGNATURE" ]; then
            EXPECTED="sha256=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "'"$SECRET"'" | sed "s/^.* //")"
            if [ "$SIGNATURE" != "$EXPECTED" ]; then
                echo "HTTP/1.1 403 Forbidden\r\n\r\nInvalid signature"
                exit 0
            fi
        fi
        
        # Respond immediately
        echo "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"ok\"}"
        
        # Trigger update in background
        if [ "$EVENT" = "push" ]; then
            BRANCH=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get(\"ref\",\"\"))" 2>/dev/null)
            if [ "$BRANCH" = "refs/heads/main" ]; then
                echo "[$(date)] Webhook: push to main detected, triggering update" >> "'"$LOG_FILE"'"
                cd "'"$PROJECT_DIR"'"
                git fetch origin main 2>&1 >> "'"$LOG_FILE"'"
                LOCAL=$(git rev-parse main 2>/dev/null)
                REMOTE=$(git rev-parse origin/main 2>/dev/null)
                if [ "$LOCAL" != "$REMOTE" ]; then
                    git pull origin main 2>&1 >> "'"$LOG_FILE"'"
                    '"$COMPOSE"' build 2>&1 >> "'"$LOG_FILE"'"
                    '"$COMPOSE"' up -d 2>&1 >> "'"$LOG_FILE"'"
                    echo "[$(date)] Webhook: update complete" >> "'"$LOG_FILE"'"
                else
                    echo "[$(date)] Webhook: already up to date" >> "'"$LOG_FILE"'"
                fi
            fi
        fi
    ')
done
