<?php
// Daily backup of the database
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/lib.php';

const KEEP_DAYS = 30;
$dir = __DIR__ . '/data/backups';
if (!is_dir($dir)) mkdir($dir, 0700, true);

$file = $dir . '/agenda-' . date('Y-m-d') . '.sqlite';
if (is_file($file)) unlink($file);
db()->exec('VACUUM INTO ' . db()->quote($file));

foreach (glob($dir . '/agenda-*.sqlite') as $old) {
    if (filemtime($old) < time() - KEEP_DAYS * 86400) unlink($old);
}
echo 'backup saved: ' . basename($file) . "\n";
