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
cd frontend && npm run build  # Production build (outputs to custom_components/.../frontend/)
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

### Testing with Real HA Instance

The `matter.sh` script connects to a real HA instance via WebSocket (credentials in `.env`):

```bash
./matter.sh nodes              # List Matter nodes
./matter.sh bindings <nid> <ep> # List bindings for node/endpoint
./matter.sh devices            # Debug: List HA devices with Matter identifiers
./matter.sh match <node_id>    # Debug: Test device identifier matching
```

## Architecture

### Backend (Python - Home Assistant Integration)

- **`__init__.py`**: Integration setup, registers panel and WebSocket API
- **`api.py`**: WebSocket command handlers (list_nodes, list_bindings, create_binding, delete_binding, debug endpoints)
- **`matter_client.py`**: Interface to python-matter-server, reads/writes binding cluster attributes. Includes demo mode with mock data.
- **`config_flow.py`**: Setup wizard and options flow (includes demo mode toggle)

### Frontend (TypeScript/Lit)

- **`frontend/src/matter-binding-panel.ts`**: Main Lit component, renders node list and binding management UI
- **`frontend/src/api.ts`**: WebSocket API client wrapper
- **`frontend/src/types.ts`**: TypeScript types plus cluster/device type name lookup tables
- Built output goes to `custom_components/matter_binding_helper/frontend/`

### Mock Devices (Rust)

- **`devices/rust-device/`**: TCP JSON API mock device for testing without real Matter hardware
- Does NOT implement actual Matter protocol - for UI testing only

## Key Technical Details

### Matter Data Model

- **Nodes**: Physical devices on the Matter fabric, identified by node_id
- **Endpoints**: Functional units within a node (endpoint 0 = Root Node, endpoint 1+ = actual functionality)
- **Device Types**: Defined per-endpoint (e.g., 769=Thermostat, 266=On/Off Plug, 21=Contact Sensor)
- **Clusters**: Feature groups on endpoints (e.g., 0x0006=On/Off, 0x001E=Binding)

### Matter Binding Cluster

- Cluster ID: `0x001E` (30)
- Bindings are stored as attributes on the source device's endpoint
- Each binding specifies: target node ID, target endpoint ID, and cluster ID

### HA Device Registry Integration

Matter devices in HA use identifiers like:

```
("matter", "deviceid_{fabric_id}-{node_id_hex_16}-MatterNodeDevice")
```

Where `node_id_hex_16` is the node ID as 16-digit uppercase hex (e.g., node 3 = `0000000000000003`).

### WebSocket API Pattern

Commands follow the pattern `matter_binding_helper/{action}` and are registered via `websocket_api.async_register_command()`.

### Demo Mode

Enable via Settings → Devices & Services → Matter Binding Helper → Configure. Returns mock nodes/bindings for UI development without real Matter devices.

## Docker Services

- `homeassistant`: HA with custom component mounted read-only
- `matter-server`: python-matter-server on ws://matter-server:5580/ws
- `rust-light`: Mock device on port 5540
