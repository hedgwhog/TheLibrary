<?php
// Create (or reset) the one account
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/lib.php';

$username = trim(readline('username: '));
echo 'password: ';
system('stty -echo');
$password = trim((string)fgets(STDIN));
system('stty echo');
echo "\n";

if ($username === '' || strlen($password) < 8) {
    exit("username required and password must be at least 8 characters\n");
}

db()->exec('DELETE FROM user');
db()->prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)')
    ->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
echo "account '$username' is ready\n";
