<?php

/**
 * Matter Survey API - Telemetry Submission Endpoint
 *
 * Receives anonymized device data from Home Assistant integrations
 * and stores it in the database for building the device index.
 *
 * POST /api/submit
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "installation_id": "uuid",
 *   "schema_version": 1,
 *   "devices": [
 *     {
 *       "vendor_id": 1234,
 *       "vendor_name": "Acme Corp",
 *       "product_id": 5678,
 *       "product_name": "Smart Light",
 *       "hardware_version": "1.0",
 *       "software_version": "2.1.0",
 *       "endpoints": [
 *         {
 *           "endpoint_id": 1,
 *           "device_types": [{"id": 256, "revision": 2}],
 *           "clusters": [6, 8, 30],
 *           "has_binding_cluster": true
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';

use MatterSurvey\TelemetryHandler;

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get and validate JSON payload
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$payload = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit;
}

// Rate limiting: Hash the IP for tracking without storing PII
$ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');

// Basic rate limiting check (simple in-memory for now)
// In production, use Redis or similar
$rateLimitFile = sys_get_temp_dir() . '/matter-survey-ratelimit-' . $ipHash;
$now = time();
$window = 60; // 1 minute window
$maxRequests = 10; // Max 10 requests per minute

if (file_exists($rateLimitFile)) {
    $data = json_decode(file_get_contents($rateLimitFile), true);
    if ($data && ($now - $data['start']) < $window) {
        if ($data['count'] >= $maxRequests) {
            http_response_code(429);
            echo json_encode(['error' => 'Rate limit exceeded. Please try again later.']);
            exit;
        }
        $data['count']++;
    } else {
        $data = ['start' => $now, 'count' => 1];
    }
} else {
    $data = ['start' => $now, 'count' => 1];
}
file_put_contents($rateLimitFile, json_encode($data));

// Process the submission
try {
    $handler = new TelemetryHandler();
    $result = $handler->processSubmission($payload, $ipHash);

    if ($result['success']) {
        http_response_code(200);
        echo json_encode([
            'status' => 'ok',
            'message' => $result['message'],
            'devices_processed' => $result['devices_processed'] ?? 0,
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'error' => $result['error'],
        ]);
    }
} catch (\Exception $e) {
    error_log('Matter Survey API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Internal server error',
    ]);
}
