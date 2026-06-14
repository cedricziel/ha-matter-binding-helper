# Matter Test Devices

Real Matter protocol devices built with [rs-matter](https://github.com/project-chip/rs-matter) for testing the Home Assistant integration.

## Quick Start

```bash
# From project root:

# Start matter-server and all devices (dimmable light + on/off switch)
docker compose --profile devices up -d

# Wait for initialization (~15 seconds)
sleep 15

# Commission the dimmable light (PIN: 20202021)
docker exec matter-server python3 /scripts/commission-device.py --ip 192.168.65.3 20202021

# Commission the on/off switch (PIN: 20202022)
docker exec matter-server python3 /scripts/commission-device.py --ip 192.168.65.3 20202022

# View device logs
docker compose logs dimmable-light on-off-switch -f
```

## Available Devices

### Dimmable Light (Port 5540)

A Matter dimmable light (device type 0x0101) with:

| Cluster | ID | Description |
|---------|------|-------------|
| On/Off | 0x0006 | On/off control |
| Level Control | 0x0008 | Brightness dimming |
| Binding | 0x001E | Device-to-device bindings |
| Groups | 0x0004 | Group membership (groupcast target) |
| Descriptor | 0x001D | Device description |

**Configuration (via environment variables):**

| Variable | Default | Description |
|----------|---------|-------------|
| `MATTER_DISCRIMINATOR` | 3840 | Device discriminator |
| `MATTER_PASSCODE` | 20202021 | Setup PIN code |
| `MATTER_PORT` | 5540 | Matter UDP port |
| `MATTER_DEVICE_NAME` | Test Dimmable Light | Device name |
| `MATTER_PERSIST_PATH` | /data/matter.bin | Persistence file path |
| `RUST_LOG` | info | Log level (debug, info, warn, error) |

### On/Off Light Switch (Port 5541)

A Matter on/off light switch (device type 0x0103) that controls other devices via bindings:

| Cluster | ID | Description |
|---------|------|-------------|
| Binding | 0x001E | Device-to-device bindings (targets for control) |
| Groups | 0x0004 | Group membership (groupcast target) |
| Descriptor | 0x001D | Device description |

**Configuration (via environment variables):**

| Variable | Default | Description |
|----------|---------|-------------|
| `MATTER_DISCRIMINATOR` | 3841 | Device discriminator |
| `MATTER_PASSCODE` | 20202022 | Setup PIN code |
| `MATTER_PORT` | 5541 | Matter UDP port |
| `MATTER_DEVICE_NAME` | Test On/Off Switch | Device name |
| `MATTER_PERSIST_PATH` | /data/matter.bin | Persistence file path |
| `RUST_LOG` | info | Log level (debug, info, warn, error) |

## Commission Script

The `scripts/commission-device.py` script commissions devices via the matter-server WebSocket API:

```bash
# Commission device at IP with PIN code
docker exec matter-server python3 /scripts/commission-device.py --ip <device-ip> <pin-code>

# Example
docker exec matter-server python3 /scripts/commission-device.py --ip 192.168.65.3 20202021
```

## Development

### Reset Device State

```bash
# Stop containers and remove data volumes
docker compose --profile devices down
docker volume rm dimmable-light-data matter-server-data

# Start fresh
docker compose --profile devices up -d
```

### Rebuild After Code Changes

```bash
docker compose --profile devices build dimmable-light
docker compose --profile devices up -d
```

### View Commissioning QR Code

```bash
docker compose logs dimmable-light 2>&1 | grep -A 20 "COMMISSIONING INFO"
```

## Architecture

The device uses:

- **rs-matter**: Rust implementation of the Matter protocol
- **Host networking**: Required for mDNS device discovery
- **FilteredNetifs**: Reports minimal network interface to avoid Docker veth overflow

## Troubleshooting

**Device interview fails with InvalidAction:**

- This was caused by too many Docker network interfaces being reported
- Fixed by using `FilteredNetifs` which reports a single interface

**Commission script hangs:**

- Ensure matter-server is fully initialized before commissioning
- Wait ~15 seconds after starting containers

**Device not discovered:**

- Both device and matter-server need host networking for mDNS
- On macOS with Docker Desktop, host networking is virtualized
