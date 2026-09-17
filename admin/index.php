<?php
// Admin dashboard — private booking management.
//
// Authentication is entirely server-side: a password hash stored in the
// database (never in any file the browser can read), verified with PHP's
// password_verify, and a PHP session cookie. Nothing here can be bypassed by
// editing JavaScript in the browser, because the browser never receives any
// booking data until the session check below has passed.

declare(strict_types=1);

require_once __DIR__ . '/../api/_bootstrap.php';

// Harden the session cookie explicitly — the server's own defaults for these
// are weak (httponly and secure both default to Off on this host).
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

// Sign-in is kept for 30 days (instead of ending when the browser closes) so
// a home-screen shortcut opens straight into the dashboard instead of asking
// for the password every time. session.gc_maxlifetime is raised to match,
// since the cookie surviving is pointless if the server deletes the session
// data first.
const ADMIN_SESSION_LIFETIME = 60 * 60 * 24 * 30;
ini_set('session.gc_maxlifetime', (string) ADMIN_SESSION_LIFETIME);

session_set_cookie_params([
    'lifetime' => ADMIN_SESSION_LIFETIME,
    'path'     => '/',
    'httponly' => true,
    'secure'   => $https,
    'samesite' => 'Lax',
]);
session_name('sd_admin');
session_start();

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_ok(): bool
{
    return isset($_POST['csrf'], $_SESSION['csrf'])
        && is_string($_POST['csrf'])
        && hash_equals($_SESSION['csrf'], $_POST['csrf']);
}

function admin_exists(PDO $pdo): bool
{
    return (bool) $pdo->query('SELECT 1 FROM admin_user WHERE id = 1')->fetchColumn();
}

function is_logged_in(): bool
{
    return !empty($_SESSION['admin_authed']);
}

function redirect(string $to): void
{
    header('Location: ' . $to);
    exit;
}

try {
    $pdo = db();
} catch (Throwable $e) {
    error_log('admin db connect failed: ' . $e->getMessage());
    http_response_code(500);
    echo 'Database unavailable.';
    exit;
}

$error   = '';
$notice  = '';
$hasAdmin = admin_exists($pdo);

// ---------------------------------------------------------------------------
// POST handling
// ---------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $action = $_POST['action'] ?? '';

    if (!csrf_ok()) {
        $error = 'Your session expired. Please try again.';
    } elseif ($action === 'setup' && !$hasAdmin) {
        // First-run password creation, gated by the one-time token from config.php
        $token    = $_POST['setup_token'] ?? '';
        $password = $_POST['password'] ?? '';
        $confirm  = $_POST['password_confirm'] ?? '';

        if (!is_string($token) || !hash_equals(ADMIN_SETUP_TOKEN, $token)) {
            $error = 'Invalid setup token.';
        } elseif (!is_string($password) || strlen($password) < 10) {
            $error = 'Choose a password of at least 10 characters.';
        } elseif ($password !== $confirm) {
            $error = 'The two passwords do not match.';
        } else {
            $stmt = $pdo->prepare('INSERT INTO admin_user (id, password_hash) VALUES (1, ?)');
            $stmt->execute([password_hash($password, PASSWORD_DEFAULT)]);
            session_regenerate_id(true);
            $_SESSION['admin_authed'] = true;
            redirect('./');
        }
    } elseif ($action === 'login' && $hasAdmin) {
        $password = $_POST['password'] ?? '';
        $hash     = (string) $pdo->query('SELECT password_hash FROM admin_user WHERE id = 1')->fetchColumn();

        if (is_string($password) && $password !== '' && password_verify($password, $hash)) {
            session_regenerate_id(true);
            $_SESSION['admin_authed'] = true;
            redirect('./');
        }
        // Deliberately vague, and slowed slightly to blunt brute forcing.
        usleep(400000);
        $error = 'Incorrect password.';
    } elseif ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        redirect('./');
    } elseif (is_logged_in() && in_array($action, ['confirm', 'cancel', 'delete'], true)) {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

        if ($id === false || $id === null) {
            $error = 'Unknown booking.';
        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
            $stmt->execute([$id]);
            $notice = 'Booking deleted.';
        } else {
            $status = $action === 'confirm' ? 'confirmed' : 'cancelled';
            $stmt = $pdo->prepare('UPDATE bookings SET status = ? WHERE id = ?');
            $stmt->execute([$status, $id]);
            $notice = $action === 'confirm' ? 'Booking marked as confirmed.' : 'Booking cancelled.';
        }
    }
}

// ---------------------------------------------------------------------------
// Data for the dashboard
// ---------------------------------------------------------------------------

$filter    = $_GET['filter'] ?? 'all';
$validFilters = ['all', 'upcoming', 'today', 'cancelled', 'completed'];
if (!in_array($filter, $validFilters, true)) {
    $filter = 'all';
}

$upcoming = [];
$past     = [];
$counts   = array_fill_keys($validFilters, 0);

if (is_logged_in()) {
    $window = booking_window();
    $nowSql = (new DateTimeImmutable('now', new DateTimeZone(TIME_ZONE)))->format('Y-m-d H:i:s');

    $rows = $pdo->query(
        'SELECT id, booking_date, start_time, name, email, phone, message, status, created_at
         FROM bookings ORDER BY booking_date ASC, start_time ASC'
    )->fetchAll();

    foreach ($rows as $row) {
        $row['is_past']      = ($row['booking_date'] . ' ' . $row['start_time']) <= $nowSql;
        $row['is_today']     = $row['booking_date'] === $window['today'];
        $row['is_cancelled'] = $row['status'] === 'cancelled';
        $row['is_completed'] = $row['is_past'] && !$row['is_cancelled'];
        $row['is_upcoming']  = !$row['is_past'] && !$row['is_cancelled'];

        $counts['all']++;
        if ($row['is_upcoming'])  $counts['upcoming']++;
        if ($row['is_today'])     $counts['today']++;
        if ($row['is_cancelled']) $counts['cancelled']++;
        if ($row['is_completed']) $counts['completed']++;

        $keep = match ($filter) {
            'upcoming'  => $row['is_upcoming'],
            'today'     => $row['is_today'],
            'cancelled' => $row['is_cancelled'],
            'completed' => $row['is_completed'],
            default     => true,
        };

        if (!$keep) {
            continue;
        }

        if ($row['is_past'] || $row['is_cancelled']) {
            $past[] = $row;
        } else {
            $upcoming[] = $row;
        }
    }

    // Most recent first among past bookings; soonest first among upcoming.
    $past = array_reverse($past);
}

$token = csrf_token();

/**
 * Renders one booking as a row/card.
 */
function render_booking(array $b, string $token): void
{
    $statusClass = $b['is_cancelled'] ? 'cancelled' : ($b['is_completed'] ? 'completed' : 'confirmed');
    $statusLabel = $b['is_cancelled'] ? 'Cancelled' : ($b['is_completed'] ? 'Completed' : 'Confirmed');
    ?>
    <article class="booking">
        <div class="booking__when">
            <span class="booking__date"><?= e($b['booking_date']) ?></span>
            <span class="booking__time"><?= e(substr((string) $b['start_time'], 0, 5)) ?></span>
        </div>

        <div class="booking__who">
            <h3><?= e($b['name']) ?></h3>
            <a class="booking__email" href="mailto:<?= e($b['email']) ?>"><?= e($b['email']) ?></a>
            <p class="booking__phone">
                <?= $b['phone'] !== null && $b['phone'] !== '' ? e($b['phone']) : '—' ?>
            </p>
            <?php if (!empty($b['message'])): ?>
                <p class="booking__message"><?= nl2br(e($b['message'])) ?></p>
            <?php endif; ?>
        </div>

        <div class="booking__meta">
            <span class="badge badge--<?= $statusClass ?>"><?= $statusLabel ?></span>
        </div>

        <div class="booking__actions">
            <?php if ($b['is_cancelled']): ?>
                <form method="post">
                    <input type="hidden" name="csrf" value="<?= e($token) ?>">
                    <input type="hidden" name="id" value="<?= (int) $b['id'] ?>">
                    <button type="submit" name="action" value="confirm" class="btn btn--ghost">Restore</button>
                </form>
            <?php else: ?>
                <form method="post">
                    <input type="hidden" name="csrf" value="<?= e($token) ?>">
                    <input type="hidden" name="id" value="<?= (int) $b['id'] ?>">
                    <button type="submit" name="action" value="cancel" class="btn btn--ghost">Cancel</button>
                </form>
            <?php endif; ?>

            <form method="post" onsubmit="return confirm('Delete this booking permanently?');">
                <input type="hidden" name="csrf" value="<?= e($token) ?>">
                <input type="hidden" name="id" value="<?= (int) $b['id'] ?>">
                <button type="submit" name="action" value="delete" class="btn btn--danger">Delete</button>
            </form>
        </div>
    </article>
    <?php
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Bookings — Admin</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="icon" href="../favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#050506">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin">

<?php if (!$hasAdmin): ?>
  <?php
    $setupToken = $_GET['setup'] ?? '';
    $tokenOk = is_string($setupToken) && $setupToken !== '' && hash_equals(ADMIN_SETUP_TOKEN, $setupToken);
  ?>
  <main class="auth">
    <div class="auth__card">
      <p class="tag">Admin</p>
      <h1 class="auth__title">First-time setup</h1>

      <?php if ($tokenOk): ?>
        <p class="auth__sub">Choose the password you'll use to sign in from now on.</p>

        <?php if ($error !== ''): ?><p class="alert alert--error"><?= e($error) ?></p><?php endif; ?>

        <form method="post" class="auth__form">
          <input type="hidden" name="csrf" value="<?= e($token) ?>">
          <input type="hidden" name="setup_token" value="<?= e($setupToken) ?>">
          <label for="password">New password (min. 10 characters)</label>
          <input type="password" id="password" name="password" required minlength="10" autocomplete="new-password">
          <label for="password_confirm">Repeat password</label>
          <input type="password" id="password_confirm" name="password_confirm" required minlength="10" autocomplete="new-password">
          <button type="submit" name="action" value="setup" class="btn btn--primary">Create password</button>
        </form>
      <?php else: ?>
        <p class="auth__sub">
          No admin password has been set yet. Open this page with your one-time
          setup link — the token is in your <code>config.php</code>:
        </p>
        <p class="auth__hint"><code>/admin/?setup=YOUR_TOKEN</code></p>
      <?php endif; ?>
    </div>
  </main>

<?php elseif (!is_logged_in()): ?>
  <main class="auth">
    <div class="auth__card">
      <p class="tag">Admin</p>
      <h1 class="auth__title">Sign in</h1>

      <?php if ($error !== ''): ?><p class="alert alert--error"><?= e($error) ?></p><?php endif; ?>

      <form method="post" class="auth__form">
        <input type="hidden" name="csrf" value="<?= e($token) ?>">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" autofocus>
        <button type="submit" name="action" value="login" class="btn btn--primary">Sign in</button>
      </form>
    </div>
  </main>

<?php else: ?>
  <header class="admin__bar">
    <div class="admin__bar-inner">
      <a href="../" class="admin__brand">Sepehr<span>.</span></a>
      <span class="admin__label">Bookings</span>
      <form method="post" class="admin__logout">
        <input type="hidden" name="csrf" value="<?= e($token) ?>">
        <button type="submit" name="action" value="logout" class="btn btn--ghost">Sign out</button>
      </form>
    </div>
  </header>

  <main class="admin__main">
    <?php if ($notice !== ''): ?><p class="alert alert--success"><?= e($notice) ?></p><?php endif; ?>
    <?php if ($error !== ''): ?><p class="alert alert--error"><?= e($error) ?></p><?php endif; ?>

    <nav class="filters" aria-label="Filter bookings">
      <?php foreach ($validFilters as $f): ?>
        <a class="filters__btn<?= $f === $filter ? ' is-active' : '' ?>" href="?filter=<?= e($f) ?>">
          <?= e(ucfirst($f)) ?>
          <span class="filters__count"><?= (int) $counts[$f] ?></span>
        </a>
      <?php endforeach; ?>
    </nav>

    <?php if (empty($upcoming) && empty($past)): ?>
      <div class="empty">
        <h2>No bookings here yet</h2>
        <p>
          <?= $counts['all'] === 0
              ? 'When someone books a call from your website, it will show up here.'
              : 'Nothing matches this filter — try another one.' ?>
        </p>
      </div>
    <?php endif; ?>

    <?php if (!empty($upcoming)): ?>
      <section class="group">
        <h2 class="group__title">Upcoming</h2>
        <div class="group__list">
          <?php foreach ($upcoming as $b) render_booking($b, $token); ?>
        </div>
      </section>
    <?php endif; ?>

    <?php if (!empty($past)): ?>
      <section class="group">
        <h2 class="group__title">Past &amp; cancelled</h2>
        <div class="group__list">
          <?php foreach ($past as $b) render_booking($b, $token); ?>
        </div>
      </section>
    <?php endif; ?>
  </main>
<?php endif; ?>

</body>
</html>
