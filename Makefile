.PHONY: help start stop restart logs frontend-build frontend-watch clean devices-start devices-stop devices-logs devices-reset devices-build survey-install survey-deploy survey-serve venv lint format test test-integration

# Python virtual environment
VENV := .venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
RUFF := $(VENV)/bin/ruff

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Python virtual environment
$(VENV)/bin/activate: requirements_dev.txt
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements_dev.txt
	touch $(VENV)/bin/activate

venv: $(VENV)/bin/activate ## Create Python virtual environment

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
	cd frontend && npm ci && npm run build

frontend-watch: ## Start frontend dev server with watch mode
	docker compose --profile dev up frontend-dev

frontend-install: ## Install frontend dependencies
	cd frontend && npm ci

frontend-test: ## Run frontend tests
	cd frontend && npm test

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
	rm -rf $(VENV)

# Python development
lint: venv ## Run Python linters
	$(RUFF) check custom_components/matter_binding_helper

format: venv ## Format Python code
	$(RUFF) format custom_components/matter_binding_helper

test: venv ## Run Python tests
	$(PYTHON) -m pytest tests/ -v

test-integration: venv ## Run integration tests (uses testcontainers for isolated environment)
	@echo "Running integration tests with testcontainers..."
	@echo "Fresh containers will be started automatically."
	@echo ""
	$(PIP) install -q -r requirements-test.txt
	$(PYTHON) -m pytest tests/ -v --tb=short

# Utility
shell: ## Open a shell in the HA container
	docker compose exec homeassistant bash

# Matter virtual devices (rs-matter)
devices-start: ## Build and start Matter test devices
	cd devices && docker compose up -d --build
	@echo ""
	@echo "Matter device starting..."
	@echo "Check logs for QR code: make devices-logs"

devices-stop: ## Stop Matter test devices
	cd devices && docker compose down

devices-logs: ## Show Matter device logs (includes QR code)
	cd devices && docker compose logs -f

devices-reset: ## Reset device state (remove persisted data)
	cd devices && docker compose down -v
	@echo "Device state reset. Will need to re-commission."

devices-build: ## Build Matter devices without starting
	cd devices && docker compose build

# Full development environment
dev-full: frontend-build devices-start start ## Start HA + Matter devices + Matter server
	@echo ""
	@echo "=========================================="
	@echo "Full dev environment running:"
	@echo "  - Home Assistant:  http://localhost:8123"
	@echo "  - Matter Server:   ws://localhost:5580/ws"
	@echo "  - Matter Device:   Real rs-matter device"
	@echo "=========================================="
	@echo ""
	@echo "Setup Matter in HA:"
	@echo "  1. Go to Settings > Devices & Services"
	@echo "  2. Add Integration > Matter"
	@echo "  3. Use URL: ws://matter-server:5580/ws"
	@echo ""
	@echo "Commission the test device:"
	@echo "  1. Run: make devices-logs"
	@echo "  2. Find the QR code or manual pairing code"
	@echo "  3. Use Matter integration to commission"
	@echo ""
	@echo "Commands:"
	@echo "  make devices-logs  - View device logs (QR code)"
	@echo "  make devices-reset - Reset device state"
	@echo "  make logs          - View HA logs"

# Device commissioning
devices-commission: ## Commission a Matter device (usage: make devices-commission CODE=34970112332)
	@if [ -z "$(CODE)" ]; then \
		echo "Usage: make devices-commission CODE=<pairing-code>"; \
		echo ""; \
		echo "Examples:"; \
		echo "  make devices-commission CODE=34970112332"; \
		echo "  make devices-commission CODE=MT:-24J0AFN00KA064IJ3P0WISA0DK5N1K8SQ1RYCU1O0"; \
		exit 1; \
	fi
	docker exec matter-server python3 /scripts/commission-device.py $(CODE)

# Matter Survey (matter-survey.org)
survey-install: ## Install Matter Survey PHP dependencies
	cd matter-survey && composer install --no-dev --optimize-autoloader

survey-serve: ## Start local Matter Survey dev server
	cd matter-survey && php -S localhost:8080 -t public public/router.php

survey-deploy: ## Deploy Matter Survey via rsync + SSH composer
	@if [ -f .env ]; then \
		export $$(grep -v '^#' .env | xargs); \
		echo "Deploying to $$SFTP_USER@$$SFTP_HOST:$$SFTP_PATH..."; \
		echo "Syncing files with rsync..."; \
		rsync -avz --delete \
			--exclude '.git/' \
			--exclude '.gitignore' \
			--exclude '.env' \
			--exclude 'vendor/' \
			--exclude 'var/cache/*' \
			--exclude 'var/log/*' \
			--exclude 'data/*.db' \
			matter-survey/ $$SFTP_USER@$$SFTP_HOST:$$SFTP_PATH/; \
		echo "Copying .env.prod to .env on server..."; \
		ssh $$SFTP_USER@$$SFTP_HOST "cp $$SFTP_PATH/.env.prod $$SFTP_PATH/.env"; \
		echo "Running composer install on server..."; \
		ssh $$SFTP_USER@$$SFTP_HOST "cd $$SFTP_PATH && composer install --no-dev --optimize-autoloader"; \
		echo "Fixing permissions..."; \
		ssh $$SFTP_USER@$$SFTP_HOST "\
			chmod 755 $$SFTP_PATH/public && \
			chmod 644 $$SFTP_PATH/public/.htaccess && \
			chmod 644 $$SFTP_PATH/public/index.php && \
			chmod -R 777 $$SFTP_PATH/var && \
			chmod 755 $$SFTP_PATH/data && \
			touch $$SFTP_PATH/data/.gitkeep"; \
		echo "Deployment complete!"; \
	else \
		echo "Error: .env file not found. Create it with SFTP_USER, SFTP_HOST, SFTP_PATH"; \
		exit 1; \
	fi
