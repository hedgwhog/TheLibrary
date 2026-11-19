<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

header('Content-Type: application/json');
use_device_timezone();

function reply(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function state(): array
{
    $db = db();
    return [
        'categories' => $db->query('SELECT * FROM categories ORDER BY name')->fetchAll(),
        'plans' => $db->query('SELECT * FROM plans ORDER BY date, start_time')->fetchAll(),
        'exceptions' => $db->query('SELECT * FROM plan_exceptions')->fetchAll(),
        'bucket' => $db->query('SELECT * FROM bucket ORDER BY id')->fetchAll(),
        'todos' => $db->query('SELECT * FROM todos ORDER BY deadline IS NULL, deadline, id')->fetchAll(),
    ];
}

function find_plan(int $id): array
{
    $st = db()->prepare('SELECT * FROM plans WHERE id = ?');
    $st->execute([$id]);
    $p = $st->fetch();
    if (!$p) throw new BadInput("plan #$id does not exist");
    return $p;
}

function category_id($tag): ?int
{
    if ($tag === null || $tag === '') return null;
    $st = db()->prepare('SELECT id FROM categories WHERE tag = ?');
    $st->execute([(string)$tag]);
    $id = $st->fetchColumn();
    if ($id === false) throw new BadInput("unknown category [$tag]");
    return (int)$id;
}

function find_todo(int $id): array
{
    $st = db()->prepare('SELECT * FROM todos WHERE id = ?');
    $st->execute([$id]);
    $t = $st->fetch();
    if (!$t) throw new BadInput("to do #$id does not exist");
    return $t;
}

function check_repeat($v, array $allowed): string
{
    if (!in_array($v, $allowed, true)) throw new BadInput('repeat must be one of: ' . implode(', ', $allowed));
    return $v;
}

function save_exception(int $planId, $date, array $e): void
{
    $date = check_date($date);
    $new = [null, null, null];
    if (!empty($e['new_date'])) {
        $new = [check_date($e['new_date']), check_time($e['new_start'] ?? null), check_time($e['new_end'] ?? null)];
        check_times($new[1], $new[2]);
    }
    db()->prepare('INSERT OR REPLACE INTO plan_exceptions (plan_id, date, new_date, new_start, new_end) VALUES (?, ?, ?, ?, ?)')->execute([$planId, $date, ...$new]);
}

function plan_values(array $in, array $current = []): array
{
    $value = fn(string $key, $default = null) => array_key_exists($key, $in) ? $in[$key] : ($current[$key] ?? $default);

    $allDay = (bool)$value('all_day', 0);
    $date = check_date($value('date'));
    $endDate = $value('end_date');
    $endDate = $endDate === null || $endDate === '' ? null : check_date($endDate);
    if ($endDate !== null && !$allDay) throw new BadInput('only all day plans can last several days');
    if ($endDate !== null && $endDate < $date) throw new BadInput('the last day is before the first day');
    if ($endDate === $date) $endDate = null;

    if ($allDay) {
        [$start, $end] = ['00:00', '24:00'];
    } else {
        $start = check_time($value('start_time'));
        $end = check_time($value('end_time'));
        check_times($start, $end);
    }

    if (array_key_exists('tag', $in)) {
        $categoryId = category_id($in['tag']);
    } else {
        $categoryId = $value('category_id');
        if ($categoryId !== null && !category_exists((int)$categoryId)) $categoryId = null;   // removed meanwhile
    }

    $until = $value('until_date');
    return [
        'title' => check_text($value('title', ''), 100, true),
        'category_id' => $categoryId === null ? null : (int)$categoryId,
        'location' => check_text($value('location', ''), 100),
        'notes' => check_notes($value('notes', '')),
        'date' => $date,
        'end_date' => $endDate,
        'all_day' => $allDay ? 1 : 0,
        'start_time' => $start,
        'end_time' => $end,
        'repeat_type' => check_repeat($value('repeat_type', 'none'), PLAN_REPEATS),
        'until_date' => $until === null || $until === '' ? null : check_date($until),
        'travel_minutes' => check_travel($value('travel_minutes', 0)),
        'return_minutes' => check_travel($value('return_minutes', 0)),
    ];
}

function category_exists(int $id): bool
{
    $st = db()->prepare('SELECT 1 FROM categories WHERE id = ?');
    $st->execute([$id]);
    return $st->fetchColumn() !== false;
}

function save_plan(array $values, ?int $updateId = null, ?int $restoreId = null): int
{
    $columns = array_keys($values);
    if ($updateId !== null) {
        $set = implode(', ', array_map(fn($column) => "$column = ?", $columns));
        db()->prepare("UPDATE plans SET $set WHERE id = ?")->execute([...array_values($values), $updateId]);
        return $updateId;
    }
    if ($restoreId !== null) {
        $columns[] = 'id';
        $values['id'] = $restoreId;
    }
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    db()->prepare('INSERT INTO plans (' . implode(', ', $columns) . ") VALUES ($placeholders)")->execute(array_values($values));
    return $restoreId ?? (int)db()->lastInsertId();
}

function check_times(string $start, string $end): void
{
    if ($end <= $start) throw new BadInput('end time must be after start time');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(['error' => 'POST only'], 405);
if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF'] ?? '')) reply(['error' => 'session expired, reload the page'], 403);

$in = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $in['action'] ?? '';
$db = db();

try {
    // login
    if ($action === 'login') {
        $user = $db->query('SELECT * FROM user LIMIT 1')->fetch();
        if (!$user) reply(['error' => 'no account yet, run: php setup.php'], 400);
        if ($user['locked_until'] > time()) {
            reply(['error' => 'too many wrong tries, wait ' . ($user['locked_until'] - time()) . ' seconds'], 429);
        }

        $ok = hash_equals($user['username'], (string)($in['username'] ?? '')) && password_verify((string)($in['password'] ?? ''), $user['password_hash']);
        if (!$ok) {
            $failed = $user['failed_logins'] + 1;
            $lock = $failed >= 5 ? time() + 300 : 0; // 5 wrong tries = 5 minutes locked
            $db->prepare('UPDATE user SET failed_logins = ?, locked_until = ? WHERE id = ?')
               ->execute([$lock ? 0 : $failed, $lock, $user['id']]);
            reply(['error' => 'login incorrect'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['last_login'] = $user['last_login'];
        $_SESSION['username'] = $user['username'];
        $db->prepare('UPDATE user SET failed_logins = 0, last_login = ? WHERE id = ?')->execute([date('Y-m-d H:i'), $user['id']]);
        reply(['ok' => true]);
    }

    if (!logged_in()) reply(['error' => 'not logged in'], 401);
    $result = [];

    switch ($action) {
        case 'state':
            break;

        case 'logout':
            $_SESSION = [];
            session_destroy();
            reply(['ok' => true]);

        // plans
        case 'plan_add':
            $result['id'] = save_plan(plan_values($in));
            break;

        case 'plan_edit': // only the fields that are sent change
            $plan = find_plan((int)($in['id'] ?? 0));
            $values = plan_values($in['fields'] ?? [], $plan);
            $db->beginTransaction();
            save_plan($values, $plan['id']);
            // skipped/moved dates that no longer fit the plan are removed
            $exceptions = $db->prepare('SELECT date FROM plan_exceptions WHERE plan_id = ?');
            $exceptions->execute([$plan['id']]);
            foreach ($exceptions->fetchAll(PDO::FETCH_COLUMN) as $date) {
                if (!occurs_on($values, $date)) {
                    $db->prepare('DELETE FROM plan_exceptions WHERE plan_id = ? AND date = ?')->execute([$plan['id'], $date]);
                }
            }
            $db->commit();
            break;

        case 'plan_rm':
            $plan = find_plan((int)($in['id'] ?? 0));
            $db->prepare('DELETE FROM plans WHERE id = ?')->execute([$plan['id']]);
            break;

        case 'plan_restore': // undo of rm
            $plan = $in['plan'] ?? [];
            $db->beginTransaction();
            save_plan(plan_values($plan), null, (int)($plan['id'] ?? 0));
            foreach (($in['exceptions'] ?? []) as $exception) save_exception((int)$plan['id'], $exception['date'] ?? null, $exception);
            $db->commit();
            break;

        case 'skip':
        case 'move':
            $p = find_plan((int)($in['id'] ?? 0));
            $date = check_date($in['date'] ?? null);
            if ($p['repeat_type'] === 'none') throw new BadInput("#{$p['id']} doesn't repeat, use edit instead");
            if (!occurs_on($p, $date)) throw new BadInput("#{$p['id']} doesn't happen on $date");
            if ($action === 'move' && empty($in['new_date'])) throw new BadInput('move needs a new date');
            save_exception($p['id'], $date, $action === 'move' ? $in : ['new_date' => null]);
            break;

        case 'exception_restore': // undo of skip/move
            $p = find_plan((int)($in['id'] ?? 0));
            $date = check_date($in['date'] ?? null);
            $db->prepare('DELETE FROM plan_exceptions WHERE plan_id = ? AND date = ?')->execute([$p['id'], $date]);
            if (!empty($in['previous'])) save_exception($p['id'], $date, $in['previous']);
            break;

        case 'stop':
            $p = find_plan((int)($in['id'] ?? 0));
            if ($p['repeat_type'] === 'none') throw new BadInput("#{$p['id']} doesn't repeat");
            $until = check_date($in['until'] ?? null);
            if ($until < $p['date']) throw new BadInput('that is before the series starts, use rm instead');
            $db->prepare('UPDATE plans SET until_date = ? WHERE id = ?')->execute([$until, $p['id']]);
            break;
            
        // Categories (tags)
        case 'cat_add':
        case 'cat_restore': // undo of cat rm
            $c = $action === 'cat_add' ? $in : ($in['category'] ?? []);
            $tag = check_text($c['tag'] ?? '', 3, true);
            if (!preg_match('/^[^\s\[\]]+$/u', $tag)) throw new BadInput('a tag cannot contain spaces or brackets');
            $border = $c['border'] ?? '';
            if (!in_array($border, BORDERS, true)) throw new BadInput('border must be one of: ' . implode(', ', BORDERS));
            $db->beginTransaction();
            try {
                $db->prepare('INSERT INTO categories (id, name, tag, border) VALUES (?, ?, ?, ?)')
                   ->execute([$action === 'cat_restore' ? (int)($c['id'] ?? 0) : null, check_text($c['name'] ?? '', 30, true), $tag, $border]);
            } catch (PDOException $e) {
                $db->rollBack();
                throw new BadInput("tag [$tag] is already used");
            }
            $result['id'] = (int)$db->lastInsertId();
            $set = $db->prepare('UPDATE plans SET category_id = ? WHERE id = ? AND category_id IS NULL');
            foreach (($in['plan_ids'] ?? []) as $pid) $set->execute([$result['id'], (int)$pid]);
            $db->commit();
            break;

        case 'cat_edit': 
            $id = category_id($in['tag'] ?? '');
            $newTag = check_text($in['new_tag'] ?? '', 3, true);
            if (!preg_match('/^[^\s\[\]]+$/u', $newTag)) throw new BadInput('a tag cannot contain spaces or brackets');
            $border = $in['border'] ?? '';
            if (!in_array($border, BORDERS, true)) throw new BadInput('border must be one of: ' . implode(', ', BORDERS));
            try {
                $db->prepare('UPDATE categories SET name = ?, tag = ?, border = ? WHERE id = ?')
                   ->execute([check_text($in['name'] ?? '', 30, true), $newTag, $border, $id]);
            } catch (PDOException $e) {
                throw new BadInput("tag [$newTag] is already used");
            }
            break;

        case 'cat_rm':
            $id = category_id($in['tag'] ?? '');
            $db->beginTransaction();
            $db->prepare('UPDATE plans SET category_id = NULL WHERE category_id = ?')->execute([$id]);
            $db->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
            $db->commit();
            break;

        // todo list
        case 'todo_add':
        case 'todo_restore': // undo
            $t = $action === 'todo_add' ? $in : ($in['todo'] ?? []);
            $deadline = ($t['deadline'] ?? null) === null ? null : check_date($t['deadline']); // null = no deadline
            $repeat = check_repeat($t['repeat_type'] ?? 'none', TODO_REPEATS);
            if ($deadline === null && $repeat !== 'none') throw new BadInput('a repeating to do needs a deadline');
            $db->prepare('INSERT OR REPLACE INTO todos (id, title, deadline, notes, repeat_type, created) VALUES (?, ?, ?, ?, ?, ?)')->execute([
                   $action === 'todo_restore' ? (int)($t['id'] ?? 0) : null,
                   check_text($t['title'] ?? '', 100, true),
                   $deadline,
                   check_notes($t['notes'] ?? ''),
                   $repeat,
                   $action === 'todo_restore' ? check_date($t['created'] ?? null) : date('Y-m-d'),
               ]);
            $result['id'] = (int)$db->lastInsertId();
            break;

        case 'todo_edit':
            $t = find_todo((int)($in['id'] ?? 0));
            $f = $in['fields'] ?? [];
            if (array_key_exists('title', $f))       
                $t['title'] = check_text($f['title'], 100, true);

            if (array_key_exists('deadline', $f))    
                $t['deadline'] = $f['deadline'] === null ? null : check_date($f['deadline']);

            if (array_key_exists('notes', $f))       
                $t['notes'] = check_notes($f['notes']);

            if (array_key_exists('repeat_type', $f)) 
                $t['repeat_type'] = check_repeat($f['repeat_type'], TODO_REPEATS);

            if ($t['deadline'] === null && $t['repeat_type'] !== 'none') throw new BadInput('a repeating to do needs a deadline');
            $db->prepare('UPDATE todos SET title = ?, deadline = ?, notes = ?, repeat_type = ? WHERE id = ?')->execute([$t['title'], $t['deadline'], $t['notes'], $t['repeat_type'], $t['id']]);
            break;

        case 'todo_done':
            $t = find_todo((int)($in['id'] ?? 0));
            if ($t['repeat_type'] === 'none') {
                $db->prepare('DELETE FROM todos WHERE id = ?')->execute([$t['id']]);
            } else { // repeating
                $result['next'] = next_date($t['deadline'], $t['repeat_type']);
                $db->prepare('UPDATE todos SET deadline = ? WHERE id = ?')->execute([$result['next'], $t['id']]);
            }
            break;

        case 'todo_rm': // undo of todo add
            $t = find_todo((int)($in['id'] ?? 0));
            $db->prepare('DELETE FROM todos WHERE id = ?')->execute([$t['id']]);
            break;

        //bucket list
        case 'bucket_add':
            $db->prepare('INSERT INTO bucket (title, notes, created) VALUES (?, ?, ?)')->execute([check_text($in['title'] ?? '', 100, true), check_notes($in['notes'] ?? ''), date('Y-m-d')]);
            break;

        case 'bucket_set':
            $status = $in['status'] ?? '';
            if (!in_array($status, ['completed', 'failed'], true)) throw new BadInput('bad status');
            $st = $db->prepare("UPDATE bucket SET status = ?, resolved = ? WHERE id = ? AND status = 'open'");
            $st->execute([$status, date('Y-m-d'), (int)($in['id'] ?? 0)]);
            if ($st->rowCount() === 0) throw new BadInput('that item does not exist or is already final');
            break;

        default:
            reply(['error' => 'unknown action'], 400);
    }
    reply(['ok' => true, 'state' => state()] + $result);
} catch (BadInput $e) {
    reply(['error' => $e->getMessage()], 400);
}