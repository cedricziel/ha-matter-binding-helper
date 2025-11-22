<?php

declare(strict_types=1);

namespace App\Repository;

use App\Service\DatabaseService;
use PDO;

class DeviceRepository
{
    private PDO $db;

    public function __construct(DatabaseService $databaseService)
    {
        $this->db = $databaseService->getConnection();
    }

    public function upsertDevice(array $deviceData): int
    {
        $stmt = $this->db->prepare('
            INSERT INTO devices (vendor_id, vendor_name, product_id, product_name, last_seen, submission_count)
            VALUES (:vendor_id, :vendor_name, :product_id, :product_name, CURRENT_TIMESTAMP, 1)
            ON CONFLICT(vendor_id, product_id) DO UPDATE SET
                vendor_name = COALESCE(excluded.vendor_name, devices.vendor_name),
                product_name = COALESCE(excluded.product_name, devices.product_name),
                last_seen = CURRENT_TIMESTAMP,
                submission_count = devices.submission_count + 1
            RETURNING id
        ');

        $stmt->execute([
            ':vendor_id' => $deviceData['vendor_id'],
            ':vendor_name' => $deviceData['vendor_name'],
            ':product_id' => $deviceData['product_id'],
            ':product_name' => $deviceData['product_name'],
        ]);

        $result = $stmt->fetch();
        return (int) $result['id'];
    }

    public function upsertVersion(int $deviceId, ?string $hardwareVersion, ?string $softwareVersion): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO device_versions (device_id, hardware_version, software_version, last_seen, count)
            VALUES (:device_id, :hardware_version, :software_version, CURRENT_TIMESTAMP, 1)
            ON CONFLICT(device_id, hardware_version, software_version) DO UPDATE SET
                last_seen = CURRENT_TIMESTAMP,
                count = device_versions.count + 1
        ');

        $stmt->execute([
            ':device_id' => $deviceId,
            ':hardware_version' => $hardwareVersion,
            ':software_version' => $softwareVersion,
        ]);
    }

    public function upsertEndpoint(int $deviceId, array $endpointData): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO device_endpoints (device_id, endpoint_id, device_types, clusters, has_binding_cluster)
            VALUES (:device_id, :endpoint_id, :device_types, :clusters, :has_binding_cluster)
            ON CONFLICT(device_id, endpoint_id) DO UPDATE SET
                device_types = excluded.device_types,
                clusters = excluded.clusters,
                has_binding_cluster = excluded.has_binding_cluster
        ');

        $stmt->execute([
            ':device_id' => $deviceId,
            ':endpoint_id' => $endpointData['endpoint_id'],
            ':device_types' => json_encode($endpointData['device_types'] ?? []),
            ':clusters' => json_encode($endpointData['clusters'] ?? []),
            ':has_binding_cluster' => $endpointData['has_binding_cluster'] ? 1 : 0,
        ]);
    }

    public function getAllDevices(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM device_summary
            ORDER BY submission_count DESC, last_seen DESC
            LIMIT :limit OFFSET :offset
        ');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getDeviceCount(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM devices');
        return (int) $stmt->fetch()['count'];
    }

    public function getDevice(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM device_summary WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getDeviceEndpoints(int $deviceId): array
    {
        $stmt = $this->db->prepare('
            SELECT endpoint_id, device_types, clusters, has_binding_cluster
            FROM device_endpoints
            WHERE device_id = :device_id
            ORDER BY endpoint_id
        ');
        $stmt->execute([':device_id' => $deviceId]);

        $endpoints = [];
        while ($row = $stmt->fetch()) {
            $row['device_types'] = json_decode($row['device_types'], true);
            $row['clusters'] = json_decode($row['clusters'], true);
            $row['has_binding_cluster'] = (bool) $row['has_binding_cluster'];
            $endpoints[] = $row;
        }

        return $endpoints;
    }

    public function getDeviceVersions(int $deviceId): array
    {
        $stmt = $this->db->prepare('
            SELECT hardware_version, software_version, count, first_seen, last_seen
            FROM device_versions
            WHERE device_id = :device_id
            ORDER BY count DESC
        ');
        $stmt->execute([':device_id' => $deviceId]);
        return $stmt->fetchAll();
    }

    public function searchDevices(string $query, int $limit = 50): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM device_summary
            WHERE vendor_name LIKE :query
               OR product_name LIKE :query
               OR CAST(vendor_id AS TEXT) LIKE :query
               OR CAST(product_id AS TEXT) LIKE :query
            ORDER BY submission_count DESC
            LIMIT :limit
        ');
        $stmt->bindValue(':query', "%$query%", PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
