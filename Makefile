.PHONY: dev build up down logs clean deploy test

# Start development environment
dev:
	cd backend && go run ./cmd/server &
	cd frontend && npm run dev
	@echo "Backend: http://localhost:8080 | Frontend: http://localhost:3000"

# Production build
build:
	cd frontend && npm ci && npm run build
	cd backend && go build -o wedding-api ./cmd/server
	@echo "Build complete"

# Docker operations
up:
	docker compose up -d --build
	@echo "Wedding Invitation running — FE: http://localhost:3000, BE: http://localhost:8080"

down:
	docker compose down

# Utility
logs:
	docker compose logs -f

clean:
	docker compose down -v
	rm -rf frontend/dist backend/wedding-api

deploy:
	./update.sh

test:
	cd backend && go test ./...
	cd frontend && npm run build
	@echo "Tests passed"