<?php
// Shared bootstrap for the booking API and the admin dashboard.
// Loads config, opens the database, ensures the schema exists, and provides
// the slot/availability logic used by both the public API and the admin area.

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

date_default_timezone_set(TIME_ZONE);

/**
 * Opens a PDO connection. Exceptions are thrown so callers can decide how to
 * respond; nothing about the database is ever echoed to the client.
 */
function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        ensure_schema($pdo);
    }

    return $pdo;
}

/**
 * Creates the tables on first run so there is no manual SQL import step.
 * Safe to call repeatedly.
 */
function ensure_schema(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS bookings (
            id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            booking_date  DATE NOT NULL,
            start_time    TIME NOT NULL,
            name          VARCHAR(190) NOT NULL,
            email         VARCHAR(190) NOT NULL,
            phone         VARCHAR(60) NULL,
            message       TEXT NULL,
            status        VARCHAR(20) NOT NULL DEFAULT "confirmed",
            created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_slot (booking_date, start_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS admin_user (
            id             TINYINT UNSIGNED NOT NULL PRIMARY KEY,
            password_hash  VARCHAR(255) NOT NULL,
            created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function json_response(array $body, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function is_valid_date(?string $value): bool
{
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }
    [$y, $m, $d] = array_map('intval', explode('-', $value));
    return checkdate($m, $d, $y);
}

function is_valid_slot(?string $value): bool
{
    return is_string($value) && in_array($value, SLOTS, true);
}

/**
 * Today's date and current time, and the last bookable date — all in
 * Europe/Stockholm regardless of the server's own timezone.
 */
function booking_window(): array
{
    $now = new DateTimeImmutable('now', new DateTimeZone(TIME_ZONE));

    return [
        'today'    => $now->format('Y-m-d'),
        'now_hm'   => $now->format('H:i'),
        'max_date' => $now->modify('+' . BOOKING_WINDOW_DAYS . ' days')->format('Y-m-d'),
    ];
}

/**
 * The slots still bookable on $date: excludes times already taken, excludes
 * times that have already passed if $date is today, and returns nothing at all
 * for dates outside the bookable window.
 *
 * @param string[] $taken times already booked, as "HH:MM"
 * @return string[]
 */
function available_slots(string $date, array $taken): array
{
    ['today' => $today, 'now_hm' => $nowHm, 'max_date' => $maxDate] = booking_window();

    if ($date < $today || $date > $maxDate) {
        return [];
    }

    $slots = array_values(array_diff(SLOTS, $taken));

    if ($date === $today) {
        $slots = array_values(array_filter($slots, static fn($t) => $t > $nowHm));
    }

    return $slots;
}

/**
 * @return string[] times already booked on $date, as "HH:MM"
 */
function taken_slots(PDO $pdo, string $date): array
{
    $stmt = $pdo->prepare(
        'SELECT start_time FROM bookings WHERE booking_date = ? AND status <> "cancelled"'
    );
    $stmt->execute([$date]);

    return array_map(
        static fn($row) => substr((string) $row['start_time'], 0, 5),
        $stmt->fetchAll()
    );
}

/**
 * Sends the booking notification through Resend. Returns false (without
 * throwing) if no API key is configured or the request fails — a booking is
 * never rolled back because an email didn't go out.
 */
function send_notification_email(array $booking): bool
{
    if (RESEND_API_KEY === '') {
        return false;
    }

    $lines = [
        'New booking received.',
        '',
        'Name: ' . $booking['name'],
        'Email: ' . $booking['email'],
        'Phone: ' . ($booking['phone'] !== null && $booking['phone'] !== '' ? $booking['phone'] : '—'),
        'Date: ' . $booking['date'],
        'Time: ' . $booking['time'] . ' (Europe/Stockholm)',
        'Message: ' . ($booking['message'] !== null && $booking['message'] !== '' ? $booking['message'] : '—'),
    ];

    $payload = json_encode([
        'from'    => RESEND_FROM,
        'to'      => [NOTIFY_EMAIL],
        'subject' => sprintf('New booking: %s — %s %s', $booking['name'], $booking['date'], $booking['time']),
        'text'    => implode("\n", $lines),
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . RESEND_API_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => $payload,
    ]);

    $response = curl_exec($ch);
    $status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $response !== false && $status >= 200 && $status < 300;
}
