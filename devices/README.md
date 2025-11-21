# Mock Matter Devices

Mock Matter devices for development and testing the Home Assistant integration.

## Quick Start

```bash
# Start mock device
docker compose up -d

# Test API
echo '{"cmd":"get_state"}' | nc localhost 5540

# View logs
docker compose logs -f
```

## API

The mock device exposes a JSON TCP API on port 5540.

### Commands

| Command | Description |
|---------|-------------|
| `{"cmd":"get_state"}` | Get full device state |
| `{"cmd":"toggle"}` | Toggle on/off |
| `{"cmd":"set_on","value":true}` | Set on/off state |
| `{"cmd":"set_level","value":50}` | Set brightness (0-100) |
| `{"cmd":"add_binding","node_id":123,"endpoint_id":1,"cluster_id":6}` | Add binding |
| `{"cmd":"remove_binding","node_id":123,"endpoint_id":1}` | Remove binding |
| `{"cmd":"get_bindings"}` | List all bindings |
| `{"cmd":"add_group","group_id":1}` | Join group |
| `{"cmd":"remove_group","group_id":1}` | Leave group |

### Example

```bash
# Get state
echo '{"cmd":"get_state"}' | nc localhost 5540
# {"success":true,"data":{"on":false,"level":100,"bindings":[],"groups":[]}}

# Toggle light
echo '{"cmd":"toggle"}' | nc localhost 5540
# {"success":true,"data":{"on":true}}

# Add a binding
echo '{"cmd":"add_binding","node_id":12345,"endpoint_id":1,"cluster_id":6}' | nc localhost 5540
# {"success":true,"data":{"node_id":12345,"endpoint_id":1,"cluster_id":6}}
```

## Device Configuration

Default device (rust-light):
- Port: 5540
- Discriminator: 3840
- Passcode: 20202021

Additional device (rust-switch, use `--profile multi`):
- Port: 5541
- Discriminator: 3841
- Passcode: 20202022

## Simulated Clusters

The mock device simulates these Matter clusters:

| Cluster | ID | Description |
|---------|------|-------------|
| On/Off | 0x0006 | Basic on/off control |
| Level Control | 0x0008 | Dimming |
| **Binding** | 0x001E | Device-to-device bindings |
| Descriptor | 0x001D | Device description |

## Note on Real Matter Devices

This mock device provides a JSON API for testing the HA integration UI. It does **not** implement the full Matter protocol.

For actual Matter commissioning, you need either:
- Real Matter-certified devices
- The C++ Matter SDK (`chip-all-clusters-app`)
- An ESP32 with Matter firmware
