<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$config = [
    'csrf' => $_SESSION['csrf'],
    'loggedIn' => logged_in(),
    'lastLogin' => $_SESSION['last_login'] ?? null,
    'username' => $_SESSION['username'] ?? null,
];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Index</title>
<meta name="description" content="A terminal style planner">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="agenda">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=no">
<script>
  try { document.documentElement.dataset.theme = localStorage.getItem('theme') || 'auto'; }
  catch { document.documentElement.dataset.theme = 'auto'; }
</script>
<link rel="stylesheet" href="style.css">
</head>
<body>
<main id="view"></main>
<div id="grip" role="separator" aria-orientation="horizontal" aria-label="Drag to resize the terminal" tabindex="0" title="drag to resize, double-click to reset"><span>═══</span></div>
<div id="out" aria-live="polite"></div>
<div id="prompt">
  <label id="ps" for="cmd">&gt;</label>
  <div id="field">
    <div id="ghost" aria-hidden="true"></div>
    <input id="cmd" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
  </div>
</div>
<div id="chips"></div>
<footer id="status"></footer>
<script>window.APP = <?= json_encode($config) ?>;</script>
<script src="app.js"></script>
</body>
</html>
