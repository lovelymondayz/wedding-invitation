.PHONY: dev build up down migrate psql

# Start development environment
dev:
	docker compose up -d db
	cd backend && go run . &
	cd frontend && npm run dev
	@echo "Backend: http://localhost:8080 | Frontend: http://localhost:5173"

# Production build
build:
	cd frontend && npm ci && npm run build
	cd backend && go build -o wedding-api .
	@echo "Build complete"

# Docker operations
up:
	docker compose up -d --build
	@echo "App running at http://localhost:3000"

down:
	docker compose down

# Database
migrate:
	docker compose up -d db
	@sleep 2
	docker compose exec db psql -U wedding -d wedding -c "$$(cat backend/migrations/001_init.sql)"

psql:
	docker compose exec db psql -U wedding -d wedding

# Utility
logs:
	docker compose logs -f

clean:
	docker compose down -v
	rm -rf frontend/dist backend/wedding-api
