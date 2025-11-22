<?php

/**
 * Matter Survey - Device Index
 *
 * Main page showing all known Matter devices and their capabilities.
 */

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use MatterSurvey\DeviceRepository;
use MatterSurvey\TelemetryHandler;

// Get query parameters
$page = max(1, (int) ($_GET['page'] ?? 1));
$search = trim($_GET['q'] ?? '');
$perPage = 50;
$offset = ($page - 1) * $perPage;

$deviceRepo = new DeviceRepository();
$telemetryHandler = new TelemetryHandler();

// Get devices (search or list all)
if ($search !== '') {
    $devices = $deviceRepo->searchDevices($search, $perPage);
    $totalDevices = count($devices);
} else {
    $devices = $deviceRepo->getAllDevices($perPage, $offset);
    $totalDevices = $deviceRepo->getDeviceCount();
}

$totalPages = max(1, (int) ceil($totalDevices / $perPage));
$stats = $telemetryHandler->getStats();

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
    return $clusterNames[$id] ?? sprintf('0x%04X', $id);
}

function getDeviceTypeName(int $id): string {
    global $deviceTypeNames;
    return $deviceTypeNames[$id] ?? "Type $id";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matter Survey - Device Index</title>
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
            max-width: 1200px;
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

        header p {
            color: var(--gray-500);
            font-size: 0.875rem;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid var(--gray-200);
        }

        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--primary);
        }

        .stat-card .label {
            font-size: 0.875rem;
            color: var(--gray-500);
        }

        .search-box {
            margin-bottom: 1.5rem;
        }

        .search-box form {
            display: flex;
            gap: 0.5rem;
        }

        .search-box input[type="text"] {
            flex: 1;
            padding: 0.5rem 1rem;
            border: 1px solid var(--gray-300);
            border-radius: 0.375rem;
            font-size: 1rem;
        }

        .search-box button {
            padding: 0.5rem 1rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 1rem;
        }

        .search-box button:hover {
            background: var(--primary-dark);
        }

        .device-list {
            background: white;
            border-radius: 0.5rem;
            border: 1px solid var(--gray-200);
            overflow: hidden;
        }

        .device-item {
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .device-item:last-child {
            border-bottom: none;
        }

        .device-item:hover {
            background: var(--gray-50);
        }

        .device-info h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .device-info h3 a {
            color: var(--gray-900);
            text-decoration: none;
        }

        .device-info h3 a:hover {
            color: var(--primary);
        }

        .device-meta {
            font-size: 0.875rem;
            color: var(--gray-500);
        }

        .device-badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
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

        .badge-endpoints {
            background: var(--gray-100);
            color: var(--gray-700);
        }

        .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin: 2rem 0;
        }

        .pagination a, .pagination span {
            padding: 0.5rem 1rem;
            border: 1px solid var(--gray-300);
            border-radius: 0.375rem;
            text-decoration: none;
            color: var(--gray-700);
        }

        .pagination a:hover {
            background: var(--gray-100);
        }

        .pagination .current {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--gray-500);
        }

        footer {
            text-align: center;
            padding: 2rem;
            color: var(--gray-500);
            font-size: 0.875rem;
        }

        footer a {
            color: var(--primary);
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Matter Survey</h1>
            <p>Community-driven database of Matter device capabilities</p>
        </div>
    </header>

    <main class="container">
        <div class="stats">
            <div class="stat-card">
                <div class="value"><?= number_format($stats['total_devices']) ?></div>
                <div class="label">Known Devices</div>
            </div>
            <div class="stat-card">
                <div class="value"><?= number_format($stats['bindable_devices']) ?></div>
                <div class="label">Support Binding</div>
            </div>
            <div class="stat-card">
                <div class="value"><?= number_format($stats['total_installations']) ?></div>
                <div class="label">Contributors</div>
            </div>
            <div class="stat-card">
                <div class="value"><?= number_format($stats['total_submissions']) ?></div>
                <div class="label">Submissions</div>
            </div>
        </div>

        <div class="search-box">
            <form method="get" action="">
                <input type="text" name="q" placeholder="Search by vendor or product name..." value="<?= htmlspecialchars($search) ?>">
                <button type="submit">Search</button>
            </form>
        </div>

        <?php if (empty($devices)): ?>
            <div class="empty-state">
                <?php if ($search !== ''): ?>
                    <p>No devices found matching "<?= htmlspecialchars($search) ?>"</p>
                <?php else: ?>
                    <p>No devices in the database yet.</p>
                    <p>Install the Matter Binding Helper integration to contribute!</p>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="device-list">
                <?php foreach ($devices as $device): ?>
                    <div class="device-item">
                        <div class="device-info">
                            <h3>
                                <a href="device.php?id=<?= $device['id'] ?>">
                                    <?= htmlspecialchars($device['product_name'] ?? 'Unknown Product') ?>
                                </a>
                            </h3>
                            <div class="device-meta">
                                <?= htmlspecialchars($device['vendor_name'] ?? 'Unknown Vendor') ?>
                                &middot;
                                Vendor ID: <?= $device['vendor_id'] ?? 'N/A' ?>
                                &middot;
                                Product ID: <?= $device['product_id'] ?? 'N/A' ?>
                                &middot;
                                Seen <?= number_format($device['submission_count']) ?> time<?= $device['submission_count'] != 1 ? 's' : '' ?>
                            </div>
                        </div>
                        <div class="device-badges">
                            <?php if ($device['supports_binding']): ?>
                                <span class="badge badge-binding">Binding</span>
                            <?php endif; ?>
                            <span class="badge badge-endpoints"><?= $device['endpoint_count'] ?> endpoint<?= $device['endpoint_count'] != 1 ? 's' : '' ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <?php if ($totalPages > 1 && $search === ''): ?>
                <div class="pagination">
                    <?php if ($page > 1): ?>
                        <a href="?page=<?= $page - 1 ?>">&laquo; Prev</a>
                    <?php endif; ?>

                    <?php for ($i = max(1, $page - 2); $i <= min($totalPages, $page + 2); $i++): ?>
                        <?php if ($i === $page): ?>
                            <span class="current"><?= $i ?></span>
                        <?php else: ?>
                            <a href="?page=<?= $i ?>"><?= $i ?></a>
                        <?php endif; ?>
                    <?php endfor; ?>

                    <?php if ($page < $totalPages): ?>
                        <a href="?page=<?= $page + 1 ?>">Next &raquo;</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </main>

    <footer>
        <p>
            Data contributed by <a href="https://github.com/cedricziel/ha-matter-helper">Matter Binding Helper</a> users.
            <br>
            Privacy-focused: No personal data is collected.
        </p>
    </footer>
</body>
</html>
