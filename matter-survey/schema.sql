-- Matter Survey Database Schema
-- SQLite compatible

-- Devices table: stores unique device products
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER,
    vendor_name TEXT,
    product_id INTEGER,
    product_name TEXT,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_count INTEGER DEFAULT 1,
    UNIQUE(vendor_id, product_id)
);

-- Device versions: tracks hardware/software versions seen for each device
CREATE TABLE IF NOT EXISTS device_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    hardware_version TEXT,
    software_version TEXT,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    count INTEGER DEFAULT 1,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    UNIQUE(device_id, hardware_version, software_version)
);

-- Device endpoints: capability structure per endpoint
CREATE TABLE IF NOT EXISTS device_endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    endpoint_id INTEGER NOT NULL,
    device_types JSON NOT NULL,  -- [{id: int, revision: int}]
    clusters JSON NOT NULL,      -- [int, int, ...]
    has_binding_cluster BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    UNIQUE(device_id, endpoint_id)
);

-- Installations: track unique installations for deduplication
CREATE TABLE IF NOT EXISTS installations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    installation_id TEXT UNIQUE NOT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_count INTEGER DEFAULT 1
);

-- Submissions log: audit trail of submissions
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    installation_id TEXT NOT NULL,
    device_count INTEGER NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT  -- Hashed IP for rate limiting, not identification
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_vendor ON devices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_devices_product ON devices(product_id);
CREATE INDEX IF NOT EXISTS idx_device_endpoints_device ON device_endpoints(device_id);
CREATE INDEX IF NOT EXISTS idx_device_versions_device ON device_versions(device_id);
CREATE INDEX IF NOT EXISTS idx_submissions_installation ON submissions(installation_id);

-- Views for common queries

-- Device summary with endpoint count
CREATE VIEW IF NOT EXISTS device_summary AS
SELECT
    d.id,
    d.vendor_id,
    d.vendor_name,
    d.product_id,
    d.product_name,
    d.submission_count,
    d.first_seen,
    d.last_seen,
    COUNT(DISTINCT de.endpoint_id) as endpoint_count,
    MAX(de.has_binding_cluster) as supports_binding
FROM devices d
LEFT JOIN device_endpoints de ON d.id = de.device_id
GROUP BY d.id;

-- Cluster usage statistics
CREATE VIEW IF NOT EXISTS cluster_stats AS
SELECT
    json_each.value as cluster_id,
    COUNT(DISTINCT de.device_id) as device_count
FROM device_endpoints de, json_each(de.clusters)
GROUP BY json_each.value
ORDER BY device_count DESC;
