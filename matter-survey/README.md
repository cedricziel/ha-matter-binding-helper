# Matter Survey

A community-driven database of Matter device capabilities, powered by anonymized telemetry from the [Matter Binding Helper](https://github.com/cedricziel/ha-matter-helper) Home Assistant integration.

## Features

- **Device Index**: Browse all known Matter devices and their capabilities
- **Capability Database**: See which clusters and device types each product supports
- **Binding Compatibility**: Identify devices that support Matter binding
- **Version Tracking**: Track hardware and software versions across devices

## Privacy

This service is designed with privacy in mind:

- **No personal data collected**: We never receive device names, locations, or any user-configured information
- **Only public device info**: Vendor IDs, product IDs, and capability data that's part of the Matter specification
- **Anonymous installations**: A random UUID is used only for deduplication, not tracking
- **Opt-out available**: Users can disable telemetry during integration setup or in settings

## API

### POST /api/submit

Receive telemetry submissions from Home Assistant integrations.

**Request Body:**
```json
{
  "installation_id": "uuid",
  "schema_version": 1,
  "devices": [
    {
      "vendor_id": 1234,
      "vendor_name": "Acme Corp",
      "product_id": 5678,
      "product_name": "Smart Light",
      "hardware_version": "1.0",
      "software_version": "2.1.0",
      "endpoints": [
        {
          "endpoint_id": 1,
          "device_types": [{"id": 256, "revision": 2}],
          "clusters": [6, 8, 30],
          "has_binding_cluster": true
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Processed 1 devices",
  "devices_processed": 1
}
```

## Development

### Requirements

- PHP 8.1+
- SQLite 3
- Composer

### Local Setup

1. Install dependencies:
   ```bash
   composer install
   ```

2. Start the development server:
   ```bash
   composer serve
   ```

3. Open http://localhost:8080 in your browser

### Docker

```bash
docker-compose up -d
```

The app will be available at http://localhost:8080

### Database

The SQLite database is automatically created in `data/matter-survey.db` when the app first runs. The schema is defined in `schema.sql`.

## License

MIT
