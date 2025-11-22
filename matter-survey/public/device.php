<?php

/**
 * Matter Survey - Device Detail Page
 *
 * Shows detailed information about a specific Matter device.
 */

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use MatterSurvey\DeviceRepository;

$deviceId = (int) ($_GET['id'] ?? 0);
if ($deviceId <= 0) {
    header('Location: index.php');
    exit;
}

$deviceRepo = new DeviceRepository();
$device = $deviceRepo->getDevice($deviceId);

if (!$device) {
    header('HTTP/1.0 404 Not Found');
    echo '<!DOCTYPE html><html><head><title>Device Not Found</title></head><body><h1>Device not found</h1><p><a href="index.php">Back to index</a></p></body></html>';
    exit;
}

$endpoints = $deviceRepo->getDeviceEndpoints($deviceId);
$versions = $deviceRepo->getDeviceVersions($deviceId);

// Cluster name lookup
$clusterNames = [
    0x0003 => 'Identify',
    0x0004 => 'Groups',
    0x0005 => 'Scenes',
    0x0006 => 'On/Off',
    0x0008 => 'Level Control',
    0x001D => 'Descriptor',
    0x001E => 'Binding',
    0x001F => 'Access Control',
    0x0028 => 'Basic Information',
    0x0029 => 'OTA Software Update Provider',
    0x002A => 'OTA Software Update Requestor',
    0x002B => 'Localization Configuration',
    0x002C => 'Time Format Localization',
    0x002D => 'Unit Localization',
    0x002E => 'Power Source Configuration',
    0x002F => 'Power Source',
    0x0030 => 'General Commissioning',
    0x0031 => 'Network Commissioning',
    0x0032 => 'Diagnostic Logs',
    0x0033 => 'General Diagnostics',
    0x0034 => 'Software Diagnostics',
    0x0035 => 'Thread Network Diagnostics',
    0x0036 => 'WiFi Network Diagnostics',
    0x0037 => 'Ethernet Network Diagnostics',
    0x0038 => 'Time Synchronization',
    0x0039 => 'Bridged Device Basic Information',
    0x003C => 'Administrator Commissioning',
    0x003E => 'Node Operational Credentials',
    0x003F => 'Group Key Management',
    0x0040 => 'Fixed Label',
    0x0041 => 'User Label',
    0x0045 => 'Boolean State',
    0x0050 => 'Mode Select',
    0x0101 => 'Door Lock',
    0x0102 => 'Window Covering',
    0x0200 => 'Pump Configuration and Control',
    0x0201 => 'Thermostat',
    0x0202 => 'Fan Control',
    0x0204 => 'Thermostat User Interface Configuration',
    0x0300 => 'Color Control',
    0x0301 => 'Ballast Configuration',
    0x0400 => 'Illuminance Measurement',
    0x0402 => 'Temperature Measurement',
    0x0403 => 'Pressure Measurement',
    0x0404 => 'Flow Measurement',
    0x0405 => 'Relative Humidity Measurement',
    0x0406 => 'Occupancy Sensing',
    0x0500 => 'IAS Zone',
    0x0503 => 'Wake on LAN',
    0x0504 => 'Channel',
    0x0505 => 'Target Navigator',
    0x0506 => 'Media Playback',
    0x0507 => 'Media Input',
    0x0508 => 'Low Power',
    0x0509 => 'Keypad Input',
    0x050A => 'Content Launcher',
    0x050B => 'Audio Output',
    0x050C => 'Application Launcher',
    0x050D => 'Application Basic',
    0x050E => 'Account Login',
];

// Device type name lookup
$deviceTypeNames = [
    10 => 'Door Lock',
    17 => 'Power Source',
    21 => 'Contact Sensor',
    22 => 'Root Node',
    23 => 'Bridged Node',
    44 => 'Smoke/CO Alarm',
    256 => 'On/Off Light',
    257 => 'Dimmable Light',
    258 => 'Color Temperature Light',
    259 => 'On/Off Light Switch',
    260 => 'Dimmer Switch',
    261 => 'Color Dimmer Switch',
    262 => 'Light Sensor',
    263 => 'Occupancy Sensor',
    266 => 'On/Off Plug-in Unit',
    267 => 'Dimmable Plug-in Unit',
    268 => 'Pump',
    514 => 'Window Covering',
    515 => 'Window Covering Controller',
    769 => 'Thermostat',
    770 => 'Temperature Sensor',
    771 => 'Humidity Sensor',
    772 => 'Fan',
    773 => 'Air Purifier',
    774 => 'Air Quality Sensor',
];

function getClusterName(int $id): string {
    global $clusterNames;
    return $clusterNames[$id] ?? sprintf('Cluster 0x%04X', $id);
}

function getDeviceTypeName(int $id): string {
    global $deviceTypeNames;
    return $deviceTypeNames[$id] ?? "Device Type $id";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($device['product_name'] ?? 'Unknown Device') ?> - Matter Survey</title>
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-500: #6b7280;
            --gray-700: #374151;
            --gray-900: #111827;
            --green-100: #dcfce7;
            --green-700: #15803d;
            --blue-100: #dbeafe;
            --blue-700: #1d4ed8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--gray-900);
            background: var(--gray-50);
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        header {
            background: white;
            border-bottom: 1px solid var(--gray-200);
            padding: 1rem 0;
            margin-bottom: 2rem;
        }

        header h1 {
            font-size: 1.5rem;
            font-weight: 600;
        }

        header h1 a {
            color: var(--gray-900);
            text-decoration: none;
        }

        .breadcrumb {
            font-size: 0.875rem;
            color: var(--gray-500);
            margin-bottom: 0.5rem;
        }

        .breadcrumb a {
            color: var(--primary);
            text-decoration: none;
        }

        .device-header {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--gray-200);
            margin-bottom: 1.5rem;
        }

        .device-header h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .device-header .vendor {
            color: var(--gray-500);
            margin-bottom: 1rem;
        }

        .device-ids {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }

        .device-id {
            font-size: 0.875rem;
        }

        .device-id .label {
            color: var(--gray-500);
        }

        .device-id .value {
            font-family: monospace;
            background: var(--gray-100);
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
        }

        .section {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--gray-200);
            margin-bottom: 1.5rem;
        }

        .section h3 {
            font-size: 1.125rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--gray-200);
        }

        .endpoint {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--gray-100);
        }

        .endpoint:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }

        .endpoint-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .endpoint-header h4 {
            font-size: 1rem;
            font-weight: 600;
        }

        .badge {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .badge-binding {
            background: var(--green-100);
            color: var(--green-700);
        }

        .device-types, .clusters {
            margin-bottom: 0.75rem;
        }

        .device-types .label, .clusters .label {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--gray-500);
            margin-bottom: 0.25rem;
        }

        .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
        }

        .tag {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: var(--gray-100);
            border-radius: 0.25rem;
            font-size: 0.8125rem;
        }

        .tag-primary {
            background: var(--blue-100);
            color: var(--blue-700);
        }

        .versions-table {
            width: 100%;
            border-collapse: collapse;
        }

        .versions-table th, .versions-table td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid var(--gray-200);
        }

        .versions-table th {
            font-weight: 600;
            color: var(--gray-500);
            font-size: 0.75rem;
            text-transform: uppercase;
        }

        .back-link {
            margin-bottom: 1rem;
        }

        .back-link a {
            color: var(--primary);
            text-decoration: none;
        }

        footer {
            text-align: center;
            padding: 2rem;
            color: var(--gray-500);
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1><a href="index.php">Matter Survey</a></h1>
        </div>
    </header>

    <main class="container">
        <div class="breadcrumb">
            <a href="index.php">All Devices</a> &raquo;
            <?= htmlspecialchars($device['vendor_name'] ?? 'Unknown Vendor') ?>
        </div>

        <div class="device-header">
            <h2><?= htmlspecialchars($device['product_name'] ?? 'Unknown Product') ?></h2>
            <div class="vendor"><?= htmlspecialchars($device['vendor_name'] ?? 'Unknown Vendor') ?></div>
            <div class="device-ids">
                <div class="device-id">
                    <span class="label">Vendor ID:</span>
                    <span class="value"><?= $device['vendor_id'] ?? 'N/A' ?></span>
                </div>
                <div class="device-id">
                    <span class="label">Product ID:</span>
                    <span class="value"><?= $device['product_id'] ?? 'N/A' ?></span>
                </div>
                <div class="device-id">
                    <span class="label">Seen:</span>
                    <span class="value"><?= number_format($device['submission_count']) ?> time<?= $device['submission_count'] != 1 ? 's' : '' ?></span>
                </div>
                <?php if ($device['supports_binding']): ?>
                    <span class="badge badge-binding">Supports Binding</span>
                <?php endif; ?>
            </div>
        </div>

        <?php if (!empty($endpoints)): ?>
            <div class="section">
                <h3>Endpoints (<?= count($endpoints) ?>)</h3>
                <?php foreach ($endpoints as $ep): ?>
                    <div class="endpoint">
                        <div class="endpoint-header">
                            <h4>Endpoint <?= $ep['endpoint_id'] ?></h4>
                            <?php if ($ep['has_binding_cluster']): ?>
                                <span class="badge badge-binding">Has Binding Cluster</span>
                            <?php endif; ?>
                        </div>

                        <?php if (!empty($ep['device_types'])): ?>
                            <div class="device-types">
                                <div class="label">Device Types</div>
                                <div class="tag-list">
                                    <?php foreach ($ep['device_types'] as $dt): ?>
                                        <span class="tag tag-primary">
                                            <?= getDeviceTypeName($dt['id']) ?>
                                            <small>(<?= $dt['id'] ?>, rev <?= $dt['revision'] ?? 1 ?>)</small>
                                        </span>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($ep['clusters'])): ?>
                            <div class="clusters">
                                <div class="label">Clusters</div>
                                <div class="tag-list">
                                    <?php foreach ($ep['clusters'] as $cluster): ?>
                                        <span class="tag"><?= getClusterName($cluster) ?></span>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($versions)): ?>
            <div class="section">
                <h3>Known Versions</h3>
                <table class="versions-table">
                    <thead>
                        <tr>
                            <th>Hardware Version</th>
                            <th>Software Version</th>
                            <th>Count</th>
                            <th>First Seen</th>
                            <th>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($versions as $v): ?>
                            <tr>
                                <td><?= htmlspecialchars($v['hardware_version'] ?? 'N/A') ?></td>
                                <td><?= htmlspecialchars($v['software_version'] ?? 'N/A') ?></td>
                                <td><?= number_format($v['count']) ?></td>
                                <td><?= $v['first_seen'] ?></td>
                                <td><?= $v['last_seen'] ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>

        <div class="back-link">
            <a href="index.php">&laquo; Back to device index</a>
        </div>
    </main>

    <footer>
        <p>Data contributed by Matter Binding Helper users.</p>
    </footer>
</body>
</html>
