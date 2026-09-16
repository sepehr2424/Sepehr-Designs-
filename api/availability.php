<?php
// GET /api/availability.php?date=YYYY-MM-DD
// Returns { "slots": ["12:00", "14:00", ...] } — the times still bookable on
// that date, with already-booked and already-passed times removed.

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response(['error' => 'method_not_allowed'], 405);
}

$date = $_GET['date'] ?? null;

if (!is_valid_date($date)) {
    json_response(['error' => 'invalid_date'], 400);
}

try {
    $pdo   = db();
    $taken = taken_slots($pdo, $date);
} catch (Throwable $e) {
    error_log('availability failed: ' . $e->getMessage());
    json_response(['error' => 'server_error'], 500);
}

json_response(['slots' => available_slots($date, $taken)]);
