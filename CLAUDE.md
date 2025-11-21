# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home Assistant custom integration for managing Matter device bindings. Allows users to create direct device-to-device communication links between Matter devices through a visual UI panel.

## Development Commands

### Full Development Environment
```bash
make dev-full          # Start HA + Matter server + mock devices
make logs              # View HA logs
make logs-component    # View only Matter Binding Helper logs
make restart           # Restart HA to pick up Python changes
```

### Frontend Development
```bash
cd frontend && npm install    # Install dependencies
cd frontend && npm run build  # Production build
cd frontend && npm run watch  # Watch mode with auto-rebuild
```

### Mock Device Testing
```bash
make devices-start     # Start mock Matter devices
make devices-test      # Test mock device API
make devices-logs      # View mock device logs
```

### Python Linting
```bash
make lint              # Run ruff check
make format            # Run ruff format
```

## Architecture

### Backend (Python - Home Assistant Integration)
- **`__init__.py`**: Integration setup, registers panel and WebSocket API
- **`api.py`**: WebSocket command handlers (list_nodes, list_bindings, create_binding, delete_binding, etc.)
- **`matter_client.py`**: Interface to python-matter-server, reads/writes binding cluster attributes. Includes demo mode with mock data.
- **`config_flow.py`**: Setup wizard and options flow (includes demo mode toggle)

### Frontend (TypeScript/Lit)
- **`frontend/src/matter-binding-panel.ts`**: Main Lit component, renders node list and binding management UI
- **`frontend/src/api.ts`**: WebSocket API client wrapper
- Built output goes to `custom_components/matter_binding_helper/frontend/`

### Mock Devices (Rust)
- **`devices/rust-device/`**: TCP JSON API mock device for testing without real Matter hardware
- Does NOT implement actual Matter protocol - for UI testing only

## Key Technical Details

### Matter Binding Cluster
- Cluster ID: `0x001E` (30)
- Bindings are stored as attributes on the source device's endpoint
- Each binding specifies: target node ID, target endpoint ID, and cluster ID

### WebSocket API Pattern
Commands follow the pattern `matter_binding_helper/{action}` and are registered via `websocket_api.async_register_command()`.

### Demo Mode
Enable via Settings → Devices & Services → Matter Binding Helper → Configure. Returns mock nodes/bindings for UI development without real Matter devices.

## Docker Services
- `homeassistant`: HA with custom component mounted read-only
- `matter-server`: python-matter-server on ws://matter-server:5580/ws
- `rust-light`: Mock device on port 5540
