# E-Commerce Microservices Makefile
# Manage all services, databases, and Kafka cluster

.PHONY: help install dev start stop clean setup kafka-up kafka-down kafka-ui db-setup db-migrate db-generate test lint type-check build

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)E-Commerce Microservices Platform$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation & Setup

install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

generate-client: ## Generate Prisma client for product-db
	@echo "$(BLUE)Generating Prisma client...$(NC)"
	cd packages/product-db && bun run db:generate
	@echo "$(GREEN)✓ Prisma client generated$(NC)"

setup: install generate-client ## Complete initial setup (install, generate client)
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Configure .env files"
	@echo "  2. Run 'make docker-up' to start all services with Traefik"
	@echo "  3. Access services at https://*.localhost (auto HTTPS redirect)"

##@ Development

dev: ## Start all services in development mode
	@echo "$(BLUE)Starting all services...$(NC)"
	turbo dev

dev-client: ## Start only the client application
	@echo "$(BLUE)Starting client...$(NC)"
	turbo dev --filter=client

dev-admin: ## Start only the admin dashboard
	@echo "$(BLUE)Starting admin dashboard...$(NC)"
	turbo dev --filter=admin

dev-product: ## Start only the product service
	@echo "$(BLUE)Starting product service...$(NC)"
	turbo dev --filter=product-service

dev-order: ## Start only the order service
	@echo "$(BLUE)Starting order service...$(NC)"
	turbo dev --filter=order-service

dev-payment: ## Start only the payment service
	@echo "$(BLUE)Starting payment service...$(NC)"
	turbo dev --filter=payment-service

##@ Traefik & Kafka Management

traefik-dashboard: ## Open Traefik dashboard in browser
	@echo "$(BLUE)Opening Traefik dashboard...$(NC)"
	@start https://dashboard.localhost 2>/dev/null || open https://dashboard.localhost 2>/dev/null || xdg-open https://dashboard.localhost 2>/dev/null
	@echo "$(YELLOW)Dashboard credentials: admin/admin$(NC)"

kafka-ui: ## Open Kafka UI in browser
	@echo "$(BLUE)Opening Kafka UI...$(NC)"
	@start http://localhost:8080 2>/dev/null || open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null

##@ Database Management

db-setup: db-generate ## Setup all databases
	@echo "$(GREEN)✓ Databases setup complete$(NC)"

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running product service migrations...$(NC)"
	cd packages/product-db && bun run db:migrate
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-generate: ## Generate Prisma client
	@echo "$(BLUE)Generating Prisma client...$(NC)"
	cd packages/product-db && bun run db:generate
	@echo "$(GREEN)✓ Prisma client generated$(NC)"

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	cd packages/product-db && bunx prisma studio

db-seed: ## Seed the product database
	@echo "$(BLUE)Seeding product database...$(NC)"
	cd apps/product-service && bun run src/scripts/seed.ts
	@echo "$(GREEN)✓ Database seeded$(NC)"

##@ Code Quality

lint: ## Run linting on all packages
	@echo "$(BLUE)Running linters...$(NC)"
	turbo lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Running type checks...$(NC)"
	turbo check-types
	@echo "$(GREEN)✓ Type checking complete$(NC)"

format: ## Format code with prettier
	@echo "$(BLUE)Formatting code...$(NC)"
	bun run format
	@echo "$(GREEN)✓ Code formatted$(NC)"

test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	turbo test
	@echo "$(GREEN)✓ Tests complete$(NC)"

##@ Build & Deploy

build: ## Build all applications for production
	@echo "$(BLUE)Building all applications...$(NC)"
	turbo build
	@echo "$(GREEN)✓ Build complete$(NC)"

build-client: ## Build client application
	@echo "$(BLUE)Building client...$(NC)"
	turbo build --filter=client
	@echo "$(GREEN)✓ Client built$(NC)"

build-admin: ## Build admin dashboard
	@echo "$(BLUE)Building admin...$(NC)"
	turbo build --filter=admin
	@echo "$(GREEN)✓ Admin built$(NC)"

##@ Cleanup

clean: ## Clean all build artifacts and caches
	@echo "$(RED)Cleaning build artifacts...$(NC)"
	turbo clean
	rm -rf node_modules
	rm -rf **/node_modules
	rm -rf **/.turbo
	rm -rf .turbo
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: clean docker-clean ## Clean everything including Docker data
	@echo "$(GREEN)✓ Full cleanup complete$(NC)"

stop: ## Stop all running services
	@echo "$(BLUE)Stopping all services...$(NC)"
	@pkill -f "turbo dev" || true
	@pkill -f "next dev" || true
	@pkill -f "bun run" || true
	@docker compose down 2>/dev/null || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

##@ Monitoring

logs-product: ## View product service logs
	turbo dev --filter=product-service

logs-order: ## View order service logs
	turbo dev --filter=order-service

logs-payment: ## View payment service logs
	turbo dev --filter=payment-service

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Compose:$(NC)"
	@docker compose ps || echo "  $(RED)✗ Not running$(NC)"
	@echo ""
	@echo "$(YELLOW)Service URLs (via Traefik v3.6):$(NC)"
	@echo "  Traefik Dashboard: https://dashboard.localhost (admin/admin)"
	@echo "  Client:            https://shop.localhost"
	@echo "  Admin:             https://admin.localhost"
	@echo "  Product API:       https://api.localhost/products"
	@echo "  Order API:         https://api.localhost/api/orders"
	@echo "  Payment API:       https://api.localhost/api/session"
	@echo "  Kafka UI:          http://localhost:8080"
	@echo ""
	@echo "$(YELLOW)Note: All HTTP traffic auto-redirects to HTTPS$(NC)"

##@ Docker Commands

docker-build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose build
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-up: ## Start all services with Docker Compose
	@echo "$(BLUE)Starting all services with Docker...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ All services started$(NC)"
	@echo "$(YELLOW)Traefik Dashboard: https://dashboard.localhost (admin/admin)$(NC)"
	@echo "$(YELLOW)Client:            https://shop.localhost$(NC)"
	@echo "$(YELLOW)Admin:             https://admin.localhost$(NC)"
	@echo "$(YELLOW)API:               https://api.localhost$(NC)"
	@echo "$(YELLOW)Kafka UI:          http://localhost:8080$(NC)"

docker-up-build: ## Build and start all services with Docker Compose
	@echo "$(BLUE)Building and starting all services...$(NC)"
	docker compose up -d --build
	@echo "$(GREEN)✓ All services started$(NC)"
	@echo "$(YELLOW)Access services at https://*.localhost$(NC)"

docker-down: ## Stop all Docker services
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Docker services stopped$(NC)"

docker-down-volumes: ## Stop all Docker services and remove volumes
	@echo "$(RED)Stopping Docker services and removing volumes...$(NC)"
	docker compose down -v
	@echo "$(GREEN)✓ Docker services stopped and volumes removed$(NC)"

docker-logs: ## View logs from all Docker services
	docker compose logs -f

docker-logs-traefik: ## View Traefik Docker logs
	docker compose logs -f traefik

docker-logs-product: ## View product service Docker logs
	docker compose logs -f product-service

docker-logs-order: ## View order service Docker logs
	docker compose logs -f order-service

docker-logs-payment: ## View payment service Docker logs
	docker compose logs -f payment-service

docker-logs-client: ## View client Docker logs
	docker compose logs -f client

docker-logs-admin: ## View admin Docker logs
	docker compose logs -f admin

docker-ps: ## Show running Docker containers
	docker compose ps

docker-restart: docker-down docker-up ## Restart all Docker services

docker-restart-service: ## Restart a specific service (usage: make docker-restart-service SERVICE=product-service)
	@echo "$(BLUE)Restarting $(SERVICE)...$(NC)"
	docker compose restart $(SERVICE)
	@echo "$(GREEN)✓ $(SERVICE) restarted$(NC)"

docker-rebuild-service: ## Rebuild and restart a specific service (usage: make docker-rebuild-service SERVICE=product-service)
	@echo "$(BLUE)Rebuilding $(SERVICE)...$(NC)"
	docker compose up -d --no-deps --build $(SERVICE)
	@echo "$(GREEN)✓ $(SERVICE) rebuilt and restarted$(NC)"

docker-shell-traefik: ## Open shell in Traefik container
	docker compose exec traefik sh

docker-shell-product: ## Open shell in product service container
	docker compose exec product-service sh

docker-shell-order: ## Open shell in order service container
	docker compose exec order-service sh

docker-shell-payment: ## Open shell in payment service container
	docker compose exec payment-service sh

docker-infra-only: ## Start only infrastructure services (Traefik, DB, Kafka)
	@echo "$(BLUE)Starting infrastructure...$(NC)"
	docker compose up -d traefik postgres mongodb kafka-broker-1 kafka-broker-2 kafka-broker-3 kafka-ui
	@echo "$(GREEN)✓ Infrastructure started$(NC)"
	@echo "$(YELLOW)Traefik:   https://dashboard.localhost$(NC)"
	@echo "$(YELLOW)PostgreSQL: localhost:5432$(NC)"
	@echo "$(YELLOW)MongoDB:    localhost:27017$(NC)"
	@echo "$(YELLOW)Kafka:      localhost:9094,9095,9096$(NC)"
	@echo "$(YELLOW)Kafka UI:   http://localhost:8080$(NC)"

docker-clean: ## Remove all Docker images, containers, and volumes
	@echo "$(RED)Cleaning all Docker resources...$(NC)"
	docker compose down -v --rmi all
	@echo "$(GREEN)✓ Docker resources cleaned$(NC)"

docker-prune: ## Prune unused Docker resources
	@echo "$(BLUE)Pruning Docker system...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)✓ Docker system pruned$(NC)"

##@ Quick Commands

quick-start: docker-infra-only dev ## Quick start: Infrastructure + Local dev services

quick-stop: stop ## Quick stop all

restart: stop quick-start ## Restart everything

docker-quick-start: docker-up-build ## Quick Docker start with build
