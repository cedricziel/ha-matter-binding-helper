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
cd frontend && npm test       # Run vitest unit tests (watch mode)
cd frontend && npm test -- --run  # Run tests once (CI mode)
```

### Virtual Matter Devices (rs-matter)

```bash
make devices-start     # Build and start real rs-matter devices
make devices-logs      # View device logs (includes QR commissioning code)
make devices-reset     # Reset device state (requires re-commissioning)
make devices-commission CODE=<pairing-code>  # Commission device to Matter server
```

### Integration Testing

```bash
make test-integration  # Run pytest tests with testcontainers (isolated Docker environment)
```

Tests use testcontainers to automatically spin up Home Assistant and Matter server containers. Demo mode is enabled for predictable test data.

To run a single test:
```bash
.venv/bin/python -m pytest tests/test_nodes.py::test_list_nodes_returns_devices -v
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

### Virtual Devices (Rust - rs-matter)

- **`devices/rust-device/`**: Real Matter devices using rs-matter library
- **Binaries**: `dimmable_light` (On/Off + Level Control + Binding), `on_off_switch` (Binding only)
- Devices can be commissioned to the Matter server and controlled via HA
- Environment variables: `MATTER_DISCRIMINATOR`, `MATTER_PASSCODE`, `MATTER_PORT`, `MATTER_DEVICE_NAME`

### Integration Tests

- **`tests/conftest.py`**: Testcontainers fixtures (HA, Matter server), HABootstrapper for automated onboarding
- **`tests/test_nodes.py`**: Node discovery tests
- **`tests/test_bindings.py`**: Binding CRUD tests
- **`tests/test_acl.py`**: ACL verification tests

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

### Access Control Lists (ACL)

- ACLs grant permission for one node to control another
- When creating a binding from Node A → Node B, an ACL entry must be added to Node B allowing Node A to operate
- The UI automatically provisions ACLs when creating bindings (`provision_acl=true`)
- "Repair ACL" feature fixes bindings created before automatic ACL provisioning was added

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
- `dimmable-light`: rs-matter dimmable light on port 5540 (discriminator 3840)
- `on-off-switch`: rs-matter on/off switch on port 5541 (discriminator 3841)

## Matter Survey (matter-survey.org)

A Symfony 7 microframework app for collecting anonymous Matter device telemetry from the Home Assistant integration.

### Local Development

```bash
make survey-serve      # Start local dev server at http://localhost:8080
```

### Deployment

```bash
make survey-deploy     # Deploy via rsync + SSH, runs composer on server
```

Requires `.env` with `SFTP_USER`, `SFTP_HOST`, `SFTP_PATH`.

### Architecture

- **Framework**: Symfony 7 with MicroKernelTrait
- **Database**: SQLite at `data/matter-survey.db`
- **Templates**: Twig
- **Key files**:
  - `matter-survey/src/Controller/DeviceController.php` - Web UI routes
  - `matter-survey/src/Controller/ApiController.php` - `/api/submit` endpoint
  - `matter-survey/src/Service/TelemetryService.php` - Processes telemetry submissions
  - `matter-survey/src/Service/MatterRegistry.php` - Device/cluster type lookups
  - `matter-survey/config/packages/` - Symfony bundle configs (rate limiter, CORS, cache)

### Telemetry Integration

The HA integration sends telemetry to `https://matter-survey.org/api/submit`. URL configured in `custom_components/matter_binding_helper/const.py` as `TELEMETRY_URL`.
