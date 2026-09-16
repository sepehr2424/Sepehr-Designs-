<?php
// POST /api/book.php   { date, time, name, email, message }
// Creates a booking. The UNIQUE(booking_date, start_time) index is what
// actually prevents double-bookings — if two people submit the same slot at
// the same moment, MySQL rejects the second one and we report slot_taken.

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}

$raw  = file_get_contents('php://input');
$body = json_decode($raw ?: '', true);

if (!is_array($body)) {
    json_response(['error' => 'invalid_body'], 400);
}

$date    = isset($body['date']) && is_string($body['date']) ? trim($body['date']) : '';
$time    = isset($body['time']) && is_string($body['time']) ? trim($body['time']) : '';
$name    = isset($body['name']) && is_string($body['name']) ? trim($body['name']) : '';
$email   = isset($body['email']) && is_string($body['email']) ? trim($body['email']) : '';
$phone   = isset($body['phone']) && is_string($body['phone']) ? trim($body['phone']) : '';
$message = isset($body['message']) && is_string($body['message']) ? trim($body['message']) : '';

if (!is_valid_date($date) || !is_valid_slot($time)) {
    json_response(['error' => 'invalid_slot'], 400);
}

if ($name === '' || mb_strlen($name) > 190) {
    json_response(['error' => 'missing_fields'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    json_response(['error' => 'missing_fields'], 400);
}

// Re-check server-side that this slot is even theoretically bookable, so a
// tampered or stale request can't book a past date or an invalid time.
if (!in_array($time, available_slots($date, []), true)) {
    json_response(['error' => 'slot_unavailable'], 400);
}

$phoneValue   = $phone !== '' ? $phone : null;
$messageValue = $message !== '' ? $message : null;

try {
    $pdo = db();

    $stmt = $pdo->prepare(
        'INSERT INTO bookings (booking_date, start_time, name, email, phone, message)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$date, $time, $name, $email, $phoneValue, $messageValue]);
} catch (PDOException $e) {
    // 23000 = integrity constraint violation, i.e. a row already exists for
    // this slot. That row may be a cancelled booking, in which case the slot
    // is genuinely free again and this visitor should be allowed to take it.
    //
    // The "AND status = 'cancelled'" makes this an atomic compare-and-swap:
    // if two people race for the same freed slot, only the first UPDATE
    // matches a cancelled row — the second sees 0 affected rows and is
    // correctly told the slot is taken.
    if ($e->getCode() !== '23000') {
        error_log('booking insert failed: ' . $e->getMessage());
        json_response(['error' => 'server_error'], 500);
    }

    try {
        $reclaim = $pdo->prepare(
            'UPDATE bookings
                SET name = ?, email = ?, phone = ?, message = ?,
                    status = "confirmed", created_at = CURRENT_TIMESTAMP
              WHERE booking_date = ? AND start_time = ? AND status = "cancelled"'
        );
        $reclaim->execute([$name, $email, $phoneValue, $messageValue, $date, $time]);

        if ($reclaim->rowCount() !== 1) {
            json_response(['error' => 'slot_taken'], 409);
        }
    } catch (Throwable $inner) {
        error_log('booking reclaim failed: ' . $inner->getMessage());
        json_response(['error' => 'server_error'], 500);
    }
} catch (Throwable $e) {
    error_log('booking failed: ' . $e->getMessage());
    json_response(['error' => 'server_error'], 500);
}

// The booking is already committed at this point; a failed email must not
// turn a successful booking into an error for the visitor.
send_notification_email([
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone,
    'date'    => $date,
    'time'    => $time,
    'message' => $message,
]);

json_response(['ok' => true]);
