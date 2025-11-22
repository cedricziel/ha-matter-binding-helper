.PHONY: help start stop restart logs frontend-build frontend-watch clean devices-start devices-stop devices-list devices-reset survey-install survey-deploy survey-serve

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Docker commands
start: frontend-build ## Start Home Assistant development server
	docker compose up -d homeassistant
	@echo "Home Assistant starting at http://localhost:8123"

stop: ## Stop all containers
	docker compose down

restart: ## Restart Home Assistant (picks up component changes)
	docker compose restart homeassistant

logs: ## Show Home Assistant logs
	docker compose logs -f homeassistant

logs-component: ## Show only Matter Binding Helper logs
	docker compose logs -f homeassistant 2>&1 | grep -i matter_binding_helper

# Frontend commands
frontend-build: ## Build frontend for production
	cd frontend && npm install && npm run build

frontend-watch: ## Start frontend dev server with watch mode
	docker compose --profile dev up frontend-dev

frontend-install: ## Install frontend dependencies
	cd frontend && npm install

# Development
dev: ## Start HA + frontend watch mode
	docker compose --profile dev up -d
	@echo "Home Assistant: http://localhost:8123"
	@echo "Frontend watching for changes..."

clean: ## Clean all generated files and containers
	docker compose down -v
	rm -rf frontend/node_modules
	rm -rf custom_components/matter_binding_helper/frontend/*.js
	rm -rf custom_components/matter_binding_helper/frontend/*.map

# Python development
lint: ## Run Python linters
	cd custom_components/matter_binding_helper && ruff check .

format: ## Format Python code
	cd custom_components/matter_binding_helper && ruff format .

# Utility
shell: ## Open a shell in the HA container
	docker compose exec homeassistant bash

# Mock Matter devices
devices-start: ## Start mock Matter devices
	cd devices && docker compose up -d --build
	@echo ""
	@echo "Mock Matter device running on port 5540"
	@echo "Test: echo '{\"cmd\":\"get_state\"}' | nc localhost 5540"

devices-stop: ## Stop mock Matter devices
	cd devices && docker compose down

devices-logs: ## Show mock device logs
	cd devices && docker compose logs -f

devices-test: ## Test mock device API
	@echo '{"cmd":"get_state"}' | nc -w1 localhost 5540 | python3 -m json.tool 2>/dev/null || echo '{"cmd":"get_state"}' | nc -w1 localhost 5540

# Full development environment
dev-full: frontend-build devices-start start ## Start HA + mock devices + Matter server
	@echo ""
	@echo "=========================================="
	@echo "Full dev environment running:"
	@echo "  - Home Assistant:  http://localhost:8123"
	@echo "  - Matter Server:   ws://localhost:5580/ws"
	@echo "  - Mock Device API: localhost:5540"
	@echo "=========================================="
	@echo ""
	@echo "Setup Matter in HA:"
	@echo "  1. Go to Settings > Devices & Services"
	@echo "  2. Add Integration > Matter"
	@echo "  3. Use URL: ws://matter-server:5580/ws"
	@echo ""
	@echo "Commands:"
	@echo "  make devices-test  - Test mock device"
	@echo "  make devices-logs  - View device logs"
	@echo "  make logs          - View HA logs"

# Matter Survey (matter-survey.org)
survey-install: ## Install Matter Survey PHP dependencies
	cd matter-survey && composer install --no-dev --optimize-autoloader

survey-serve: ## Start local Matter Survey dev server
	cd matter-survey && php -S localhost:8080 -t public

survey-deploy: survey-install ## Deploy Matter Survey to FTP server
	@if [ -f .env ]; then \
		export $$(grep -v '^#' .env | xargs); \
		echo "Deploying to $$FTP_HOST$$FTP_PATH..."; \
		lftp -c "set ftp:ssl-allow no; \
			open -u $$FTP_USER,$$FTP_PASSWORD $$FTP_HOST; \
			mirror -R --delete --verbose \
				--exclude .git/ \
				--exclude .gitignore \
				--exclude docker-compose.yml \
				--exclude README.md \
				matter-survey/ $$FTP_PATH; \
			echo 'Fixing permissions...'; \
			chmod 755 $${FTP_PATH}public; \
			chmod 755 $${FTP_PATH}public/api; \
			chmod 755 $${FTP_PATH}src; \
			chmod 755 $${FTP_PATH}vendor; \
			chmod 755 $${FTP_PATH}data; \
			chmod 644 $${FTP_PATH}public/.htaccess; \
			chmod 644 $${FTP_PATH}public/index.php; \
			chmod 644 $${FTP_PATH}public/device.php; \
			chmod 644 $${FTP_PATH}public/api/submit.php; \
			chmod 644 $${FTP_PATH}src/Database.php; \
			chmod 644 $${FTP_PATH}src/DeviceRepository.php; \
			chmod 644 $${FTP_PATH}src/TelemetryHandler.php"; \
		echo "Deployment complete!"; \
	else \
		echo "Error: .env file not found. Create it with FTP_USER, FTP_PASSWORD, FTP_HOST, FTP_PATH"; \
		exit 1; \
	fi
