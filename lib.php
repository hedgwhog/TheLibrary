<?php
declare(strict_types=1);

// Settings
date_default_timezone_set('Europe/Stockholm'); // change to your preffered timezone

const DB_FILE = __DIR__ . '/data/agenda.sqlite';
const BORDERS = ['solid', 'dashed', 'dotted', 'double', 'thick'];
const PLAN_REPEATS = ['none', 'weekly', 'monthly', 'yearly'];
const TODO_REPEATS = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

const MAX_TRAVEL_MINUTES = 12 * 60;

if (PHP_SAPI !== 'cli') {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function logged_in(): bool
{
    return !empty($_SESSION['user_id']);
}


// Database
function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;

    if (!is_dir(dirname(DB_FILE))) mkdir(dirname(DB_FILE), 0700, true);
    $pdo = new PDO('sqlite:' . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON');

    create_tables($pdo);
    upgrade_old_database($pdo);
    return $pdo;
}

function create_tables(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            failed_logins INTEGER NOT NULL DEFAULT 0,
            locked_until INTEGER NOT NULL DEFAULT 0,
            last_login TEXT
        );
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            tag TEXT UNIQUE NOT NULL,
            border TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            category_id INTEGER REFERENCES categories(id),
            location TEXT NOT NULL DEFAULT '',
            notes TEXT NOT NULL DEFAULT '',
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            repeat_type TEXT NOT NULL DEFAULT 'none',
            until_date TEXT,
            travel_minutes INTEGER NOT NULL DEFAULT 0,
            return_minutes INTEGER NOT NULL DEFAULT 0,
            all_day INTEGER NOT NULL DEFAULT 0,
            end_date TEXT
        );
        CREATE TABLE IF NOT EXISTS plan_exceptions (
            id INTEGER PRIMARY KEY,
            plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            new_date TEXT,
            new_start TEXT,
            new_end TEXT,
            UNIQUE (plan_id, date)
        );
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            deadline TEXT,
            notes TEXT NOT NULL DEFAULT '',
            repeat_type TEXT NOT NULL DEFAULT 'none',
            created TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bucket (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            notes TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'open',
            created TEXT NOT NULL,
            resolved TEXT
        );
    ");
}

// Databases made by older versions miss newer columns
function upgrade_old_database(PDO $pdo): void
{
    if (!table_has_column($pdo, 'todos', 'repeat_type')) {
        $pdo->exec("ALTER TABLE todos ADD COLUMN repeat_type TEXT NOT NULL DEFAULT 'none'");
    }

    $newPlanColumns = [
        'travel_minutes' => 'INTEGER NOT NULL DEFAULT 0',
        'return_minutes' => 'INTEGER NOT NULL DEFAULT 0',
        'all_day' => 'INTEGER NOT NULL DEFAULT 0',
        'end_date' => 'TEXT',
    ];
    foreach ($newPlanColumns as $column => $definition) {
        if (!table_has_column($pdo, 'plans', $column)) {
            $pdo->exec("ALTER TABLE plans ADD COLUMN $column $definition");
        }
    }

    if (column_is_required($pdo, 'todos', 'deadline')) {
        $pdo->exec("
            BEGIN;
            CREATE TABLE todos_new (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                deadline TEXT,
                notes TEXT NOT NULL DEFAULT '',
                repeat_type TEXT NOT NULL DEFAULT 'none',
                created TEXT NOT NULL
            );
            INSERT INTO todos_new (id, title, deadline, notes, repeat_type, created)
                SELECT id, title, deadline, notes, repeat_type, created FROM todos;
            DROP TABLE todos;
            ALTER TABLE todos_new RENAME TO todos;
            COMMIT;
        ");
    }
}

function table_columns(PDO $pdo, string $table): array
{
    return $pdo->query("PRAGMA table_info($table)")->fetchAll();
}

function table_has_column(PDO $pdo, string $table, string $column): bool
{
    return in_array($column, array_column(table_columns($pdo, $table), 'name'), true);
}

function column_is_required(PDO $pdo, string $table, string $column): bool
{
    foreach (table_columns($pdo, $table) as $info) {
        if ($info['name'] === $column) return (int)$info['notnull'] === 1;
    }
    return false;
}


// input check
class BadInput extends Exception {}

function check_date($value): string
{
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        throw new BadInput('bad date');
    }
    [$year, $month, $day] = array_map('intval', explode('-', $value));
    if (!checkdate($month, $day, $year)) {
        throw new BadInput("$value is not a real date");
    }
    return $value;
}

function check_time($value): string
{
    if ($value === '24:00') return $value;
    if (!is_string($value) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $value)) {
        throw new BadInput('bad time');
    }
    return $value;
}

function check_text($value, int $maxLength, bool $required = false): string
{
    $text = trim((string)($value ?? ''));
    if ($required && $text === '') {
        throw new BadInput('text missing');
    }
    $characterCount = preg_match_all('/./su', $text); // counts characters, not bytes
    if ($characterCount > $maxLength) {
        throw new BadInput("text longer than $maxLength characters");
    }
    return $text;
}

function check_travel($value): int
{
    $isWholeNumber = is_int($value) || (is_string($value) && ctype_digit($value));
    if (!$isWholeNumber) {
        throw new BadInput('travel time must be whole minutes');
    }
    $minutes = (int)$value;
    if ($minutes < 0 || $minutes > MAX_TRAVEL_MINUTES) {
        throw new BadInput('travel time must be between 0 and 12 hours');
    }
    return $minutes;
}

function check_notes($value): string
{
    $lines = preg_split('/\r\n|\r|\n/', (string)($value ?? ''));
    $lines = array_values(array_filter(array_map('trim', $lines), fn($line) => $line !== ''));
    return check_text(implode("\n", $lines), 2000);
}

function use_device_timezone(): void
{
    $timezone = $_SERVER['HTTP_X_TIMEZONE'] ?? '';
    if ($timezone !== '' && in_array($timezone, timezone_identifiers_list(), true)) {
        date_default_timezone_set($timezone);
    }
}

// Dates
function year_of(string $date): int { return (int)substr($date, 0, 4); }
function month_of(string $date): int { return (int)substr($date, 5, 2); }
function day_of(string $date): int { return (int)substr($date, 8, 2); }

function weekday_of(string $date): int
{
    return (int)date('N', strtotime($date));
}

function days_in_month(int $year, int $month): int
{
    return (int)date('t', mktime(0, 0, 0, $month, 1, $year));
}

function date_in_month(int $year, int $month, int $day): string
{
    return sprintf('%04d-%02d-%02d', $year, $month, min($day, days_in_month($year, $month)));
}

function occurs_on(array $plan, string $date): bool
{
    $beforeStart = $date < $plan['date'];
    $afterStop = $plan['until_date'] && $date > $plan['until_date'];
    if ($beforeStart || $afterStop) return false;

    switch ($plan['repeat_type']) {
        case 'weekly':
            return weekday_of($date) === weekday_of($plan['date']);
        case 'monthly':
            return $date === date_in_month(year_of($date), month_of($date), day_of($plan['date']));
        case 'yearly':
            return substr($date, 5) === substr($plan['date'], 5);
        default:
            return $date === $plan['date'];
    }
}

function next_date(string $date, string $repeat): string
{
    $year = year_of($date);
    $month = month_of($date);
    $day = day_of($date);

    switch ($repeat) {
        case 'daily':
            return date('Y-m-d', strtotime('+1 day', strtotime($date)));
        case 'weekly':
            return date('Y-m-d', strtotime('+7 days', strtotime($date)));
        case 'yearly':
            return date_in_month($year + 1, $month, $day);
        default:
            return $month === 12 ? date_in_month($year + 1, 1, $day) : date_in_month($year, $month + 1, $day);
    }
}