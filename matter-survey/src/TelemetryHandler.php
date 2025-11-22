<?php

declare(strict_types=1);

namespace MatterSurvey;

use PDO;

class TelemetryHandler
{
    private PDO $db;
    private DeviceRepository $deviceRepo;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->deviceRepo = new DeviceRepository($this->db);
    }

    /**
     * Process a telemetry submission from the Home Assistant integration.
     *
     * @param array $payload The JSON payload from the integration
     * @param string|null $ipHash Hashed IP for rate limiting
     * @return array Result with success status and message
     */
    public function processSubmission(array $payload, ?string $ipHash = null): array
    {
        // Validate payload structure
        $validation = $this->validatePayload($payload);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        $installationId = $payload['installation_id'];
        $devices = $payload['devices'];

        try {
            $this->db->beginTransaction();

            // Track installation
            $this->recordInstallation($installationId);

            // Log submission
            $this->logSubmission($installationId, count($devices), $ipHash);

            // Process each device
            $processedCount = 0;
            foreach ($devices as $device) {
                if ($this->processDevice($device)) {
                    $processedCount++;
                }
            }

            $this->db->commit();

            return [
                'success' => true,
                'message' => "Processed $processedCount devices",
                'devices_processed' => $processedCount,
            ];
        } catch (\Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'error' => 'Database error: ' . $e->getMessage()];
        }
    }

    /**
     * Validate the payload structure.
     */
    private function validatePayload(array $payload): array
    {
        if (empty($payload['installation_id'])) {
            return ['valid' => false, 'error' => 'Missing installation_id'];
        }

        if (!isset($payload['devices']) || !is_array($payload['devices'])) {
            return ['valid' => false, 'error' => 'Missing or invalid devices array'];
        }

        // Validate installation_id format (should be UUID)
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $payload['installation_id'])) {
            return ['valid' => false, 'error' => 'Invalid installation_id format'];
        }

        return ['valid' => true];
    }

    /**
     * Record or update installation tracking.
     */
    private function recordInstallation(string $installationId): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO installations (installation_id, last_seen, submission_count)
            VALUES (:id, CURRENT_TIMESTAMP, 1)
            ON CONFLICT(installation_id) DO UPDATE SET
                last_seen = CURRENT_TIMESTAMP,
                submission_count = installations.submission_count + 1
        ');
        $stmt->execute([':id' => $installationId]);
    }

    /**
     * Log the submission for audit trail.
     */
    private function logSubmission(string $installationId, int $deviceCount, ?string $ipHash): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO submissions (installation_id, device_count, ip_hash)
            VALUES (:installation_id, :device_count, :ip_hash)
        ');
        $stmt->execute([
            ':installation_id' => $installationId,
            ':device_count' => $deviceCount,
            ':ip_hash' => $ipHash,
        ]);
    }

    /**
     * Process a single device from the payload.
     */
    private function processDevice(array $device): bool
    {
        // Skip devices without vendor/product identification
        if (empty($device['vendor_id']) && empty($device['product_id'])) {
            return false;
        }

        // Upsert the device
        $deviceId = $this->deviceRepo->upsertDevice([
            'vendor_id' => $device['vendor_id'] ?? null,
            'vendor_name' => $this->sanitizeString($device['vendor_name'] ?? null),
            'product_id' => $device['product_id'] ?? null,
            'product_name' => $this->sanitizeString($device['product_name'] ?? null),
        ]);

        // Track version info
        $this->deviceRepo->upsertVersion(
            $deviceId,
            $this->sanitizeString($device['hardware_version'] ?? null),
            $this->sanitizeString($device['software_version'] ?? null)
        );

        // Process endpoints
        foreach ($device['endpoints'] ?? [] as $endpoint) {
            $this->deviceRepo->upsertEndpoint($deviceId, [
                'endpoint_id' => $endpoint['endpoint_id'] ?? 0,
                'device_types' => $endpoint['device_types'] ?? [],
                'clusters' => $endpoint['clusters'] ?? [],
                'has_binding_cluster' => $endpoint['has_binding_cluster'] ?? false,
            ]);
        }

        return true;
    }

    /**
     * Sanitize string input.
     */
    private function sanitizeString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        // Trim and limit length
        $value = trim($value);
        if (strlen($value) > 255) {
            $value = substr($value, 0, 255);
        }

        // Remove any control characters
        $value = preg_replace('/[\x00-\x1F\x7F]/', '', $value);

        return $value ?: null;
    }

    /**
     * Get submission statistics.
     */
    public function getStats(): array
    {
        $stats = [];

        // Total devices
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM devices');
        $stats['total_devices'] = (int) $stmt->fetch()['count'];

        // Total installations
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM installations');
        $stats['total_installations'] = (int) $stmt->fetch()['count'];

        // Total submissions
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM submissions');
        $stats['total_submissions'] = (int) $stmt->fetch()['count'];

        // Devices with binding support
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM device_summary WHERE supports_binding = 1');
        $stats['bindable_devices'] = (int) $stmt->fetch()['count'];

        // Top vendors
        $stmt = $this->db->query('
            SELECT vendor_name, COUNT(*) as device_count
            FROM devices
            WHERE vendor_name IS NOT NULL
            GROUP BY vendor_name
            ORDER BY device_count DESC
            LIMIT 10
        ');
        $stats['top_vendors'] = $stmt->fetchAll();

        return $stats;
    }
}
